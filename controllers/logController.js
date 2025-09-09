const Log = require("../models/Log");
const mongoose = require("mongoose");

const getLogs = async (req, res) => {
  try {
    // استخراج معلمات البحث
    const { page = 1, limit = 10, userId, action, status, startDate, endDate } = req.query;

    const filter = {};

    // التحقق من صحة page و limit
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    // تصفية السجلات
    if (userId) filter.userId = mongoose.Types.ObjectId(userId);  // تأكد من أن userId هو ObjectId
    if (action) filter.action = action;
    if (status) filter.status = status;

    // تصفية بالنطاق الزمني
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate)) {
          return res.status(400).json({ message: "تاريخ البدء غير صالح" });
        }
        filter.createdAt.$gte = parsedStartDate;
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate)) {
          return res.status(400).json({ message: "تاريخ الانتهاء غير صالح" });
        }
        filter.createdAt.$lte = parsedEndDate;
      }
    }

    // التحقق من أن startDate أصغر من endDate
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "تاريخ البدء يجب أن يكون أقل من تاريخ الانتهاء" });
    }

    // جلب السجلات
    const logs = await Log.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // حساب إجمالي السجلات
    const totalLogs = await Log.countDocuments(filter);

    // التحقق من وجود سجلات
    if (logs.length === 0) {
      return res.status(404).json({ 
        message: "لا توجد سجلات", 
        filterApplied: filter 
      });
    }

    // إرجاع النتيجة
    res.json({
      totalLogs,
      totalPages: Math.ceil(totalLogs / limitNumber),
      currentPage: pageNumber,
      logs,
    });
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
};

module.exports = { getLogs };
