const mongoose = require("mongoose");
const { mongoURI } = require("./index"); // استيراد القيم من config/index.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      writeConcern: { w: "majority", wtimeout: 5000 },
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // إيقاف السيرفر عند فشل الاتصال
  }
};

// مراقبة حالات الاتصال
mongoose.connection.on("connected", () => {
  console.log("🔗 MongoDB connected successfully.");
});

let retryCount = 0;
const maxRetries = 5;

mongoose.connection.on("error", (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  if (retryCount < maxRetries) {
    console.warn(`⚠️ MongoDB disconnected! Reconnecting... (Attempt ${retryCount + 1}/${maxRetries})`);
    retryCount++;
    setTimeout(connectDB, 5000);
  } else {
    console.error("❌ Maximum reconnection attempts reached. Exiting...");
    process.exit(1);
  }
});

// إغلاق الاتصال عند إنهاء التطبيق
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🔴 MongoDB connection closed. Exiting...");
  process.exit(0);
});

module.exports = connectDB;
