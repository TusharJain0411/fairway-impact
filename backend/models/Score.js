const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: [true, "Stableford score is required"],
      min: 1,
      max: 45,
    },

    playedOn: {
      type: Date,
      required: [true, "Date played is required"],
    },

    course: {
      type: String,
      trim: true,
      default: "Golf Course",
      maxlength: 120,
    },
  },
  {
    timestamps: true,
  },
);

// One score per user for each date
scoreSchema.index({ user: 1, playedOn: 1 }, { unique: true });

module.exports = mongoose.model("Score", scoreSchema);
