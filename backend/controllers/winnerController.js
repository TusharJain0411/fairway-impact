const Winner = require("../models/Winner");
const DrawEntry = require("../models/DrawEntry");
// User: view their own winnings
const getMyWinnings = async (req, res) => {
  try {
    const [winners, entries] = await Promise.all([
      Winner.find({ user: req.user._id })
        .populate("draw", "month status publishedAt")
        .sort({ createdAt: -1 }),

      DrawEntry.find({ user: req.user._id }).populate(
        "draw",
        "month status publishedAt",
      ),
    ]);

    const winnerByDraw = new Map(
      winners.map((winner) => [winner.draw._id.toString(), winner]),
    );

    const history = entries
      .filter((entry) => entry.draw)
      .map((entry) => {
        const winner = winnerByDraw.get(entry.draw._id.toString());
        const isUpcoming = !["published", "completed"].includes(
          entry.draw.status,
        );

        return {
          drawId: entry.draw._id,
          month: entry.draw.month,
          resultDate: entry.draw.publishedAt || entry.draw.month,
          match: winner?.matchType || "-",
          prize: winner?.prizeAmount || 0,
          status: isUpcoming
            ? "Upcoming"
            : winner
              ? winner.payoutStatus === "paid"
                ? "Paid"
                : "Payout pending"
              : "No prize",
          type: isUpcoming
            ? "upcoming"
            : winner
              ? winner.payoutStatus === "paid"
                ? "paid"
                : "pending-payout"
              : "no-prize",
        };
      })
      .sort((first, second) => new Date(second.month) - new Date(first.month));

    const currentDraw =
      history.find((draw) => draw.type === "upcoming") || null;

    const totalWinnings = winners.reduce(
      (total, winner) => total + winner.prizeAmount,
      0,
    );

    res.status(200).json({
      success: true,
      summary: {
        totalWinnings,
        totalWins: winners.length,
        drawsEntered: entries.length,
      },
      currentDraw,
      history,
    });
  } catch (error) {
    console.error("Get winnings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch winnings.",
    });
  }
};

// User: submit a screenshot/proof URL
const submitProof = async (req, res) => {
  try {
    const { proofUrl } = req.body;

    if (!proofUrl) {
      return res.status(400).json({
        success: false,
        message: "Proof URL is required.",
      });
    }

    const winner = await Winner.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found.",
      });
    }

    if (winner.proofStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Your proof has already been approved.",
      });
    }

    winner.proofUrl = proofUrl;
    winner.proofStatus = "submitted";

    await winner.save();

    res.status(200).json({
      success: true,
      message: "Proof submitted for admin review.",
      winner,
    });
  } catch (error) {
    console.error("Submit proof error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit proof.",
    });
  }
};

// Admin: view all winners
const getAllWinners = async (req, res) => {
  try {
    const winners = await Winner.find()
      .populate("user", "name email")
      .populate("draw", "month winningNumbers status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      winners,
    });
  } catch (error) {
    console.error("Get all winners error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch winners.",
    });
  }
};

// Admin: approve or reject submitted proof
const reviewProof = async (req, res) => {
  try {
    const { decision } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be approved or rejected.",
      });
    }

    const winner = await Winner.findById(req.params.id);

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found.",
      });
    }

    if (winner.proofStatus !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "This winner has not submitted proof yet.",
      });
    }

    winner.proofStatus = decision;
    winner.reviewedBy = req.user._id;
    winner.reviewedAt = new Date();

    await winner.save();

    res.status(200).json({
      success: true,
      message: `Proof ${decision}.`,
      winner,
    });
  } catch (error) {
    console.error("Review proof error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to review proof.",
    });
  }
};

// Admin: mark approved winner as paid
const markPayoutPaid = async (req, res) => {
  try {
    const winner = await Winner.findById(req.params.id);

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found.",
      });
    }

    if (winner.payoutStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This payout is already marked as paid.",
      });
    }

    winner.payoutStatus = "paid";
    winner.paidAt = new Date();

    await winner.save();

    res.status(200).json({
      success: true,
      message: "Payout marked as paid.",
      winner,
    });
  } catch (error) {
    console.error("Mark payout error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update payout.",
    });
  }
};

module.exports={
  getMyWinnings,
  submitProof,
  getAllWinners,
  reviewProof,
  markPayoutPaid,
  
}