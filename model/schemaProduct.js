var mongoose = require("mongoose");
let productSchema = new mongoose.Schema(
  {
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "brands",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sale_price: {
      type: Number,
      default: null,
      min: 0,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 0,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    sex: {
      type: String,
      enum: ["nam", "nữ", "unisex", null],
      default: null,
    },
    case_diameter: { type: Number, default: null },
    style: {
      type: String,
      default: null,
    },
    features: {
      type: String,
      default: null,
    },
    water_resistance: {
      type: String,
      default: null,
    },
    thickness: { type: Number, default: 0, min: 0 },
    color: {
      type: String,
      default: null,
    },
    machine_type: {
      type: String,
      default: null,
    },
    strap_material: {
      type: String,
      default: null,
    },
    case_material: {
      type: String,
      default: null,
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
  { collection: "products" }
);

module.exports = productSchema;
