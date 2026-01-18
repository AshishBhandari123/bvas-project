const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    performedAt: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
auditLogSchema.index({ performedAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ performedBy: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

// Static method to create audit log
AuditLog.createLog = async function (data) {
  try {
    const log = new AuditLog(data);
    await log.save();
    return log;
  } catch (error) {
    console.error("Audit log creation failed:", error);
  }
};

module.exports = AuditLog;
