const mongoose = require("mongoose");

const autoDeleteAfterDays = 30; // 🗑️ حذف الإشعارات القديمة تلقائيًا بعد 30 يومًا

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 📌 تحسين البحث حسب المستخدم
    },
    title: {
      type: String,
      required: [true, "عنوان الإشعار مطلوب"],
      trim: true,
      minlength: [3, "يجب أن يكون العنوان على الأقل 3 أحرف"],
      maxlength: [100, "يجب ألا يزيد العنوان عن 100 حرف"],
    },
    message: {
      type: String,
      required: [true, "محتوى الإشعار مطلوب"],
      trim: true,
      minlength: [5, "يجب أن يكون المحتوى على الأقل 5 أحرف"],
      maxlength: [500, "يجب ألا يزيد المحتوى عن 500 حرف"],
    },
    type: {
      type: String,
      required: true,
      enum: {
        values: ["NEW_MESSAGE", "WARNING", "SYSTEM_UPDATE", "ALERT"],
        message: "نوع الإشعار غير صالح",
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true, // 🔍 تحسين البحث عن الإشعارات الغير مقروءة
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // ⏳ تحسين البحث حسب التاريخ
      expires: autoDeleteAfterDays * 24 * 60 * 60, // 🗑️ الحذف التلقائي بعد 30 يومًا
    },
  },
  { timestamps: true }
);

// ✅ تحسين أداء البحث باستخدام `Indexes`
NotificationSchema.index({ userId: 1, isRead: 1, timestamp: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
