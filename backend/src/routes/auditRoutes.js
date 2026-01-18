const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const { authenticate, authorize } = require("../middleware/auth");

// Get all audit logs (admin only)
router.get(
  "/",
  authenticate,
  authorize("hq_admin", "super_admin"),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, entityType, entityId, action } = req.query;

      let filter = {};
      if (entityType) filter.entityType = entityType;
      if (entityId) filter.entityId = entityId;
      if (action) filter.action = action;

      const logs = await AuditLog.find(filter)
        .populate("performedBy", "username role")
        .sort({ performedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AuditLog.countDocuments(filter);

      res.json({
        success: true,
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch audit logs",
      });
    }
  },
);

module.exports = router;
