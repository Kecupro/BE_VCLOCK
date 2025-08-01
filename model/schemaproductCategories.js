var mongoose = require("mongoose");
let productCategoriesSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
  },
  { collection: "product_categories" }
);

module.exports = productCategoriesSchema;
