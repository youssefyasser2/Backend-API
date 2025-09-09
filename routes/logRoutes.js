const express = require("express");
const Log = require("../models/Log");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ جلب السجلات (مع دعم التصفية والتقسيم إلى صفحات)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      action,
      status,
      startDate,
      endDate,
    } = req.query;

    const filter = { userId: req.user.userId };

    // إضافة التصفية حسب المعلمات (مثل action, status, startDate, endDate)
    if (action) filter.action = action;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate)) {
          return res.status(400).json({ message: "تاريخ البدء غير صالح" });
        }
        filter.timestamp.$gte = parsedStartDate;
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate)) {
          return res.status(400).json({ message: "تاريخ الانتهاء غير صالح" });
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

    // حساب عدد السجلات
    const totalLogs = await Log.countDocuments(filter);

    res.json({
      totalLogs,
      totalPages: Math.ceil(totalLogs / limitNumber),
      currentPage: pageNumber,
      logs,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "خطأ في استرجاع السجلات", error: error.message });
  }
});

// ✅ إضافة سجل جديد (يتم استدعاؤه عند تنفيذ حدث معين)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { action, status, message } = req.body;

    if (!action || !status)
      return res
        .status(400)
        .json({ message: "يجب تحديد الإجراء و الحالة المسجلة" });

    const newLog = new Log({
      userId: req.user.userId,
      action,
      status,
      message: message || "", // في حالة عدم وجود رسالة، سيتم تعيينها إلى فارغة
    });

    await newLog.save();
    res.status(201).json({ message: "تم تسجيل الحدث بنجاح", log: newLog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "خطأ أثناء تسجيل الحدث", error: error.message });
  }
});

// ✅ تنظيف السجلات القديمة (مسح السجلات الأقدم من 30 يومًا)
router.delete("/cleanup", authMiddleware, async (req, res) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // السجلات الأقدم من 30 يومًا

    const result = await Log.deleteMany({
      userId: req.user.userId,
      timestamp: { $lt: cutoffDate },
    });

    res.json({ message: `تم حذف ${result.deletedCount} من السجلات القديمة` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "خطأ أثناء تنظيف السجلات", error: error.message });
  }
});

module.exports = router;
