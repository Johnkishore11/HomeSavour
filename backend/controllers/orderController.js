const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
const addOrderItems = async (req, res) => {
    const { chefId, items, totalAmount, pickupTime } = req.body;

    if (items && items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    } else {
        const order = new Order({
            customerId: req.user._id,
            chefId,
            items,
            totalAmount,
            pickupTime
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('customerId', 'name email phone')
        .populate('chefId', 'name pickupAddress phone');

    if (order) {
        // Only allow if user is the customer or the chef
        if (order.customerId._id.toString() === req.user._id.toString() || 
            order.chefId._id.toString() === req.user._id.toString()) {
            res.json(order);
        } else {
            res.status(401).json({ message: 'Not authorized to view this order' });
        }
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Chef
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.chefId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        order.status = status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    let orders;
    if (req.user.role === 'customer') {
        orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    } else {
        orders = await Order.find({ chefId: req.user._id }).sort({ createdAt: -1 });
    }
    res.json(orders);
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders
};
