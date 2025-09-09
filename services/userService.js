const User = require("../models/User");

class UserService {
  // ✅ جلب جميع المستخدمين مع استثناء كلمات المرور
  static async getAllUsers() {
    return await User.find().select("-password");
  }

  // ✅ البحث عن مستخدم بواسطة `userId`
  static async getUserById(userId) {
    return await User.findById(userId).select("-password");
  }
}

module.exports = UserService;
