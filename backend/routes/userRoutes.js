const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  getUserDashboard,
  updateCharitySettings,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.get("/dashboard", protect, getUserDashboard);
router.put("/charity-settings", protect, updateCharitySettings);

module.exports = router;
