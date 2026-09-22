const mongoose = require("mongoose");

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Charity name is required"],
      trim: true,
      unique: true,
    },

    category: {
      type: String,
      required: [true, "Charity category is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Charity description is required"],
      trim: true,
      maxlength: 500,
    },

    image: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Charity", charitySchema);
