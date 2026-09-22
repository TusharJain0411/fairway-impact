const Charity = require("../models/Charity");
const User = require("../models/User");
// GET /api/charities
const getCharities = async (req, res) => {
  try {
    const charities = await Charity.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: charities.length,
      charities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch charities.",
    });
  }
};

// GET /api/charities/admin/all
const getAllCharities = async (req, res) => {
  try {
    const [charities, supportCounts] = await Promise.all([
      Charity.find().sort({ createdAt: -1 }),

      User.aggregate([
        {
          $match: {
            selectedCharity: { $ne: null },
            isActive: true,
          },
        },
        {
          $group: {
            _id: "$selectedCharity",
            members: { $sum: 1 },
          },
        },
      ]),
    ]);

    const memberCountMap = new Map(
      supportCounts.map((item) => [item._id.toString(), item.members]),
    );

    const charitiesWithMemberCount = charities.map((charity) => ({
      ...charity.toObject(),
      members: memberCountMap.get(charity._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      charities: charitiesWithMemberCount,
    });
  } catch (error) {
    console.error("Get admin charities error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch charities.",
    });
  }
};

// POST /api/charities
const createCharity = async (req, res) => {
  try {
    const { name, category, description, image, website } = req.body;

    if (!name || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and description are required.",
      });
    }

    const exists = await Charity.findOne({
      name: name.trim(),
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "A charity with this name already exists.",
      });
    }

    const charity = await Charity.create({
      name,
      category,
      description,
      image,
      website,
    });

    res.status(201).json({
      success: true,
      message: "Charity added successfully.",
      charity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add charity.",
    });
  }
};

// PUT /api/charities/:id
const updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Charity updated successfully.",
      charity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update charity.",
    });
  }
};

// DELETE /api/charities/:id
const deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndDelete(req.params.id);

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Charity deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete charity.",
    });
  }
};

module.exports = {
  getCharities,
  getAllCharities,
  createCharity,
  updateCharity,
  deleteCharity,
};
