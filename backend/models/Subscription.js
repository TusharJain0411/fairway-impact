const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    charity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      required: true,
    },

    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    charityContributionPercent: {
      type: Number,
      required: true,
      min: 10,
      max: 100,
    },

    status: {
      type: String,
      enum: ["pending", "active", "cancelled", "lapsed"],
      default: "pending",
    },

    startDate: {
      type: Date,
      default: null,
    },

    renewalDate: {
      type: Date,
      default: null,
    },

    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);
