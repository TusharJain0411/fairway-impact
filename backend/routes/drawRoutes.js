const express = require("express");
const {
  createDraw,
  getCurrentDraw,
  getAllDraws,
  openDraw,
  simulateDraw,
  publishDraw,
   updateDrawMode,
   endDraw,
} = require("../controllers/drawController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/current", getCurrentDraw);

router.get("/admin/all", protect, adminOnly, getAllDraws);

router.post("/", protect, adminOnly, createDraw);

router.patch("/:id/open", protect, adminOnly, openDraw);

router.post("/:id/simulate", protect, adminOnly, simulateDraw);

router.post("/:id/publish", protect, adminOnly, publishDraw);

router.patch("/:id/mode", protect, adminOnly, updateDrawMode);

router.patch("/:id/end", protect, adminOnly, endDraw);

module.exports = router;
