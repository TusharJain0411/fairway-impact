const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Score = require("../models/Score");
const Subscription = require("../models/Subscription");
const Draw = require("../models/Draw");
const DrawEntry = require("../models/DrawEntry");
const Winner = require("../models/Winner");
const Payment = require("../models/Payment");
const Charity = require("../models/Charity");

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  selectedCharity: user.selectedCharity,
  charityContributionPercent: user.charityContributionPercent,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      selectedCharity,
      charityContributionPercent,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account already exists with this email.",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      selectedCharity: selectedCharity || null,
      charityContributionPercent: charityContributionPercent || 10,
    });

    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
};

// POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated.",
      });
    }

    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
};

// GET /api/users/profile
const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: userResponse(req.user),
  });
};



const getUserDashboard = async (req, res) => {
  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const currentDraw = await Draw.findOne({
      status: { $in: ["open", "published"] },
    }).sort({ month: 1 });

    const [
      recentScores,
      subscription,
      winnings,
      yearlyContribution,
      currentDrawEntry,
    ] = await Promise.all([
      Score.find({ user: req.user._id }).sort({ playedOn: -1 }).limit(5),

      Subscription.findOne({
        user: req.user._id,
        status: "active",
      }).populate("charity", "name category description"),

      Winner.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: null,
            totalWinnings: { $sum: "$prizeAmount" },
            totalWon: { $sum: 1 },
          },
        },
      ]),

      Payment.aggregate([
        {
          $match: {
            user: req.user._id,
            status: "success",
            createdAt: { $gte: startOfYear },
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

      currentDraw
      ? DrawEntry.findOne({
        draw: currentDraw._id,
        user: req.user._id,
      })
        : null,
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        recentScores,

        latestScore: recentScores[0]?.score || null,

        subscription: subscription
        ? {
              plan: subscription.plan,
              charity: subscription.charity,
              contributionPercent: subscription.charityContributionPercent,
              status: subscription.status,
              renewalDate: subscription.renewalDate,
            }
          : null,

        charityContributionThisYear: yearlyContribution[0]?.total || 0,

        totalWinnings: winnings[0]?.totalWinnings || 0,

        totalWins: winnings[0]?.totalWon || 0,

        currentDraw: currentDraw
          ? {
              id: currentDraw._id,
              month: currentDraw.month,
              status: currentDraw.status,
              isEntered: Boolean(currentDrawEntry),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("User dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard data.",
    });
  }
};


const updateCharitySettings = async (req, res) => {
  try {
    const { charityId, contributionPercent } = req.body;

    if (
      contributionPercent !== undefined &&
      (contributionPercent < 10 || contributionPercent > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Charity contribution must be between 10% and 100%.",
      });
    }

    let charity = null;

    if (charityId) {
      charity = await Charity.findOne({
        _id: charityId,
        isActive: true,
      });

      if (!charity) {
        return res.status(404).json({
          success: false,
          message: "Active charity not found.",
        });
      }

      req.user.selectedCharity = charity._id;
    }

    if (contributionPercent !== undefined) {
      req.user.charityContributionPercent = contributionPercent;
    }

    await req.user.save();

    const activeSubscription = await Subscription.findOne({
      user: req.user._id,
      status: "active",
    });

    if (activeSubscription) {
      if (charityId) {
        activeSubscription.charity = charity._id;
      }

      if (contributionPercent !== undefined) {
        activeSubscription.charityContributionPercent = contributionPercent;
      }

      await activeSubscription.save();
    }

    const updatedUser = await User.findById(req.user._id).populate(
      "selectedCharity",
      "name category description",
    );

    res.status(200).json({
      success: true,
      message: "Charity settings updated.",
      user: {
        id: updatedUser._id,
        selectedCharity: updatedUser.selectedCharity,
        charityContributionPercent: updatedUser.charityContributionPercent,
      },
    });
  } catch (error) {
    console.error("Update charity settings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update charity settings.",
    });
  }
};

module.exports = {
registerUser,
loginUser,
getProfile,
getUserDashboard,
updateCharitySettings
};