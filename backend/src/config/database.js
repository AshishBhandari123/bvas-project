const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/bvas_db";

    // ✅ WAIT for connection
    await mongoose.connect(mongoURI);

    console.log("✅ MongoDB connected successfully");

    const db = mongoose.connection.db;

    // ✅ Safe now — db is ready
    await db.collection("users").createIndex({ username: 1 }, { unique: true });

    await db.collection("users").createIndex({ email: 1 }, { unique: true });

    await db
      .collection("bills")
      .createIndex({ billNumber: 1 }, { unique: true });

    await db.collection("bills").createIndex({ vendorId: 1, status: 1 });

    console.log("✅ Indexes created successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
