const Bill = require("../models/Bill");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const path = require("path");
const fs = require("fs");

// Get all bills (admin only)
exports.getAllBills = async (req, res) => {
  try {
    const { status, month, year, vendorId, district } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year);
    if (vendorId) filter.vendorId = vendorId;

    // District filter for verifiers
    if (district) {
      filter["districtData.district"] = district;
    }

    const bills = await Bill.find(filter)
      .populate("vendorId", "username email")
      .populate("approvedBy", "username")
      .populate("rejectedBy", "username")
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: await Bill.countDocuments(),
      draft: await Bill.countDocuments({ status: "draft" }),
      submitted: await Bill.countDocuments({ status: "submitted" }),
      pending: await Bill.countDocuments({ status: "pending" }),
      approved: await Bill.countDocuments({ status: "approved" }),
      rejected: await Bill.countDocuments({ status: "rejected" }),
    };

    res.json({
      success: true,
      count: bills.length,
      stats,
      bills,
    });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
    });
  }
};

// Get vendor's bills
exports.getVendorBills = async (req, res) => {
  try {
    const bills = await Bill.find({ vendorId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
    });
  }
};

// Get pending bills for district verifier
// exports.getPendingBills = async (req, res) => {
//   try {
//     const { district } = req;

//     console.log(district);

//     let filter = { status: "submitted" };

//     if (district) {
//       filter["districtData.district"] = district;
//     }

//     const bills = await Bill.find(filter)
//       .populate("vendorId", "username email")
//       .sort({ submittedAt: 1 });

//     res.json({
//       success: true,
//       count: bills.length,
//       bills,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch pending bills",
//     });
//   }
// };
// In billController.js - FIX getPendingBills
exports.getPendingBills = async (req, res) => {
  try {
    console.log("getPendingBills called");
    console.log("User:", req.user?.username);
    console.log("User district:", req.user?.district);
    console.log("Request district:", req.district);

    const { district } = req;

    let filter = {
      status: { $in: ["submitted", "pending"] }, // Check both statuses
    };

    if (district) {
      console.log("Filtering by district:", district);
      // districtData is an array of objects, so use $elemMatch
      filter["districtData"] = {
        $elemMatch: { district: district },
      };
    }

    console.log("Filter for pending bills:", JSON.stringify(filter));

    const bills = await Bill.find(filter)
      .populate("vendorId", "username email")
      .sort({ submittedAt: 1 });

    console.log(`Found ${bills.length} pending/submitted bills`);

    res.json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    console.error("Get pending bills error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending bills",
      error: error.message,
    });
  }
};

// Create new bill
exports.createBill = async (req, res) => {
  try {
    const { month, year, totalAmount, districtData } = req.body;

    // Parse district data
    let parsedDistrictData = [];
    try {
      if (districtData && typeof districtData === "string") {
        parsedDistrictData = JSON.parse(districtData);
      } else if (Array.isArray(districtData)) {
        parsedDistrictData = districtData;
      }
    } catch (e) {
      parsedDistrictData = [];
    }

    const bill = new Bill({
      vendorId: req.user._id,
      month,
      year: parseInt(year),
      totalAmount: parseFloat(totalAmount),
      districtData: parsedDistrictData,
      status: "draft",
    });

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      bill.documents = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        uploadedAt: new Date(),
      }));
    }

    await bill.save();

    // Add audit log
    await bill.addAuditLog("CREATED", req.user._id, "Bill created as draft");

    // System audit log
    await AuditLog.createLog({
      action: "CREATE_BILL",
      entityType: "Bill",
      entityId: bill._id,
      performedBy: req.user._id,
      details: `Vendor ${req.user.username} created bill ${bill.billNumber}`,
    });

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill,
    });
  } catch (error) {
    console.error("Create bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bill",
    });
  }
};

// Get bill by ID
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findById(id)
      .populate("vendorId", "username email")
      .populate("approvedBy", "username")
      .populate("rejectedBy", "username");

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Check permissions
    if (req.user.role === "vendor" && !bill.vendorId._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (req.user.role === "district_verifier" && req.district) {
      const hasDistrict = bill.districtData.some(
        (d) => d.district === req.district,
      );
      if (!hasDistrict) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    res.json({
      success: true,
      bill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bill",
    });
  }
};

// Submit bill
exports.submitBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findOne({
      _id: id,
      vendorId: req.user._id,
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (bill.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft bills can be submitted",
      });
    }

    bill.status = "submitted";
    bill.submittedAt = new Date();
    await bill.save();

    // Add audit logs
    await bill.addAuditLog(
      "SUBMITTED",
      req.user._id,
      "Bill submitted for verification",
    );

    await AuditLog.createLog({
      action: "SUBMIT_BILL",
      entityType: "Bill",
      entityId: bill._id,
      performedBy: req.user._id,
      details: `Vendor ${req.user.username} submitted bill ${bill.billNumber}`,
    });

    res.json({
      success: true,
      message: "Bill submitted successfully",
      bill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit bill",
    });
  }
};

// Approve bill
exports.approveBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const bill = await Bill.findById(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (bill.status !== "submitted" && bill.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only submitted or pending bills can be approved",
      });
    }

    // Check district access for verifiers
    if (req.user.role === "district_verifier" && req.district) {
      const hasDistrict = bill.districtData.some(
        (d) => d.district === req.district,
      );
      if (!hasDistrict) {
        return res.status(403).json({
          success: false,
          message: "You can only approve bills for your district",
        });
      }
    }

    bill.status = "approved";
    bill.approvedBy = req.user._id;
    bill.approvedAt = new Date();
    bill.remarks = remarks || "";

    // Mock digital signature
    bill.signature = {
      signedBy: req.user.username,
      signedAt: new Date(),
      signatureData: `MOCK_SIGNATURE_${Date.now()}_${req.user._id}`,
    };

    await bill.save();

    // Add audit logs
    await bill.addAuditLog(
      "APPROVED",
      req.user._id,
      `Bill approved with signature. Remarks: ${remarks}`,
    );

    await AuditLog.createLog({
      action: "APPROVE_BILL",
      entityType: "Bill",
      entityId: bill._id,
      performedBy: req.user._id,
      details: `User ${req.user.username} approved bill ${bill.billNumber} with digital signature`,
    });

    res.json({
      success: true,
      message: "Bill approved successfully",
      bill,
    });
  } catch (error) {
    console.error("Approve bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve bill",
    });
  }
};

// Reject bill
exports.rejectBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks || remarks.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Remarks are required for rejection",
      });
    }

    const bill = await Bill.findById(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (bill.status !== "submitted" && bill.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only submitted or pending bills can be rejected",
      });
    }

    // Check district access for verifiers
    if (req.user.role === "district_verifier" && req.district) {
      const hasDistrict = bill.districtData.some(
        (d) => d.district === req.district,
      );
      if (!hasDistrict) {
        return res.status(403).json({
          success: false,
          message: "You can only reject bills for your district",
        });
      }
    }

    bill.status = "rejected";
    bill.rejectedBy = req.user._id;
    bill.rejectedAt = new Date();
    bill.remarks = remarks.trim();

    await bill.save();

    // Add audit logs
    await bill.addAuditLog(
      "REJECTED",
      req.user._id,
      `Bill rejected. Remarks: ${remarks}`,
    );

    await AuditLog.createLog({
      action: "REJECT_BILL",
      entityType: "Bill",
      entityId: bill._id,
      performedBy: req.user._id,
      details: `User ${req.user.username} rejected bill ${bill.billNumber}. Remarks: ${remarks}`,
    });

    res.json({
      success: true,
      message: "Bill rejected successfully",
      bill,
    });
  } catch (error) {
    console.error("Reject bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject bill",
    });
  }
};

// Update bill
exports.updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, totalAmount, districtData } = req.body;

    const bill = await Bill.findOne({
      _id: id,
      vendorId: req.user._id,
      status: { $in: ["draft", "rejected"] },
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found or cannot be edited",
      });
    }

    // Update fields
    if (month) bill.month = month;
    if (year) bill.year = parseInt(year);
    if (totalAmount) bill.totalAmount = parseFloat(totalAmount);

    if (districtData) {
      try {
        bill.districtData =
          typeof districtData === "string"
            ? JSON.parse(districtData)
            : districtData;
      } catch (e) {
        bill.districtData = [];
      }
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      bill.documents = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        uploadedAt: new Date(),
      }));
    }

    // If bill was rejected, change status to resubmitted
    if (bill.status === "rejected") {
      bill.status = "resubmitted";
    }

    await bill.save();

    // Add audit log
    await bill.addAuditLog("UPDATED", req.user._id, "Bill updated");

    await AuditLog.createLog({
      action: "UPDATE_BILL",
      entityType: "Bill",
      entityId: bill._id,
      performedBy: req.user._id,
      details: `Vendor ${req.user.username} updated bill ${bill.billNumber}`,
    });

    res.json({
      success: true,
      message: "Bill updated successfully",
      bill,
    });
  } catch (error) {
    console.error("Update bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bill",
    });
  }
};

// Delete bill
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findOne({
      _id: id,
      vendorId: req.user._id,
      status: "draft",
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found or cannot be deleted",
      });
    }

    // Delete uploaded files
    if (bill.documents && bill.documents.length > 0) {
      bill.documents.forEach((doc) => {
        const filePath = path.join(__dirname, "..", doc.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await bill.deleteOne();

    // Audit log
    await AuditLog.createLog({
      action: "DELETE_BILL",
      entityType: "Bill",
      entityId: id,
      performedBy: req.user._id,
      details: `Vendor ${req.user.username} deleted bill ${bill.billNumber}`,
    });

    res.json({
      success: true,
      message: "Bill deleted successfully",
    });
  } catch (error) {
    console.error("Delete bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete bill",
    });
  }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const { billId, docIndex } = req.params;

    const bill = await Bill.findById(billId);

    if (!bill || !bill.documents || !bill.documents[docIndex]) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const document = bill.documents[docIndex];
    const filePath = path.join(__dirname, "..", document.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.download(filePath, document.originalname);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to download document",
    });
  }
};

// Get bill statistics
exports.getBillStatistics = async (req, res) => {
  try {
    const stats = {
      total: await Bill.countDocuments(),
      draft: await Bill.countDocuments({ status: "draft" }),
      submitted: await Bill.countDocuments({ status: "submitted" }),
      pending: await Bill.countDocuments({ status: "pending" }),
      approved: await Bill.countDocuments({ status: "approved" }),
      rejected: await Bill.countDocuments({ status: "rejected" }),
      resubmitted: await Bill.countDocuments({ status: "resubmitted" }),
    };

    // Monthly statistics
    const monthlyStats = await Bill.aggregate([
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      stats,
      monthlyStats,
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
    });
  }
};

// Get audit logs for bill
exports.getBillAuditLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findById(id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    res.json({
      success: true,
      logs: bill.auditLogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get audit logs",
    });
  }
};
