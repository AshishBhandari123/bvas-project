const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import database and models
const { connectDB } = require("./config/database");
const User = require("./models/User");
const Bill = require("./models/Bill");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://bvas-beta.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api", routes);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BVAS API",
    description: "Bill Verification and Approval System",
    endpoints: {
      auth: "/api/auth",
      bills: "/api/bills",
      health: "/api/health",
    },
    demo: {
      quickLogin: "POST /api/auth/quick-login",
      body: '{ "role": "super_admin" }',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize data
    await User.initUsers();
    await Bill.initBills(User);

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📊 API Base: http://localhost:${PORT}/api`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`📄 Bills: http://localhost:${PORT}/api/bills`);
      console.log(`❤️ Health: http://localhost:${PORT}/api/health`);

      console.log("\n🚀 QUICK START:");
      console.log("=====================================");
      console.log("1. Quick login (no password needed):");
      console.log("   POST http://localhost:5000/api/auth/quick-login");
      console.log('   Body: { "role": "super_admin" }');
      console.log("\n2. Get all bills (admin only):");
      console.log("   GET http://localhost:5000/api/bills");
      console.log("   Header: Authorization: Bearer <token>");
      console.log("\n3. Get vendor bills:");
      console.log("   GET http://localhost:5000/api/bills/vendor");
      console.log("   (Login as vendor first)");
      console.log("=====================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  process.exit(0);
});

startServer();
