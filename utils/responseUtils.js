class ResponseUtils {
    // ✅ استجابة ناجحة
    static success(res, message, data = null) {
      res.json({ success: true, message, data });
    }
  
    // ✅ استجابة خطأ
    static error(res, message, statusCode = 400) {
      res.status(statusCode).json({ success: false, message });
    }
  }
  
  module.exports = ResponseUtils;
  