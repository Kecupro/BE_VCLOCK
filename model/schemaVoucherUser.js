var mongoose = require("mongoose");

const VoucherUserSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vouchers",
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: "voucher_user",
});

module.exports = VoucherUserSchema;
