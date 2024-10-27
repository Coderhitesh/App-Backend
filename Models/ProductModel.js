const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mainPrice: {
        type: Number,
        required: true
    },
    catchLine: {
        type: String,
    }, doge: {
        type: String,
    }, numberOfCapsule: {
        type: Number,
    },
    priceChange:{
        type: Number,
    },
    discountPercent: {
        type: Number,
        required: true
    },
    afterDiscountPrice: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        // required: true
    },
    images: {
        url: {
            type: String,
            // required: true
        },
        public_id: {
            type: String,
            // required: true
        }
    },
    howToUse: {
        type: String,
        // required: true
    },
    quantity: {
        type: Number,
        // required: true
    }
}, { timestamps: true })

const Product = mongoose.model('Product', ProductSchema)
module.exports = Product