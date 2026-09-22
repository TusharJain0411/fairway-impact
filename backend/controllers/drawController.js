
const Draw = require("../models/Draw");
const Subscription = require("../models/Subscription");
const Score = require("../models/Score");
const DrawEntry = require("../models/DrawEntry");
const Winner = require("../models/Winner");

const normalizeMonth = (month) => {
  const date = new Date(month);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getEligibleEntries = async (draw) => {
  const existingEntries = await DrawEntry.find({ draw: draw._id });

  if (existingEntries.length > 0) {
    return existingEntries;
  }

  const subscriptions = await Subscription.find({
    status: "active",
  }).select("_id user");

  const entries = [];

  for (const subscription of subscriptions) {
    const scores = await Score.find({
      user: subscription.user,
    })
      .sort({ playedOn: -1 })
      .limit(5);

    // A user must have exactly 5 scores for draw eligibility
    if (scores.length !== 5) continue;

    entries.push({
      draw: draw._id,
      user: subscription.user,
      subscription: subscription._id,
      scoreSnapshot: scores.map((score) => ({
        score: score.score,
        playedOn: score.playedOn,
        course: score.course,
      })),
      scoreNumbers: scores.map((score) => score.score),
    });
  }

  if (entries.length > 0) {
    await DrawEntry.insertMany(entries);
  }

  return DrawEntry.find({ draw: draw._id });
};

const randomNumbers = () => {
  const numbers = new Set();

  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  return [...numbers].sort((a, b) => a - b);
};

const algorithmicNumbers = (entries) => {
  const frequency = new Map();

  entries.forEach((entry) => {
    entry.scoreNumbers.forEach((number) => {
      frequency.set(number, (frequency.get(number) || 0) + 1);
    });
  });

  const selectedNumbers = [];
  const candidates = [...frequency.entries()];

  while (selectedNumbers.length < 5 && candidates.length > 0) {
    const totalWeight = candidates.reduce(
      (total, [, weight]) => total + weight,
      0,
    );

    let randomWeight = Math.random() * totalWeight;

    for (let index = 0; index < candidates.length; index++) {
      randomWeight -= candidates[index][1];

      if (randomWeight <= 0) {
        selectedNumbers.push(candidates[index][0]);
        candidates.splice(index, 1);
        break;
      }
    }
  }

  // Fill remaining numbers randomly if fewer than 5 unique scores exist
  while (selectedNumbers.length < 5) {
    const randomNumber = Math.floor(Math.random() * 45) + 1;

    if (!selectedNumbers.includes(randomNumber)) {
      selectedNumbers.push(randomNumber);
    }
  }

  return selectedNumbers.sort((a, b) => a - b);
};

const getMatchData = (scoreNumbers, winningNumbers) => {
  const uniqueScoreNumbers = [...new Set(scoreNumbers)];

  const matchedNumbers = uniqueScoreNumbers.filter((number) =>
    winningNumbers.includes(number),
  );

  return {
    matchCount: matchedNumbers.length,
    matchedNumbers,
  };
};


const createPrizeTiers = (prizePoolAmount, jackpotCarryoverIn = 0) => ({
  fiveNumber: {
    sharePercent: 40,
    amount: Math.round(prizePoolAmount * 0.4) + jackpotCarryoverIn,
  },
  fourNumber: {
    sharePercent: 35,
    amount: Math.round(prizePoolAmount * 0.35),
  },
  threeNumber: {
    sharePercent: 25,
    amount: Math.round(prizePoolAmount * 0.25),
  },
});

// POST /api/draws
const createDraw = async (req, res) => {
  try {
    const { month, drawMode, prizePoolAmount } = req.body;
    const normalizedMonth = normalizeMonth(month);

    if (!normalizedMonth || !prizePoolAmount) {
      return res.status(400).json({
        success: false,
        message: "Month and prize pool amount are required.",
      });
    }

    const existingDraw = await Draw.findOne({
      month: normalizedMonth,
    });

    if (existingDraw) {
      return res.status(409).json({
        success: false,
        message: "A draw already exists for this month.",
      });
    }

    const eligibleSubscriberCount = await Subscription.countDocuments({
      status: "active",
    });

    const previousDraw = await Draw.findOne({
      status: { $in: ["published", "completed"] },
    }).sort({ month: -1 });

    const jackpotCarryoverIn = previousDraw?.jackpotCarryoverOut || 0;

    const draw = await Draw.create({
      month: normalizedMonth,
      drawMode: drawMode || "random",
      prizePoolAmount: Number(prizePoolAmount),
      jackpotCarryoverIn,
      prizeTiers: createPrizeTiers(Number(prizePoolAmount), jackpotCarryoverIn),
      eligibleSubscriberCount,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Draw created successfully.",
      draw,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create draw.",
    });
  }
};

// GET /api/draws/current
const getCurrentDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne({
      status: { $in: ["open", "published"] },
    }).sort({ month: -1 });

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "No active draw found.",
      });
    }

    res.status(200).json({
      success: true,
      draw,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch current draw.",
    });
  }
};

// GET /api/draws/admin/all
const getAllDraws = async (req, res) => {
  try {
    const draws = await Draw.find()
      .populate("createdBy", "name email")
      .sort({ month: -1 });

    res.status(200).json({
      success: true,
      count: draws.length,
      draws,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch draws.",
    });
  }
};

// PATCH /api/draws/:id/open
const openDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (draw.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft draws can be opened.",
      });
    }

    draw.status = "open";
    await draw.save();

    res.status(200).json({
      success: true,
      message: "Draw is now open.",
      draw,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to open draw.",
    });
  }
};

// POST /api/draws/:id/simulate
const simulateDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (draw.status === "published" || draw.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Published draws cannot be simulated again.",
      });
    }

    const entries = await getEligibleEntries(draw);

    if (entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No eligible users have five scores.",
      });
    }

    const winningNumbers =
      draw.drawMode === "algorithmic"
        ? algorithmicNumbers(entries)
        : randomNumbers();

    draw.winningNumbers = winningNumbers;
    draw.eligibleSubscriberCount = entries.length;

    await draw.save();

    res.status(200).json({
      success: true,
      message: "Draw simulation completed.",
      draw,
      eligibleEntries: entries.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to simulate draw.",
    });
  }
};

// POST /api/draws/:id/publish
const publishDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (draw.status === "published" || draw.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Draw results are already published.",
      });
    }

    if (draw.winningNumbers.length !== 5) {
      return res.status(400).json({
        success: false,
        message: "Run a simulation before publishing the draw.",
      });
    }

    const entries = await getEligibleEntries(draw);

    const groupedWinners = {
      3: [],
      4: [],
      5: [],
    };

    entries.forEach((entry) => {
      const { matchCount, matchedNumbers } = getMatchData(
        entry.scoreNumbers,
        draw.winningNumbers
      );

      if (matchCount >= 3) {
        groupedWinners[matchCount].push({
          entry,
          matchedNumbers,
        });
      }
    });

    const tierMap = {
      3: draw.prizeTiers.threeNumber.amount,
      4: draw.prizeTiers.fourNumber.amount,
      5: draw.prizeTiers.fiveNumber.amount,
    };

    const winnerDocuments = [];

    [3, 4, 5].forEach((matchCount) => {
      const winnersInTier = groupedWinners[matchCount];

      if (winnersInTier.length === 0) return;

      const prizePerWinner = Math.floor(
        tierMap[matchCount] / winnersInTier.length
      );

      winnersInTier.forEach(({ entry, matchedNumbers }) => {
        winnerDocuments.push({
          draw: draw._id,
          user: entry.user,
          drawEntry: entry._id,
          matchCount,
          matchType: `${matchCount}-number match`,
          matchedNumbers,
          prizeAmount: prizePerWinner,
        });
      });
    });

    if (winnerDocuments.length > 0) {
      await Winner.insertMany(winnerDocuments);
    }

    // 5-number prize becomes next draw's jackpot if unclaimed
    draw.jackpotCarryoverOut =
      groupedWinners[5].length === 0
        ? draw.prizeTiers.fiveNumber.amount
        : 0;

    draw.status = "published";
    draw.publishedAt = new Date();
    draw.eligibleSubscriberCount = entries.length;

    await draw.save();

    res.status(200).json({
      success: true,
      message: "Draw results published successfully.",
      draw,
      winnersCreated: winnerDocuments.length,
      jackpotCarryoverOut: draw.jackpotCarryoverOut,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to publish draw results.",
    });
  }
};

const updateDrawMode = async (req, res) => {
  try {
    const { drawMode } = req.body;

    if (!["random", "algorithmic"].includes(drawMode)) {
      return res.status(400).json({
        success: false,
        message: "Draw mode must be random or algorithmic.",
      });
    }

    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (["published", "completed"].includes(draw.status)) {
      return res.status(400).json({
        success: false,
        message: "Published draws cannot be changed.",
      });
    }

    draw.drawMode = drawMode;
    await draw.save();

    res.status(200).json({
      success: true,
      message: "Draw mode updated.",
      draw,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update draw mode.",
    });
  }
};

const endDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found.",
      });
    }

    if (draw.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Only a published draw can be ended.",
      });
    }

    draw.status = "completed";
    await draw.save();

    res.status(200).json({
      success: true,
      message: "Draw ended successfully. Results and payouts are preserved.",
      draw,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to end draw.",
    });
  }
};

module.exports = {
  createDraw,
  getCurrentDraw,
  getAllDraws,
  openDraw,
  simulateDraw,
  publishDraw,
  updateDrawMode,
  endDraw,
};
