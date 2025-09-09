const NotificationService = require("../services/notificationService");


// ✅ إنشاء إشعار جديد
const createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const userId = req.user.userId;

    if (!title || !message || !type) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    const newNotification = await NotificationService.createNotification(
      userId,
      title,
      message,
      type
    );
    res.status(201).json({
      message: "تم إنشاء الإشعار بنجاح",
      notification: newNotification,
    });
  } catch (error) {
    res.status(500).json({
      message: "خطأ أثناء إنشاء الإشعار",
      error: error.message,
    });
  }
};

// ✅ جلب الإشعارات
const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getUserNotifications(
      req.user.userId
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "خطأ في جلب الإشعارات",
      error: error.message,
    });
  }
};

// ✅ تمييز جميع الإشعارات كمقروءة
const markAsRead = async (req, res) => {
  try {
    await NotificationService.markNotificationsAsRead(req.user.userId);
    res.json({ message: "تم تمييز جميع الإشعارات كمقروءة" });
  } catch (error) {
    res.status(500).json({
      message: "خطأ أثناء تحديث الإشعارات",
      error: error.message,
    });
  }
};

// ✅ حذف جميع الإشعارات
const clearNotifications = async (req, res) => {
  try {
    await NotificationService.clearAllNotifications(req.user.userId);
    res.json({ message: "تم حذف جميع الإشعارات بنجاح" });
  } catch (error) {
    res.status(500).json({
      message: "خطأ أثناء حذف الإشعارات",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  clearNotifications,
};
