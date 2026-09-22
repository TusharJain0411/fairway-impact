const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    drawEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DrawEntry",
      required: true,
    },

    matchCount: {
      type: Number,
      enum: [3, 4, 5],
      required: true,
    },

    matchType: {
      type: String,
      enum: ["3-number match", "4-number match", "5-number match"],
      required: true,
    },

    matchedNumbers: {
      type: [Number],
      required: true,
    },

    prizeAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    proofUrl: {
      type: String,
      default: "",
    },

    proofStatus: {
      type: String,
      enum: ["not_submitted", "submitted", "approved", "rejected"],
      default: "not_submitted",
    },

    proofReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    proofReviewedAt: {
      type: Date,
      default: null,
    },

    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

winnerSchema.index({ draw: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Winner", winnerSchema);
