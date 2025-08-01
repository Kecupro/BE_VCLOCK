var mongoose = require("mongoose");
let userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
      fullName: {
      type: String,
    },
      emailVerificationCode: {
      type: String,
      default: null,
    },
    emailVerificationCodeExpires: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetTokenExpires: {
      type: Date,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    account_status: {
      type: String,
      enum: [0, 1],
      default: 0,
      required: true,
    },
    role: {
      type: String,
      enum: [0, 1, 2],
      default: 1,
      required: true,
    },
    avatar: {
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
  {
    collection: "users",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("addresses", {
  ref: "address",
  localField: "_id",
  foreignField: "user_id",
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

module.exports = userSchema;
