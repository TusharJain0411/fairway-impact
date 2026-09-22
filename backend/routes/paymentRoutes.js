const express = require("express");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);

module.exports = router;
