const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String,
      required: true,
      enum: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    year: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "pending",
        "approved",
        "rejected",
        "resubmitted",
      ],
      default: "draft",
    },
    districtData: [
      {
        district: String,
        quantity: Number,
        amount: Number,
      },
    ],
    documents: [
      {
        filename: String,
        originalname: String,
        path: String,
        uploadedAt: Date,
      },
    ],
    remarks: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    submittedAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    signature: {
      signedBy: String,
      signedAt: Date,
      signatureData: String,
    },
    auditLogs: [
      {
        action: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        performedAt: {
          type: Date,
          default: Date.now,
        },
        details: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Generate bill number before save
billSchema.pre("save", function () {
  if (this.isNew && !this.billNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.billNumber = `BILL-${timestamp}-${random}`;
  }
});

// Add audit log method
billSchema.methods.addAuditLog = function (action, userId, details) {
  this.auditLogs.push({
    action,
    performedBy: userId,
    details,
  });
  return this.save();
};

const Bill = mongoose.model("Bill", billSchema);

// Create demo bills
Bill.initBills = async (User) => {
  const count = await Bill.countDocuments();
  if (count === 0) {
    const vendor = await User.findOne({ role: "vendor" });
    const verifier = await User.findOne({ role: "district_verifier" });

    if (vendor && verifier) {
      const bills = [
        {
          billNumber: "BILL-DEMO-001",
          vendorId: vendor._id,
          month: "January",
          year: 2024,
          totalAmount: 150000.5,
          status: "approved",
          approvedBy: verifier._id,
          approvedAt: new Date(),
          submittedAt: new Date("2024-01-10"),
          districtData: [
            { district: "Dehradun", quantity: 1000, amount: 50000 },
            { district: "Hardwar", quantity: 2000, amount: 100000.5 },
          ],
          signature: {
            signedBy: verifier.username,
            signedAt: new Date(),
            signatureData: "MOCK_SIGNATURE_DATA",
          },
        },
        {
          billNumber: "BILL-DEMO-002",
          vendorId: vendor._id,
          month: "February",
          year: 2024,
          totalAmount: 175000.75,
          status: "pending",
          submittedAt: new Date("2024-02-05"),
          districtData: [
            { district: "Dehradun", quantity: 1200, amount: 60000 },
            { district: "Hardwar", quantity: 2300, amount: 115000.75 },
          ],
        },
        {
          billNumber: "BILL-DEMO-003",
          vendorId: vendor._id,
          month: "March",
          year: 2024,
          totalAmount: 125000.25,
          status: "rejected",
          remarks: "Quantity mismatch with ePOS data",
          rejectedBy: verifier._id,
          rejectedAt: new Date("2024-03-02"),
          submittedAt: new Date("2024-03-01"),
          districtData: [
            { district: "Dehradun", quantity: 800, amount: 40000 },
            { district: "Hardwar", quantity: 1700, amount: 85000.25 },
          ],
        },
      ];

      for (const billData of bills) {
        const bill = new Bill(billData);
        await bill.save();

        // Add audit logs
        if (billData.status === "approved") {
          await bill.addAuditLog(
            "APPROVED",
            verifier._id,
            "Bill approved with digital signature",
          );
        } else if (billData.status === "rejected") {
          await bill.addAuditLog("REJECTED", verifier._id, billData.remarks);
        }
        await bill.addAuditLog(
          "SUBMITTED",
          vendor._id,
          "Bill submitted for verification",
        );
      }
      console.log("✅ Demo bills created");
    }
  }
};

module.exports = Bill;
