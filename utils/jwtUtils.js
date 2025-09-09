const jwt = require("jsonwebtoken");
require("dotenv").config();

class JwtUtils {
  // ✅ إنشاء `Access Token`
  static generateAccessToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
  }

  // ✅ إنشاء `Refresh Token`
  static generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  }

  // ✅ التحقق من `Access Token`
  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = JwtUtils;
