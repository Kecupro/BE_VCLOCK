var mongoose = require("mongoose");
let voucherSchema = new mongoose.Schema(
  {
    voucher_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    voucher_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    discount_type: {
      type: String,
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
      min: 0,
    },
    minimum_order_value: {
      type: Number,
      default: 0,
      min: 0,
    },
    max_discount: {
      type: Number,
      default: null,
      min: 0,
    },
    target_audience: {
      type: String,
      enum: ['all', 'new_customer', 'loyal_customer', 'vip_customer'],
      default: 'all',
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
  { collection: "vouchers" }
);

module.exports = voucherSchema;