var mongoose = require("mongoose");
let brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    alt: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    brand_status: {
      type: Number,
      enum: [0, 1],
      default: 0,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "brands" }
);

module.exports = brandSchema;
