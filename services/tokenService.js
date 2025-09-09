const jwt = require("jsonwebtoken");
const AuthToken = require("../models/AuthToken");
require("dotenv").config();

class TokenService {
  // ✅ إنشاء `Access Token`
  static generateAccessToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  }

  // ✅ إنشاء `Refresh Token` وحفظه في قاعدة البيانات
  static async generateRefreshToken(userId) {
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await AuthToken.create({ userId, refreshToken });
    return refreshToken;
  }

  // ✅ التحقق من `Refresh Token`
  static async verifyRefreshToken(token) {
    const storedToken = await AuthToken.findOne({ refreshToken: token });
    if (!storedToken) throw new Error("توكن التحديث غير صالح");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  }
}

module.exports = TokenService;
