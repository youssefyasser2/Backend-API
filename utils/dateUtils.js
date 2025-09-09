class DateUtils {
    // ✅ تحويل التاريخ إلى تنسيق محلي
    static formatDate(date, locale = "ar-EG") {
      return new Date(date).toLocaleString(locale);
    }
  
    // ✅ التحقق مما إذا كان التاريخ منتهي الصلاحية
    static isExpired(date) {
      return new Date(date) < new Date();
    }
  }
  
  module.exports = DateUtils;

  