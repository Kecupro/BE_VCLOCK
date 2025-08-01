var mongoose = require("mongoose");
let categoryNewsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: Number,
      enum: [0, 1],
      default: 0,
      require: true,
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
  { collection: "category_news" }
);

module.exports = categoryNewsSchema;
