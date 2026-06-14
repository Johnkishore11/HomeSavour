const express = require('express');
const router = express.Router();
const {
    getDishesByChef,
    getNearbyChefs,
    getMyDishes,
    createDish,
    updateDish,
    deleteDish
} = require('../controllers/dishController');
const { protect, chefOnly } = require('../middleware/authMiddleware');

router.get('/chefs/nearby', protect, getNearbyChefs);
router.get('/chef/mine', protect, chefOnly, getMyDishes);
router.get('/chef/:chefId', getDishesByChef);

router.post('/', protect, chefOnly, createDish);
router.put('/:id', protect, chefOnly, updateDish);
router.delete('/:id', protect, chefOnly, deleteDish);

module.exports = router;
