const User = require('../models/User');

// @desc    Register a new user after firebase auth
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { firebaseUid, role, name, email, phone, location, pickupAddress } = req.body;

    try {
        const userExists = await User.findOne({ firebaseUid });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            firebaseUid,
            role,
            name,
            email,
            phone,
            location, // GeoJSON { type: 'Point', coordinates: [long, lat] }
            pickupAddress
        });

        if (user) {
            res.status(201).json(user);
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.pickupAddress = req.body.pickupAddress || user.pickupAddress;

        if (req.body.location) {
            user.location = req.body.location;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    getUserProfile,
    updateUserProfile
};
