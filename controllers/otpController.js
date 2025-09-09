const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const OtpCode = require("../models/otpCode");
const User = require("../models/User");
const AuthCredential = require("../models/AuthCredential"); // إذا كنت تستخدمه
const EmailUtils = require("../utils/emailUtils.js");

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY) || 300; // الافتراضي: 5 دقائق

// ✅ طلب إرسال OTP
exports.requestOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const otp = OtpCode.generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 1000);

    await OtpCode.create({ userId: user._id, otp, expiresAt });
    await EmailUtils.sendEmail(user.email, "رمز التحقق", `رمز OTP الخاص بك هو: ${otp}`);

    res.status(200).json({ message: "تم إرسال OTP إلى البريد الإلكتروني" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء إرسال OTP", error: error.message });
  }
};

// ✅ التحقق من صحة OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const validEntry = await OtpCode.findValidOTP(user._id, otp);
    if (!validEntry) return res.status(400).json({ message: "OTP غير صالح أو منتهي الصلاحية" });

    res.status(200).json({ message: "OTP صحيح" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء التحقق من OTP", error: error.message });
  }
};

// ✅ إعادة تعيين كلمة المرور
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // ✅ التحقق من صحة البيانات المدخلة
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "كلمة المرور يجب أن تكون على الأقل 6 أحرف" });
    }
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}/.test(newPassword)) {
      return res.status(400).json({ message: "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const validEntry = await OtpCode.findValidOTP(user._id, otp);
    if (!validEntry) return res.status(400).json({ message: "OTP غير صالح أو منتهي الصلاحية" });

    // ✅ التحقق من عدم استخدام نفس كلمة المرور القديمة
    const auth = await AuthCredential.findOne({ userId: user._id }).select("password");
    if (auth && (await bcrypt.compare(newPassword, auth.password))) {
      return res.status(400).json({ message: "لا يمكنك استخدام كلمة المرور القديمة" });
    }

    // 🔹 **تشفير كلمة المرور الجديدة قبل الحفظ**
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 🔹 **تحديث كلمة المرور في AuthCredential**
    await AuthCredential.findOneAndUpdate(
      { userId: user._id },
      { password: hashedPassword },
      { new: true }
    );

    // حذف جميع رموز OTP المرتبطة بهذا المستخدم
    await OtpCode.deleteMany({ userId: user._id });

    res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور", error: error.message });
  }
};
