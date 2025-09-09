const mongoose = require("mongoose");

const AuthTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ✅ تحسين البحث عند الاستعلام عن الـ Tokens
    },
    refreshToken: { 
      type: String, 
      required: true, 
      unique: true, // 🛠️ منع التكرارات غير الضرورية
      select: false, // 🔒 لا يتم جلبه افتراضيًا عند الاستعلام
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // ⏳ انتهاء بعد 30 يومًا
    },
  },
  { timestamps: true }
);

// ✅ إضافة فهرس تلقائي لتنظيف التوكنات المنتهية الصلاحية
AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AuthToken", AuthTokenSchema);
