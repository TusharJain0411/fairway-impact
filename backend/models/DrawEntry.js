const mongoose = require("mongoose");

const scoreSnapshotSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
    },

    playedOn: {
      type: Date,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const drawEntrySchema = new mongoose.Schema(
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

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },

    scoreSnapshot: {
      type: [scoreSnapshotSchema],
      validate: {
        validator: (scores) => scores.length === 5,
        message: "A draw entry must contain exactly 5 scores.",
      },
      required: true,
    },

    scoreNumbers: {
      type: [Number],
      required: true,
    },

    isEligible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

drawEntrySchema.index({ draw: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("DrawEntry", drawEntrySchema);
