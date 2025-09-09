// 📂 server.js
const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// 🔥 Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "Reason:", err);
  server.close(() => process.exit(1));
});

// 🔥 Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  server.close(() => process.exit(1));
});

// 👋 Handle graceful shutdown on SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.log("👋 Server shutting down gracefully...");
  server.close(() => process.exit(0));
});

// 🔌 Handle SIGTERM (for containerized environments like Docker)
process.on("SIGTERM", async () => {
  console.log("🔌 SIGTERM received. Closing server...");
  // await closeDBConnection(); // Uncomment if you need to close DB connections
  server.close(() => {
    console.log("💤 Server closed. Exiting...");
    process.exit(0);
  });
});

