const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const JWT_SECRET = process.env.JWT_SECRET || "bvas-secret-key-2024";

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role,
      district: user.district,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, district } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    // Validate role for registration
    const allowedRoles = ["vendor", "district_verifier"]; // Only these roles can register
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Registration not allowed for this role",
      });
    }

    // District required for verifiers
    if (role === "district_verifier" && !district) {
      return res.status(400).json({
        success: false,
        message: "District is required for district verifiers",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = new User({
      username,
      email,
      password,
      role,
      district,
    });

    await user.save();

    const token = generateToken(user);

    await AuditLog.createLog({
      action: "REGISTER",
      entityType: "User",
      entityId: user._id,
      performedBy: user._id,
      details: `User ${username} registered with role ${user.role}`,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Generate token
    const token = generateToken(user);

    // Create audit log
    await AuditLog.createLog({
      action: "LOGIN",
      entityType: "User",
      entityId: user._id,
      performedBy: user._id,
      details: `User ${username} logged in`,
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Create user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role, district } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = new User({
      username,
      email,
      password,
      role,
      district,
    });

    await user.save();

    // Audit log
    await AuditLog.createLog({
      action: "CREATE_USER",
      entityType: "User",
      entityId: user._id,
      performedBy: req.user._id,
      details: `User ${req.user.username} created user ${username} with role ${role}`,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow password update here
    delete updates.password;

    Object.assign(user, updates);
    await user.save();

    // Audit log
    await AuditLog.createLog({
      action: "UPDATE_USER",
      entityType: "User",
      entityId: user._id,
      performedBy: req.user._id,
      details: `User ${req.user.username} updated user ${user.username}`,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    // Audit log
    await AuditLog.createLog({
      action: "DELETE_USER",
      entityType: "User",
      entityId: user._id,
      performedBy: req.user._id,
      details: `User ${req.user.username} deactivated user ${user.username}`,
    });

    res.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// Logout
exports.logout = (req, res) => {
  // Audit log
  AuditLog.createLog({
    action: "LOGOUT",
    entityType: "User",
    entityId: req.user._id,
    performedBy: req.user._id,
    details: `User ${req.user.username} logged out`,
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
