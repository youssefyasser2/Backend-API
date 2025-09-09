const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const tokenService = require("./tokenService");

require("dotenv").config();

class AuthService {
  // ✅ تسجيل مستخدم جديد
  static async register(name, email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("البريد الإلكتروني مسجل مسبقًا");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    return newUser;
  }

  // ✅ تسجيل الدخول وإنشاء Access/Refresh Tokens
  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("البريد الإلكتروني غير صحيح");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("كلمة المرور غير صحيحة");

    // توليد JWT Access & Refresh Tokens
    const accessToken = tokenService.generateAccessToken(user._id);
    const refreshToken = tokenService.generateRefreshToken(user._id);

    return { accessToken, refreshToken, user };
  }
}

module.exports = AuthService;
