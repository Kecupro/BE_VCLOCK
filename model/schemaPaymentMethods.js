var mongoose = require("mongoose");
let paymentMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
    },

    status: {
      type: Number,
      enum: [0, 1],
      default: 0,
      require: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    icon_url: {
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
  { collection: "payment_methods" }
);

module.exports = paymentMethodSchema;
