const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const AuthCredentialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      validate: {
        validator: (v) => /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/.test(v),
        message: "Password must contain at least one uppercase, one lowercase, one number, and one special character",
      },
      select: false,
    },
    passwordChangedAt: { type: Number, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);
AuthCredentialSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log("🔐 Password is being hashed in pre-save middleware...");
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Math.floor(Date.now() / 1000);
  next();
});


// 🔑 **مقارنة كلمة المرور المدخلة مع المشفرة**
AuthCredentialSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 🔄 **إنشاء رمز إعادة تعيين كلمة المرور**
AuthCredentialSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// ❌ **إبطال رمز إعادة تعيين كلمة المرور بعد الاستخدام**
AuthCredentialSchema.methods.invalidatePasswordResetToken = function () {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

const AuthCredential = mongoose.model("AuthCredential", AuthCredentialSchema);
module.exports = AuthCredential;
