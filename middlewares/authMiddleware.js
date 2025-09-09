const jwt = require("jsonwebtoken");
const AuthToken = require("../models/AuthToken");
const redisClient = require("../config/redis"); // Ensure Redis is properly configured
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "🚫 Please log in." });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // ✅ Check if the token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklistedToken:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: "🚫 Token has been revoked." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return await handleTokenExpiration(req, res, next);
      }
      return res.status(401).json({ message: "🚫 Invalid token." });
    }
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return res.status(401).json({ message: "🚫 Invalid token." });
  }
};

// ✅ **Handle token expiration & refresh token validation**
const handleTokenExpiration = async (req, res, next) => {
  try {
    const refreshToken = req.header("x-refresh-token");
    if (!refreshToken) {
      return res.status(401).json({ message: "🔄 Token expired. Please log in again." });
    }

    // ✅ Check if `refreshToken` is blacklisted
    const isBlacklisted = await redisClient.get(`blacklistedToken:${refreshToken}`);
    if (isBlacklisted) {
      return res.status(403).json({ message: "🚫 Invalid refresh token." });
    }

    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decodedRefresh.userId) {
      return res.status(403).json({ message: "🚫 Invalid refresh token." });
    }

    // ✅ Verify refreshToken in the database
    const storedToken = await AuthToken.findOne({ userId: decodedRefresh.userId });
    if (!storedToken || storedToken.refreshToken !== refreshToken) {
      await AuthToken.deleteOne({ userId: decodedRefresh.userId });
      return res.status(403).json({ message: "🚫 Invalid refresh token." });
    }

    // ✅ Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decodedRefresh.userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || "1h" }
    );

    // ✅ Update `req.user` and send the new token in response headers
    req.user = { userId: decodedRefresh.userId };
    res.setHeader("Authorization", `Bearer ${newAccessToken}`);
    res.setHeader("Access-Control-Expose-Headers", "Authorization");

    return next();
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    return res.status(401).json({ message: "🚫 Invalid refresh token." });
  }
};

module.exports = authMiddleware;
