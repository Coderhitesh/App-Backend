const Order = require('../Models/OrderModel');
const User = require('../Models/UserModel');
const Product = require('../Models/ProductModel');

exports.createOrder = async (req, res) => {
    try {
        // console.log(req.user)
        const userId = req.user.id._id
        const { City, PinCode, HouseNo, finalMainPrice, Street, NearByLandMark, items } = req.body;
        console.log(req.body)
        // Validate required fields
        const emptyFields = [];
        if (!City) emptyFields.push('City');
        if (!PinCode) emptyFields.push('PinCode');
        if (!HouseNo) emptyFields.push('HouseNo');
        if (!Street) emptyFields.push('Street');
        if (!NearByLandMark) emptyFields.push('NearByLandMark');

        if (emptyFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please fill in the following fields: ${emptyFields.join(', ')}`
            });
        }


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }



        // Create new order
        const newOrder = new Order({
            userId,
            City,
            PinCode,
            HouseNo,
            Street,
            NearByLandMark,
            OrderStatus: 'pending',
            items,
            finalMainPrice: finalMainPrice
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: newOrder
        });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.checkReferralCode = async (req, res) => {
    try {
        const { code } = req.body;
        console.log(req.body)
        // Check if referral code is provided
        if (!code) {
            return res.status(400).json({ success: false, message: "Referral code is required." });
        }

        // Find user by referral code
        const userWithCode = await User.findOne({ referralCode: code });

        // Check if referral code exists
        if (userWithCode) {
            return res.status(200).json({ success: true, message: "Referral code is valid." });
        } else {
            return res.status(404).json({ success: false, message: "Referral code not found." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};


exports.getAllOrder = async (req, res) => {
    try {
        const allOrder = await Order.find().populate('userId').populate('productId')
        if (!allOrder) {
            return res.status(404).json({
                success: false,
                message: "No order found",
            });
        }
        res.status(200).json({
            success: true,
            message: "All orders retrieved successfully",
        })
    } catch (error) {
        console.error("Error getting order:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // Get the order ID from request parameters
        const { OrderStatus } = req.body; // Get the new order status from the request body

        // Check if a valid status is provided
        const validStatuses = ['pending', 'shipped', 'delivered'];
        if (!OrderStatus || !validStatuses.includes(OrderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status. Valid statuses are: pending, shipped, delivered."
            });
        }

        // Find the order by its ID and update the status
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        order.OrderStatus = OrderStatus; // Update the order status
        await order.save(); // Save the updated order

        res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            data: order
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const mongoose = require('mongoose');
exports.getMyOrderOnly = async (req, res) => {
    try {
        const { id } = req.query;
        
       // console.log(req.query);
        
        // Use findOne to search by userId instead of findById
        const findOrder = await Order.find({ userId: id });
        // console.log(findOrder);

        if (!findOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found for the given user ID.'
            });
        }

        res.status(200).json({
            success: true,
            orders: findOrder
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching orders.',
            error: error.message
        });
    }
};
