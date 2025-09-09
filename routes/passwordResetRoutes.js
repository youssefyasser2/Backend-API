const express = require("express");
const { body, param } = require("express-validator");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} = require("../controllers/passwordResetController");

// ✅ معدل الطلبات لمنع الهجمات
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ⏳ 15 دقيقة
  max: 5, // 🚫 الحد الأقصى 5 طلبات لكل IP
  message:
    "تم تجاوز الحد المسموح به لمحاولات إعادة تعيين كلمة المرور. يرجى المحاولة لاحقًا.",
});

// ✅ طلب إعادة تعيين كلمة المرور
router.post(
  "/request",
  resetLimiter,
  body("email")
    .trim()
    .isEmail()
    .withMessage("يرجى إدخال بريد إلكتروني صالح")
    .normalizeEmail(),
  requestPasswordReset
);

// ✅ التحقق من صلاحية الرمز
router.get(
  "/verify/:token",
  param("token")
    .isLength({ min: 64, max: 64 })
    .withMessage("رمز غير صالح - يجب أن يتكون من 64 حرفًا")
    .matches(/^[a-f0-9]{64}$/)
    .withMessage("الرمز يحتوي على أحرف غير صالحة"),
  verifyResetToken
);

// ✅ إعادة تعيين كلمة المرور
router.post(
  "/reset-password",
  resetLimiter,
  body("token").notEmpty().withMessage("الرمز مطلوب"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("كلمة المرور يجب أن تكون على الأقل 8 أحرف")
    .matches(/[A-Z]/)
    .withMessage("يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل")
    .matches(/[a-z]/)
    .withMessage("يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل")
    .matches(/[0-9]/)
    .withMessage("يجب أن تحتوي كلمة المرور على رقم واحد على الأقل")
    .matches(/[@$!%*?&#]/)
    .withMessage("يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل"),
  resetPassword
);

module.exports = router;
