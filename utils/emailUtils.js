const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailUtils {
  // ✅ تهيئة SMTP لإرسال البريد الإلكتروني
  static transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // ✅ تأكد من أن الاتصال آمن
    },
  });

  // ✅ إرسال رسالة بريد إلكتروني عامة
  static async sendEmail(to, subject, text, html = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      };

      const info = await EmailUtils.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${info.response}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw new Error("Failed to send email");
    }
  }

  // 📩 إرسال الإيميل الترحيبي
  static async sendWelcomeEmail(email, name) {
    const subject = "Welcome to Our Platform!";
    const text = `Hello ${name}, welcome! We're excited to have you on board.`;

    await EmailUtils.sendEmail(email, subject, text);
  }

  // 📩 إرسال كود التحقق
  static async sendVerificationEmail(email, otp) {
    const subject = "Verify your email";
    const text = `Your verification code is: ${otp}`;
    await EmailUtils.sendEmail(email, subject, text);
  }
}

module.exports = EmailUtils;
