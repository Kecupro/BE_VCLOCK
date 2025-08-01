var mongoose = require("mongoose");
let productImageSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    is_main: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: true,
    },
    alt: {
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
  { collection: "product_images" }
);

module.exports = productImageSchema;
