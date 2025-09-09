const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// List of required environment variables
const requiredEnvVars = [
  "MONGO_USER",
  "MONGO_PASS",
  "MONGO_HOST",
  "MONGO_PORT",
  "MONGO_DB",
  "JWT_SECRET",
];

// Validate required environment variables
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Error: Required environment variable "${varName}" is missing in .env`);
    process.exit(1);
  }
});

// Build MongoDB connection URI
// Important: authSource must match the database where the user was created (AppDB)
const mongoURI = `mongodb://${process.env.MONGO_USER}:${encodeURIComponent(
  process.env.MONGO_PASS
)}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=${process.env.MONGO_DB}&retryWrites=true&w=majority`;

module.exports = {
  mongoURI,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 5000, // Default port if not specified
  nodeEnv: process.env.NODE_ENV || "development",
};