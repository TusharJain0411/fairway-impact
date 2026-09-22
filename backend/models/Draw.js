const mongoose = require("mongoose");

const prizeTierSchema = new mongoose.Schema(
  {
    sharePercent: Number,
    amount: Number,
  },
  { _id: false },
);

const drawSchema = new mongoose.Schema(
  {
    month: {
      type: Date,
      required: true,
      unique: true,
    },

    drawMode: {
      type: String,
      enum: ["random", "algorithmic"],
      default: "random",
    },

    status: {
      type: String,
      enum: ["draft", "open", "published", "completed"],
      default: "draft",
    },

    prizePoolAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    prizeTiers: {
      fiveNumber: {
        type: prizeTierSchema,
        required: true,
      },
      fourNumber: {
        type: prizeTierSchema,
        required: true,
      },
      threeNumber: {
        type: prizeTierSchema,
        required: true,
      },
    },

    winningNumbers: {
      type: [Number],
      default: [],
      validate: {
        validator: (numbers) =>
          numbers.length === 0 ||
          (numbers.length === 5 &&
            new Set(numbers).size === 5 &&
            numbers.every((number) => number >= 1 && number <= 45)),
        message: "Draw must contain 5 unique numbers between 1 and 45.",
      },
    },

    eligibleSubscriberCount: {
      type: Number,
      default: 0,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    jackpotCarryoverIn: {
      type: Number,
      default: 0,
    },

    jackpotCarryoverOut: {
      type: Number,
      default: 0,
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Draw", drawSchema);
