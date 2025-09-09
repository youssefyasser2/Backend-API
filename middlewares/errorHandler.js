// Custom Middleware for Error Handling
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err); // ✅ Log the error for debugging

  let statusCode = err.statusCode || 500; // ✅ Default to internal server error
  let message = err.message || "An unexpected error occurred.";

  // ✅ Categorize common errors and return clear messages
  switch (err.name) {
    case "ValidationError":
      statusCode = 400;
      message = "Invalid data. Please check your inputs.";
      break;
    case "JsonWebTokenError":
      statusCode = 401;
      message = "Invalid token. Please log in.";
      break;
    case "TokenExpiredError":
      statusCode = 401;
      message = "Token expired. Please log in again.";
      break;
    default:
      if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate entry. This data already exists.";
      }
  }

  // ✅ Hide sensitive details in production
  if (process.env.NODE_ENV === "production") {
    message = statusCode === 500 ? "Internal server error. Please try again later." : message;
  }

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
