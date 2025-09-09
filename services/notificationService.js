const Notification = require("../models/Notification");

class NotificationService {
  // ✅ إنشاء إشعار جديد
  static async createNotification(userId, title, message, type) {
    const newNotification = new Notification({
      userId,
      title,
      message,
      type,
    });
    await newNotification.save();
    return newNotification;
  }

  // ✅ جلب الإشعارات الخاصة بالمستخدم
  static async getUserNotifications(userId) {
    const notifications = await Notification.find({ userId })
      .sort({ timestamp: -1 }) // ترتيب الإشعارات من الأحدث إلى الأقدم
      .exec();
    return notifications;
  }

  // ✅ تمييز جميع الإشعارات كمقروءة
  static async markNotificationsAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  // ✅ حذف جميع الإشعارات الخاصة بالمستخدم
  static async clearAllNotifications(userId) {
    await Notification.deleteMany({ userId });
  }
}

module.exports = NotificationService;
