const User = require("../models/User");

// ✅ جلب بيانات المستخدم
const getUser = async (userId) => {
  return await User.findById(userId).select("-password"); // تأكد من إخفاء كلمة المرور
};

// ✅ إنشاء مستخدم جديد (إذا لم يكن موجودًا)
const createUser = async (userId, userData) => {
  let user = await User.findById(userId);
  if (!user) {
    user = new User({ _id: userId, ...userData });
    await user.save();
  } else {
    Object.assign(user, userData);
    await user.save();
  }
  return user;
};

// ✅ تحديث بيانات المستخدم
const updateUser = async (userId, updates) => {
  return await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
};

// ✅ حذف المستخدم
const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

// ✅ التصدير
module.exports = { getUser, createUser, updateUser, deleteUser };
