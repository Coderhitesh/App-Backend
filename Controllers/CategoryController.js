const Category = require('../Models/Category');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please enter category name"
            });
        }
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: newCategory
        });
    } catch (error) {
        console.log("Internal server error in creating category");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all categories
exports.getAllCategory = async (req, res) => {
    try {
        const category = await Category.find();
        if (!category || category.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No category found"
            });
        }
        res.status(200).json({
            success: true,
            message: "All categories fetched successfully",
            data: category
        });
    } catch (error) {
        console.log("Internal server error in fetching categories");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get a single category by ID
exports.getSingleCategory = async (req, res) => {
    try {
        const id = req.params._id;
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: category
        });
    } catch (error) {
        console.log("Internal server error in fetching category");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
    try {
        const id = req.params._id;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please enter category name"
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        console.log("Internal server error in updating category");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params._id;

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.log("Internal server error in deleting category");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
