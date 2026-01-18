const express = require("express");
const router = express.Router();
const {
  getAllBills,
  getVendorBills,
  getPendingBills,
  createBill,
  getBillById,
  submitBill,
  approveBill,
  rejectBill,
  updateBill,
  deleteBill,
  downloadDocument,
  getBillStatistics,
  getBillAuditLogs,
} = require("../controllers/billController");
const {
  authenticate,
  authorize,
  filterByDistrict,
} = require("../middleware/auth");
const upload = require("../middleware/upload");

// Vendor routes
router.get("/vendor", authenticate, authorize("vendor"), getVendorBills);
router.post(
  "/",
  authenticate,
  authorize("vendor"),
  upload.array("documents", 5),
  createBill,
);
// District verifier routes
router.get(
  "/pending",
  authenticate,
  authorize("district_verifier"),
  filterByDistrict,
  getPendingBills,
);
// New routes for approved/rejected bills by district
router.get(
  "/approved",
  authenticate,
  authorize("district_verifier"),
  filterByDistrict,
  async (req, res) => {
    try {
      const Bill = require("../models/Bill");
      const { district } = req;

      let filter = {
        status: "approved",
      };

      if (district) {
        filter["districtData.district"] = district;
      }

      const bills = await Bill.find(filter)
        .populate("vendorId", "username email")
        .populate("approvedBy", "username")
        .sort({ approvedAt: -1 });

      res.json({
        success: true,
        count: bills.length,
        bills,
      });
    } catch (error) {
      console.error("Get approved bills error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch approved bills",
      });
    }
  },
);

router.get(
  "/rejected",
  authenticate,
  authorize("district_verifier"),
  filterByDistrict,
  async (req, res) => {
    try {
      const Bill = require("../models/Bill");
      const { district } = req;

      let filter = {
        status: "rejected",
      };

      if (district) {
        filter["districtData.district"] = district;
      }

      const bills = await Bill.find(filter)
        .populate("vendorId", "username email")
        .populate("rejectedBy", "username")
        .sort({ rejectedAt: -1 });

      res.json({
        success: true,
        count: bills.length,
        bills,
      });
    } catch (error) {
      console.error("Get rejected bills error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch rejected bills",
      });
    }
  },
);

// Admin routes
router.get(
  "/",
  authenticate,
  authorize("hq_admin", "super_admin"),
  getAllBills,
);
router.get(
  "/stats",
  authenticate,
  authorize("hq_admin", "super_admin"),
  getBillStatistics,
);

router.get("/:id", authenticate, getBillById);
router.put("/:id/submit", authenticate, authorize("vendor"), submitBill);
router.put(
  "/:id",
  authenticate,
  authorize("vendor"),
  upload.array("documents", 5),
  updateBill,
);
router.delete("/:id", authenticate, authorize("vendor"), deleteBill);

router.put(
  "/:id/approve",
  authenticate,
  authorize("district_verifier"),
  filterByDistrict,
  approveBill,
);
router.put(
  "/:id/reject",
  authenticate,
  authorize("district_verifier"),
  filterByDistrict,
  rejectBill,
);

// Common routes
router.get("/:id/audit", authenticate, getBillAuditLogs);
router.get("/:billId/document/:docIndex", authenticate, downloadDocument);

module.exports = router;
