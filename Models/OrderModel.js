const mongoose = require('mongoose')

const item = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
})
const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    City: {
        type: String,
    },
    PinCode: {
        type: String,
    },
    HouseNo: {
        type: String,
    },
    Street: {
        type: String,
    },
    NearByLandMark: {
        type: String,
    },
    OrderStatus: {
        type: String,
        enum: ['pending', 'shipped', 'delivered'],
        default: 'pending'
    },

    items: [item],
    finalMainPrice: {
        type: Number
    }
})

const Order = mongoose.model('Order', OrderSchema)
module.exports = Order