const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");

// POST /api/payments/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: req.user._id,
      status: "pending",
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Pending subscription not found.",
      });
    }

    const payment = await Payment.findOne({
      subscription: subscription._id,
      user: req.user._id,
      status: { $in: ["created", "pending"] },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(payment.amount * 100), // Razorpay uses paise
      currency: "INR",
      receipt: `sub_${subscription._id.toString().slice(-20)}`,
    });

    payment.gatewayOrderId = order.id;
    payment.status = "pending";
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Razorpay order created.",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      subscriptionId: subscription._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create payment order.",
    });
  }
};

// POST /api/payments/verify
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      subscriptionId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (
      !subscriptionId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required.",
      });
    }

    const payment = await Payment.findOne({
      subscription: subscriptionId,
      user: req.user._id,
      gatewayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found.",
      });
    }

    // Use the server-stored order ID, not a client-provided order ID
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${payment.gatewayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    const startDate = new Date();
    const renewalDate = new Date(startDate);

    if (subscription.plan === "monthly") {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    payment.gatewayPaymentId = razorpay_payment_id;
    payment.status = "success";

    subscription.status = "active";
    subscription.startDate = startDate;
    subscription.renewalDate = renewalDate;

    await Promise.all([payment.save(), subscription.save()]);

    res.status(200).json({
      success: true,
      message: "Payment verified. Membership is now active.",
      subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
