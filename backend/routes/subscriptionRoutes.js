const express = require("express");
const {
  createSubscription,
  getMySubscription,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/create", createSubscription);
router.get("/my-subscription", getMySubscription);

module.exports = router;
