const express = require("express");
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardStats);

router.get("/users", protect, adminOnly, getUsers);

router.get("/users/:id", protect, adminOnly, getUserById);

router.patch("/users/:id", protect, adminOnly, updateUser);

router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
