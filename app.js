require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const Redis = require("ioredis");
const errorHandler = require("./middlewares/errorHandler");
const connectDB = require("./config/db");

const app = express();


// ✅ Verify essential environment variables
const requiredEnvVars = [
  "JWT_SECRET",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL",
  "JSON_LIMIT",
];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length) {
  console.error(
    `❌ Missing essential environment variables: ${missingVars.join(", ")}`
  );
  process.exit(1);
} else {
  console.log("✅ All required environment variables are set!");
}

// 🛡️ Security Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(hpp());
app.use(morgan("combined"));
app.use(express.json({ limit: process.env.JSON_LIMIT || "10kb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "🚫 Too many requests! Try again later.",
  })
);
app.disable("x-powered-by");

// 🛢️ Database Connection
connectDB()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });

// 🛣️ Load Routes
const routes = [
  { path: "/api/auth", file: "authRoutes" },
  { path: "/api/users", file: "userRoutes" },
  { path: "/api/profile", file: "profileRoutes" },
  { path: "/api/notifications", file: "notificationRoutes" },
  { path: "/api/logs", file: "logRoutes" },
  { path: "/api/tokens", file: "tokenRoutes" },
  { path: "/api/password-resets", file: "passwordResetRoutes" },
  { path: "/api/otpCode", file: "otpCode" },
  { path: "/api/protected", file: "protectedRoutes" },
];

routes.forEach(({ path, file }) => {
  app.use(path, require(`./routes/${file}`));
  console.log(`📍 Route loaded: ${path}`);
});

console.log("🔍 Manually testing authRoutes.js...");
const authRoutes = require("./routes/authRoutes"); // اختبار يدوي للملف
console.log("✅ authRoutes.js loaded manually!");

// 🚨 Handle Invalid JSON Payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "🚫 Invalid JSON payload!" });
  }
  next();
});

// 🚫 Handle Undefined Routes
app.use((req, res) => {
  res.status(404).json({ message: "🚫 Route not found!" });
});

// 🛡️ Error Handling Middleware
app.use(errorHandler);

module.exports = app;
