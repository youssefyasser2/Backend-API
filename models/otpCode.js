// 📂 models/OtpCode.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const otpExpiry = parseInt(process.env.OTP_EXPIRY) || 300; // الافتراضي: 5 دقائق

const OtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// ✅ إنشاء OTP عشوائي
OtpSchema.statics.generateOTP = function () {
  return crypto.randomInt(100000, 999999).toString();
};

// ✅ البحث عن OTP صالح
OtpSchema.statics.findValidOTP = async function (userId, otp) {
  return await this.findOne({
    userId,
    otp,
    expiresAt: { $gt: new Date() },
  });
};

module.exports = mongoose.model("OtpCode", OtpSchema);

// 🚀 هذا هو الموديل المسؤول عن الـ OTP! 🔥
