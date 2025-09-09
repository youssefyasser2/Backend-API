const bcrypt = require("bcryptjs");

class HashUtils {
  // ✅ تشفير كلمة المرور
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  // ✅ مقارنة كلمة المرور المُدخلة مع المشفرة
  static async comparePasswords(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = HashUtils;
