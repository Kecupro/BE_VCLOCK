var mongoose = require("mongoose");
let addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    receiver_name: {
      type: String,
      require: true,
    },

    phone: {
      type: String,
      require: true,
    },

    address: {
      type: String,
      require: true,
    },

    is_default: {
      type: Boolean,
      default: false,
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
  { collection: "address" }
);

module.exports = addressSchema;