const express = require("express");
const jwt = require("jsonwebtoken");
const AuthToken = require("../models/AuthToken"); // لاسترجاع refreshToken عند الحاجة
require("dotenv").config();

const router = express.Router();

// ✅ تجديد التوكن باستخدام `refreshToken`
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "🚫 مطلوب refreshToken" });
    }

    // ✅ البحث عن `refreshToken` في قاعدة البيانات
    const storedToken = await AuthToken.findOne({ refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: "🚫 توكن التحديث غير صالح" });
    }

    // ✅ إنشاء `accessToken` جديد
    const newAccessToken = jwt.sign(
      { userId: storedToken.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || "1h" } // الافتراضي ساعة واحدة
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("❌ خطأ في تحديث التوكن:", error);
    res.status(500).json({ message: "❌ حدث خطأ أثناء تحديث التوكن" });
  }
});

module.exports = router;
