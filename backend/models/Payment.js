const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    method: {
      type: String,
      enum: ["upi"],
      default: "upi",
    },

    provider: {
      type: String,
      default: "razorpay",
    },

    gatewayOrderId: {
      type: String,
      default: null,
    },

    gatewayPaymentId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["created", "pending", "success", "failed", "refunded"],
      default: "created",
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
