const express = require("express");
const {
  getMyScores,
  createScore,
  updateScore,
  deleteScore,
} = require("../controllers/scoreController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getMyScores);
router.post("/", createScore);
router.put("/:id", updateScore);
router.delete("/:id", deleteScore);

module.exports = router;
