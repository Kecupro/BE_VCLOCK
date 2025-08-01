var mongoose = require("mongoose");
let orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    orderCode: {
      type: String,
      required: true,
    },
    voucher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vouchers",
      default: null,
    },
    address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
      default: null,
    },
    payment_method_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment_methods",
      default: null,
    },
    note: {
      type: String,
      default: null,
      trim: true,
    },
    shipping_fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    order_status: {
      type: String,
      enum: ["pending", "processing", "shipping", "delivered", "returned", "cancelled"],
      required: true,
      default: "processing",
    },

    payment_status: {
      type: String,
      enum: ["unpaid", "paid", "refunding", "refunded", "failed"],
      required: true,
      default: "unpaid",
    }
  },
  { collection: "orders" ,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = orderSchema;
