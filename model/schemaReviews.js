var mongoose = require("mongoose");
let reviewsSchema = new mongoose.Schema(
  {
    order_detail_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order_details",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "reviews" }
);

module.exports = reviewsSchema;
