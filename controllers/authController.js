const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // استخدم bcryptjs لأنه أخف وأفضل دعمًا
const User = require("../models/User");
const AuthCredential = require("../models/AuthCredential");
const AuthToken = require("../models/AuthToken");
const dotenv = require("dotenv");
dotenv.config();

// ✅ **توليد التوكنات بشكل آمن**
const generateTokens = (userId) => {
  try {
    const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRATION || "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "7d",
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("❌ Token generation error:", error);
    throw new Error("Failed to generate tokens");
  }
};

// ✅ **تسجيل مستخدم جديد**
const register = async (req, res) => {
  try {
    console.log("📍 تم استدعاء دالة التسجيل"); // ✅ تأكيد وصول الطلب

    const { name, email, password } = req.body;

    // 🔍 التحقق من عدم وجود المستخدم مسبقًا
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 👤 إنشاء المستخدم
    const user = new User({ name, email });

    // 🔐 إنشاء بيانات تسجيل الدخول
    const authCredential = new AuthCredential({ userId: user._id, password });

    // ✅ حفظ البيانات بالتوازي
    await Promise.all([user.save(), authCredential.save()]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ **تسجيل الدخول**
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 البحث عن المستخدم
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // 🔐 جلب بيانات تسجيل الدخول المرتبطة بالمستخدم
    const auth = await AuthCredential.findOne({ userId: user._id }).select("+password").lean();
    if (!auth) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ **مقارنة كلمة المرور المدخلة مع المشفرة**
    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 🔥 **توليد التوكنات**
    const { accessToken, refreshToken } = generateTokens(user._id);

    // 🔄 **تحديث أو إنشاء توكن التحديث في قاعدة البيانات**
    await AuthToken.findOneAndUpdate(
      { userId: user._id },
      { refreshToken },
      { upsert: true, new: true }
    );

    // 🍪 **تخزين refreshToken في الكوكيز**
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ **تسجيل الخروج**
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const token = await AuthToken.findOne({ refreshToken });
      if (token) await AuthToken.deleteOne({ refreshToken });
    }

    // 🗑️ **مسح الكوكيز**
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, logout };
