// 📂 controllers/passwordResetController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const nodemailer = require("nodemailer");
const validator = require("validator");

// ✅ طلب إعادة تعيين كلمة المرور
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanedEmail = validator.normalizeEmail(email);

    if (!validator.isEmail(cleanedEmail)) {
      return res.status(400).json({ message: "البريد الإلكتروني غير صالح" });
    }

    const user = await User.findOne({ email: cleanedEmail });

    if (!user) {
      return res.status(400).json({ message: "البريد الإلكتروني غير مسجل" });
    }

    const resetToken = PasswordReset.generateToken();
    const expiresAt = new Date(Date.now() + Number(process.env.RESET_TOKEN_EXPIRY || 15 * 60 * 1000));

    await PasswordReset.deleteMany({ userId: user._id });
    await PasswordReset.create({ userId: user._id, resetToken, expiresAt });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "إعادة تعيين كلمة المرور",
      text: `لإعادة تعيين كلمة المرور، استخدم هذا الرابط:
      ${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني" });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({ message: "خطأ أثناء طلب إعادة التعيين", error: error.message });
  }
};

// ✅ التحقق من صلاحية الرمز
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const validEntry = await PasswordReset.findValidToken(token);

    if (!validEntry) {
      return res.status(400).json({ message: "رمز غير صالح أو منتهي الصلاحية" });
    }

    res.json({ message: "رمز إعادة التعيين صالح" });
  } catch (error) {
    console.error("Error in verifyResetToken:", error);
    res.status(500).json({ message: "خطأ أثناء التحقق من الرمز", error: error.message });
  }
};

// ✅ إعادة تعيين كلمة المرور
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const validEntry = await PasswordReset.findValidToken(token);

    if (!validEntry) {
      return res.status(400).json({ message: "رمز غير صالح أو منتهي الصلاحية" });
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "كلمة المرور ضعيفة. استخدم حروف كبيرة وصغيرة، أرقام، ورموز" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(validEntry.userId, { password: hashedPassword });
    await PasswordReset.deleteMany({ userId: validEntry.userId });

    res.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "خطأ أثناء إعادة تعيين كلمة المرور", error: error.message });
  }
};

module.exports = { requestPasswordReset, verifyResetToken, resetPassword };