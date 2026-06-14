const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chefId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            dishId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Dish',
                required: true
            },
            name: String,
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Ready', 'Completed', 'Rejected'],
        default: 'Pending'
    },
    pickupTime: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
