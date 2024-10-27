const Product = require('../Models/ProductModel');
const { uploadImage, deleteImageFromCloudinary } = require('../Utils/Cloudnary');
const fs = require('fs').promises;

// Create a new product
exports.createProduct = async (req, res) => {
    const uploadedImages = [];
    try {
        const { name,priceChange, mainPrice,catchLine,doge,numberOfCapsule, discountPercent, afterDiscountPrice, description, categoryId, howToUse, quantity } = req.body;
        const emptyField = [];
        if (!name) emptyField.push('name');
        if (!mainPrice) emptyField.push('mainPrice');
        if (!discountPercent) emptyField.push('discountPercent');
        if (!afterDiscountPrice) emptyField.push('afterDiscountPrice');
        if (!description) emptyField.push('description');
        if (!howToUse) emptyField.push('howToUse');
        if (!quantity) emptyField.push('quantity');
        if (emptyField.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please fill in the following fields: ${emptyField.join(', ')}`
            });
        }

        const product = new Product({
            name,
            mainPrice,
            discountPercent,
            afterDiscountPrice,
            description,
            priceChange,
            catchLine,doge,
            numberOfCapsule,
            categoryId,
            howToUse,
            quantity
        });

        if (req.file) {
            const imgUrl = await uploadImage(req.file.path);
            const { image, public_id } = imgUrl;
            product.images.url = image;
            product.images.public_id = public_id;
            uploadedImages.push(product.images.public_id);
            try {
                fs.unlink(req.file.path);
            } catch (error) {
                console.log('Error in deleting file from local storage');
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image',
            });
        }

        const productSave = await product.save();
        if (!productSave) {
            if (product.images.public_id) {
                await deleteImageFromCloudinary(product.images.public_id);
            }
            return res.status(400).json({
                success: false,
                message: 'Failed to save product',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product saved successfully',
            product: productSave
        });

    } catch (error) {
        console.log("Internal server error in creating product");
        if (uploadedImages.length > 0) {
            await deleteImageFromCloudinary(uploadedImages);
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('categoryId').sort({ createdAt: -1 });
        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single product by ID
exports.getSingleProduct = async (req, res) => {
    try {
        const id = req.params._id;
        const product = await Product.findById(id).populate('categoryId');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product fetched successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
    try {
        const id = req.params._id;
        const { name, mainPrice, discountPercent, afterDiscountPrice, description, categoryId, howToUse, quantity } = req.body;
        let product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Update fields
        product.name = name || product.name;
        product.mainPrice = mainPrice || product.mainPrice;
        product.discountPercent = discountPercent || product.discountPercent;
        product.afterDiscountPrice = afterDiscountPrice || product.afterDiscountPrice;
        product.description = description || product.description;
        product.categoryId = categoryId || product.categoryId;
        product.howToUse = howToUse || product.howToUse;
        product.quantity = quantity || product.quantity;

        // If a new image is uploaded, update it
        if (req.file) {
            if (product.images.public_id) {
                await deleteImageFromCloudinary(product.images.public_id);
            }
            const imgUrl = await uploadImage(req.file.path);
            const { image, public_id } = imgUrl;
            product.images.url = image;
            product.images.public_id = public_id;
            try {
                fs.unlink(req.file.path);
            } catch (error) {
                console.log('Error in deleting file from local storage');
            }
        }

        const updatedProduct = await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params._id;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Delete image from Cloudinary
        if (product.images.public_id) {
            await deleteImageFromCloudinary(product.images.public_id);
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
