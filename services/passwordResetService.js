// 📂 services/PasswordResetService.js
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const PasswordReset = require("../models/PasswordReset");
const User = require("../models/User");

const RESET_TOKEN_EXPIRY = process.env.RESET_TOKEN_EXPIRY || 15 * 60 * 1000;

class PasswordResetService {
  // ✅ إنشاء `Reset Token`
  static async generateResetToken(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("البريد الإلكتروني غير موجود");

    // 🧹 حذف أي طلبات قديمة غير منتهية
    await PasswordReset.deleteMany({ userId: user._id });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    // 🔐 تشفير الرمز قبل الحفظ
    const hashedToken = await bcrypt.hash(resetToken, 10);

    await PasswordReset.create({ userId: user._id, resetToken: hashedToken, expiresAt });

    return resetToken;
  }

  // ✅ التحقق من `Reset Token`
  static async verifyResetToken(token) {
    const resetRequest = await PasswordReset.findOne({ expiresAt: { $gt: new Date() } });

    if (!resetRequest) {
      throw new Error("رمز الاستعادة غير صالح أو منتهي الصلاحية");
    }

    // 🔑 التحقق من صحة الرمز
    const isValid = await bcrypt.compare(token, resetRequest.resetToken);
    if (!isValid) {
      throw new Error("رمز الاستعادة غير صالح");
    }

    return resetRequest.userId;
  }
}

module.exports = PasswordResetService;
