const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/otpController");

// ✅ طلب إرسال OTP
router.post(
  "/request",
  body("email").isEmail().withMessage("يرجى إدخال بريد إلكتروني صالح"),
  requestOTP
);

// ✅ التحقق من صحة OTP
router.post(
  "/verify",
  body("email").isEmail().withMessage("يرجى إدخال بريد إلكتروني صالح"),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("رمز OTP يجب أن يتكون من 6 أرقام"),
  verifyOTP
);

// ✅ إعادة تعيين كلمة المرور
router.post(
  "/reset-password",
  body("email").isEmail().withMessage("يرجى إدخال بريد إلكتروني صالح"),
  body("otp").notEmpty().withMessage("الرمز مطلوب"),
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

// ✅ المسارات جاهزة! سأرسل لك الآن الكود الخاص بالـ controller 🚀
