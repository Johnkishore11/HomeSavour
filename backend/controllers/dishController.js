const Dish = require('../models/Dish');
const User = require('../models/User');

// @desc    Get all dishes for a specific chef (by MongoDB ID) - public, available only
// @route   GET /api/dishes/chef/:chefId
// @access  Public
const getDishesByChef = async (req, res) => {
    try {
        const dishes = await Dish.find({ chefId: req.params.chefId, isAvailable: true });
        res.json(dishes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all dishes for the currently logged-in chef (incl. unavailable)
// @route   GET /api/dishes/chef/mine
// @access  Private/Chef
const getMyDishes = async (req, res) => {
    try {
        const dishes = await Dish.find({ chefId: req.user._id }).sort({ createdAt: -1 });
        res.json(dishes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all nearby chefs (and perhaps their top dishes)
// @route   GET /api/dishes/chefs/nearby?lat=x&lng=y
// @access  Public
const getNearbyChefs = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        const maxDistance = 10000; // 10 kilometers

        // Find chefs nearby
        const chefs = await User.find({
            role: 'chef',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: maxDistance
                }
            }
        });

        // Optional: you could populate dishes here or let the client fetch dishes per chef when clicked
        res.json(chefs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new dish
// @route   POST /api/dishes
// @access  Private/Chef
const createDish = async (req, res) => {
    const { name, description, price, imageUrl, category, tags } = req.body;

    try {
        const dish = new Dish({
            chefId: req.user._id,
            name,
            description,
            price,
            imageUrl,
            category,
            tags
        });

        const createdDish = await dish.save();
        res.status(201).json(createdDish);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a dish
// @route   PUT /api/dishes/:id
// @access  Private/Chef
const updateDish = async (req, res) => {
    const { name, description, price, imageUrl, category, tags, isAvailable } = req.body;

    try {
        const dish = await Dish.findById(req.params.id);

        if (!dish) {
            return res.status(404).json({ message: 'Dish not found' });
        }

        if (dish.chefId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit this dish' });
        }

        dish.name = name !== undefined ? name : dish.name;
        dish.description = description !== undefined ? description : dish.description;
        dish.price = price !== undefined ? price : dish.price;
        dish.imageUrl = imageUrl !== undefined ? imageUrl : dish.imageUrl;
        dish.category = category !== undefined ? category : dish.category;
        dish.tags = tags !== undefined ? tags : dish.tags;
        dish.isAvailable = isAvailable !== undefined ? isAvailable : dish.isAvailable;

        const updatedDish = await dish.save();
        res.json(updatedDish);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a dish
// @route   DELETE /api/dishes/:id
// @access  Private/Chef
const deleteDish = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id);

        if (!dish) {
            return res.status(404).json({ message: 'Dish not found' });
        }

        if (dish.chefId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this dish' });
        }

        await dish.deleteOne();
        res.json({ message: 'Dish removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getDishesByChef,
    getMyDishes,
    getNearbyChefs,
    createDish,
    updateDish,
    deleteDish
};
