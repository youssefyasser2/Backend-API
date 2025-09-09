const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 🛡️ تطبيق المصادقة على جميع المسارات داخل هذا الراوتر
router.use(authMiddleware);

// ✅ الوصول إلى بيانات المستخدم المحمية
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "تم الوصول إلى المسار المحمي بنجاح ✅",
    user: req.user,
  });
});

// ✅ الوصول إلى ملف المستخدم الشخصي
router.get("/profile", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🔍 هذا هو ملفك الشخصي",
    user: req.user,
  });
});

// 🛑 وسيط (Middleware) لفحص صلاحيات المشرف
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "🚫 الوصول مرفوض",
      message: "ليس لديك الصلاحيات الكافية للوصول إلى هذا المسار.",
    });
  }
  next();
};

// ✅ الوصول إلى لوحة تحكم المشرف (محمي)
router.get("/admin", adminMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "🔒 مرحبًا بك في لوحة تحكم المشرف",
    user: req.user,
  });
});

module.exports = router;
