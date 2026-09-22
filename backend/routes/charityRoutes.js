const express = require("express");
const {
  getCharities,
  getAllCharities,
  createCharity,
  updateCharity,
  deleteCharity,
} = require("../controllers/charityController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCharities);

router.get("/admin/all", protect, adminOnly, getAllCharities);

router.post("/", protect, adminOnly, createCharity);

router.put("/:id", protect, adminOnly, updateCharity);

router.delete("/:id", protect, adminOnly, deleteCharity);

module.exports = router;
