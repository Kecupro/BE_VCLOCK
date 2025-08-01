var mongoose = require("mongoose");
let newsSchema = new mongoose.Schema(
  {
    categorynews_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category_news",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    news_status: {
      type: Number,
      enum: [0, 1],
      default: 0,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
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
  { collection: "news" }
);

module.exports = newsSchema;
