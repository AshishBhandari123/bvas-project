const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  logout,
} = require("../controllers/authController");
const { authenticate, authorize } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

// Admin only routes
router.get(
  "/users",
  authenticate,
  authorize("hq_admin", "super_admin"),
  getAllUsers,
);
router.post(
  "/users",
  authenticate,
  authorize("hq_admin", "super_admin"),
  createUser,
);
router.put(
  "/users/:id",
  authenticate,
  authorize("hq_admin", "super_admin"),
  updateUser,
);
router.delete(
  "/users/:id",
  authenticate,
  authorize("hq_admin", "super_admin"),
  deleteUser,
);

module.exports = router;
