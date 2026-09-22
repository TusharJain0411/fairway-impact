const User = require("../models/User");
const Charity = require("../models/Charity");
const Draw = require("../models/Draw");
const Winner = require("../models/Winner");
const Payment = require("../models/Payment");
const Score = require("../models/Score");
const Subscription = require("../models/Subscription");

const getDashboardStats = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalMembers,
      totalCharities,
      pendingPayouts,
      currentDraw,
      recentMembers,
      monthlyCharityContribution,
    ] = await Promise.all([
      User.countDocuments({ isAdmin: false }),

      Charity.countDocuments({ isActive: true }),

      Winner.countDocuments({ payoutStatus: "pending" }),

      Draw.findOne({
        status: { $in: ["open", "published"] },
      }).sort({ month: -1 }),

      User.find({ isAdmin: false })
        .select("name email selectedCharity createdAt isActive")
        .populate("selectedCharity", "name")
        .sort({ createdAt: -1 })
        .limit(5),

      Payment.aggregate([
        {
          $match: {
            status: "success",
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "subscription",
            foreignField: "_id",
            as: "subscriptionData",
          },
        },
        {
          $unwind: "$subscriptionData",
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                  "$amount",
                  {
                    $divide: [
                      "$subscriptionData.charityContributionPercent",
                      100,
                    ],
                  },
                ],
              },
            },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalMembers,
        totalCharities,
        pendingPayouts,
        currentPrizePool: currentDraw?.prizePoolAmount || 0,
        currentDraw: currentDraw
          ? {
              id: currentDraw._id,
              month: currentDraw.month,
              status: currentDraw.status,
              eligibleSubscriberCount: currentDraw.eligibleSubscriberCount,
            }
          : null,
        charityContributionsThisMonth:
          monthlyCharityContribution[0]?.total || 0,
      },
      recentMembers,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics.",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";

    const filter = {
      isAdmin: false,
      ...(search && {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }),
    };

    const users = await User.find(filter)
      .select("name email selectedCharity isActive createdAt")
      .populate("selectedCharity", "name")
      .sort({ createdAt: -1 });

    const userIds = users.map((user) => user._id);

    const scoreCounts = await Score.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: "$user", totalScores: { $sum: 1 } } },
    ]);

    const scoreCountMap = new Map(
      scoreCounts.map((item) => [item._id.toString(), item.totalScores]),
    );

    const subscriptions = await Subscription.find({
      user: { $in: userIds },
    })
      .sort({ createdAt: -1 })
      .select("user plan status");

    const subscriptionMap = new Map();

    subscriptions.forEach((subscription) => {
      if (!subscriptionMap.has(subscription.user.toString())) {
        subscriptionMap.set(subscription.user.toString(), subscription);
      }
    });

    const formattedUsers = users.map((user) => {
      const subscription = subscriptionMap.get(user._id.toString());

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        charity: user.selectedCharity?.name || "No charity selected",
        scores: scoreCountMap.get(user._id.toString()) || 0,
        plan: subscription?.plan || "No subscription",
        subscriptionStatus: subscription?.status || "none",
        isActive: user.isActive,
        joined: user.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      total: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Get admin users error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch users.",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isAdmin: false,
    })
      .select("-password")
      .populate("selectedCharity", "name category");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const [subscription, totalScores, winnings] = await Promise.all([
      Subscription.findOne({ user: user._id }).sort({ createdAt: -1 }),

      Score.countDocuments({ user: user._id }),

      Winner.find({ user: user._id }).select(
        "prizeAmount payoutStatus matchType createdAt",
      ),
    ]);

    res.status(200).json({
      success: true,
      user,
      subscription,
      totalScores,
      winnings,
    });
  } catch (error) {
    console.error("Get user details error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch user details.",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, isActive } = req.body;

    const user = await User.findOne({
      _id: req.params.id,
      isAdmin: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email is already used by another account.",
        });
      }

      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (typeof isActive === "boolean") user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update user.",
    });
  }
};

// Safe delete: disables account and cancels active membership
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isAdmin: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.isActive = false;
    await user.save();

    await Subscription.updateMany(
      { user: user._id, status: "active" },
      { status: "cancelled" },
    );

    res.status(200).json({
      success: true,
      message: "User account disabled and membership cancelled.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete user.",
    });
  }
};

module.exports={
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
}