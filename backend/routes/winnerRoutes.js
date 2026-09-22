const express = require("express");
const {
  getMyWinnings,
  submitProof,
  getAllWinners,
  reviewProof,
  markPayoutPaid,
} = require("../controllers/winnerController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my-winnings", protect, getMyWinnings);

router.post("/:id/proof", protect, submitProof);

router.get("/admin/all", protect, adminOnly, getAllWinners);

router.patch("/:id/review-proof", protect, adminOnly, reviewProof);

router.patch("/:id/mark-paid", protect, adminOnly, markPayoutPaid);

module.exports = router;
