const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["vendor", "district_verifier", "hq_admin", "super_admin"],
    default: "vendor",
  },
  district: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

// Create initial users if none exist
User.initUsers = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    const users = [
      {
        username: "superadmin",
        email: "superadmin@bvas.com",
        password: "Admin@123",
        role: "super_admin",
      },
      {
        username: "hqadmin",
        email: "hqadmin@bvas.com",
        password: "Admin@123",
        role: "hq_admin",
      },
      {
        username: "verifier_dehradun",
        email: "verifier1@bvas.com",
        password: "Admin@123",
        role: "district_verifier",
        district: "Dehradun",
      },
      {
        username: "verifier_hardwar",
        email: "verifier2@bvas.com",
        password: "Admin@123",
        role: "district_verifier",
        district: "Hardwar",
      },
      {
        username: "vendor1",
        email: "vendor1@bvas.com",
        password: "Admin@123",
        role: "vendor",
      },
      {
        username: "vendor2",
        email: "vendor2@bvas.com",
        password: "Admin@123",
        role: "vendor",
      },
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log("✅ Initial users created");
  }
};

module.exports = User;
