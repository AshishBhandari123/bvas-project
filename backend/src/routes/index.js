const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const billRoutes = require("./billRoutes");
const auditRoutes = require("./auditRoutes");

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "BVAS API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/bills", billRoutes);
router.use("/audit", auditRoutes);

module.exports = router;
