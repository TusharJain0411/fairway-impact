const Score = require("../models/Score");

const normalizeDate = (date) => {
  const normalized = new Date(date);

  if (Number.isNaN(normalized.getTime())) {
    return null;
  }

  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// GET /api/scores
const getMyScores = async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user._id })
      .sort({ playedOn: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: scores.length,
      scores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch scores.",
    });
  }
};

// POST /api/scores
const createScore = async (req, res) => {
  try {
    const { score, playedOn, course } = req.body;
    const normalizedDate = normalizeDate(playedOn);

    if (!score || !playedOn) {
      return res.status(400).json({
        success: false,
        message: "Score and date played are required.",
      });
    }

    if (Number(score) < 1 || Number(score) > 45) {
      return res.status(400).json({
        success: false,
        message: "Stableford score must be between 1 and 45.",
      });
    }

    if (!normalizedDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date.",
      });
    }

    const existingScore = await Score.findOne({
      user: req.user._id,
      playedOn: normalizedDate,
    });

    if (existingScore) {
      return res.status(409).json({
        success: false,
        message: "A score already exists for this date. Edit it instead.",
      });
    }

    const newScore = await Score.create({
      user: req.user._id,
      score: Number(score),
      playedOn: normalizedDate,
      course: course || "Golf Course",
    });

    // Keep only latest 5 scores by date
    const scores = await Score.find({ user: req.user._id }).sort({
      playedOn: -1,
    });

    if (scores.length > 5) {
      const scoreIdsToDelete = scores.slice(5).map((item) => item._id);

      await Score.deleteMany({
        _id: { $in: scoreIdsToDelete },
      });
    }

    const latestScores = await Score.find({ user: req.user._id })
      .sort({ playedOn: -1 })
      .limit(5);

    res.status(201).json({
      success: true,
      message: "Score added successfully.",
      score: newScore,
      scores: latestScores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add score.",
    });
  }
};

// PUT /api/scores/:id
const updateScore = async (req, res) => {
  try {
    const scoreRecord = await Score.findById(req.params.id);

    if (!scoreRecord) {
      return res.status(404).json({
        success: false,
        message: "Score not found.",
      });
    }

    const isOwner = scoreRecord.user.toString() === req.user._id.toString();

    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot edit this score.",
      });
    }

    const { score, playedOn, course } = req.body;
    const normalizedDate = normalizeDate(playedOn);

    if (!score || !playedOn || !normalizedDate) {
      return res.status(400).json({
        success: false,
        message: "Valid score and date played are required.",
      });
    }

    const duplicateScore = await Score.findOne({
      user: scoreRecord.user,
      playedOn: normalizedDate,
      _id: { $ne: scoreRecord._id },
    });

    if (duplicateScore) {
      return res.status(409).json({
        success: false,
        message: "A score already exists for this date.",
      });
    }

    scoreRecord.score = Number(score);
    scoreRecord.playedOn = normalizedDate;
    scoreRecord.course = course || "Golf Course";

    await scoreRecord.save();

    res.status(200).json({
      success: true,
      message: "Score updated successfully.",
      score: scoreRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update score.",
    });
  }
};

// DELETE /api/scores/:id
const deleteScore = async (req, res) => {
  try {
    const scoreRecord = await Score.findById(req.params.id);

    if (!scoreRecord) {
      return res.status(404).json({
        success: false,
        message: "Score not found.",
      });
    }

    const isOwner = scoreRecord.user.toString() === req.user._id.toString();

    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this score.",
      });
    }

    await scoreRecord.deleteOne();

    res.status(200).json({
      success: true,
      message: "Score deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete score.",
    });
  }
};

module.exports = {
  getMyScores,
  createScore,
  updateScore,
  deleteScore,
};
