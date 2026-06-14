const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders
} = require('../controllers/orderController');
const { protect, chefOnly } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems);

router.route('/myorders')
    .get(protect, getMyOrders);

router.route('/:id')
    .get(protect, getOrderById);

router.route('/:id/status')
    .put(protect, chefOnly, updateOrderStatus);

module.exports = router;
