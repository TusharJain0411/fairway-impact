const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const Charity = require("../models/Charity");

const planPrices = {
  monthly: 1200,
  yearly: 12000,
};

const getRenewalDate = (plan) => {
  const renewalDate = new Date();

  if (plan === "monthly") {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }

  return renewalDate;
};

// POST /api/subscriptions/create
const createSubscription = async (req, res) => {
  try {
    const { plan, charityId, charityContributionPercent = 10 } = req.body;

    if (!plan || !charityId) {
      return res.status(400).json({
        success: false,
        message: "Plan and charity are required.",
      });
    }

    if (!planPrices[plan]) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid subscription plan.",
      });
    }

    if (
      Number(charityContributionPercent) < 10 ||
      Number(charityContributionPercent) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Charity contribution must be between 10% and 100%.",
      });
    }

    const charity = await Charity.findOne({
      _id: charityId,
      isActive: true,
    });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Selected charity is not available.",
      });
    }

    const activeSubscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
    });

    if (activeSubscription) {
      return res.status(409).json({
        success: false,
        message: "You already have an active subscription.",
      });
    }

    const subscription = await Subscription.create({
      user: req.user._id,
      charity: charity._id,
      plan,
      amount: planPrices[plan],
      charityContributionPercent: Number(charityContributionPercent),
      status: "pending",
      renewalDate: getRenewalDate(plan),
    });

    const payment = await Payment.create({
      user: req.user._id,
      subscription: subscription._id,
      amount: planPrices[plan],
      status: "created",
    });

    // Keep user preference ready for dashboard display
    req.user.selectedCharity = charity._id;
    req.user.charityContributionPercent = Number(charityContributionPercent);
    await req.user.save();

    res.status(201).json({
      success: true,
      message: "Subscription created. Complete UPI payment to activate it.",
      subscription,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create subscription.",
    });
  }
};

// GET /api/subscriptions/my-subscription
const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: { $in: ["active", "pending"] },
    })
      .populate("charity", "name category image")
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found.",
      });
    }

    const payment = await Payment.findOne({
      subscription: subscription._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      subscription,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch subscription.",
    });
  }
};

module.exports = {
  createSubscription,
  getMySubscription,
};
