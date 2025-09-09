const Log = require("../models/Log");

class LogService {
  // ✅ تسجيل حدث جديد
  static async createLog(userId, action, status, message = "") {
    if (!userId || !action) {
      throw new Error("يجب تحديد كل من userId و action");
    }
    // التأكد من أن `action` و `status` صالحة
    const validActions = [
      "LOGIN",
      "LOGOUT",
      "UPDATE_PROFILE",
      "DELETE_ACCOUNT",
      "PASSWORD_UPDATE",
      "FAILED_LOGIN",
    ];
    const validStatuses = ["SUCCESS", "FAILED"];

    if (!validActions.includes(action)) {
      throw new Error("الإجراء غير صالح");
    }

    if (!validStatuses.includes(status)) {
      throw new Error("الحالة غير صالحة");
    }

    const log = new Log({ userId, action, status, message });
    await log.save();
    return log; // إرجاع السجل الذي تم إنشاؤه
  }

  // ✅ جلب السجلات الخاصة بمستخدم معين مع إمكانية التصفية
  static async getUserLogs(
    userId,
    { page = 1, limit = 10, action, status, startDate, endDate }
  ) {
    const filter = { userId };

    if (action) filter.action = action;
    if (status) filter.status = status;

    // تصفية السجلات بالنطاق الزمني
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate)) {
          throw new Error("تاريخ البدء غير صالح");
        }
        filter.timestamp.$gte = parsedStartDate;
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate)) {
          throw new Error("تاريخ الانتهاء غير صالح");
        }
        filter.timestamp.$lte = parsedEndDate;
      }
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    const logs = await Log.find(filter)
      .sort({ timestamp: -1 }) // ترتيب الأحدث أولًا
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // حساب إجمالي السجلات
    const totalLogs = await Log.countDocuments(filter);

    return {
      totalLogs,
      totalPages: Math.ceil(totalLogs / limitNumber),
      currentPage: pageNumber,
      logs,
    };
  }
}

module.exports = LogService;
