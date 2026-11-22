const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const validateProduct = require('../middleware/validateProduct');

// 1. CREATE PRODUCT
router.post('/', validateProduct, async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

// 2. GET ALL PRODUCTS - FILTERING, SORTING AND PAGINATION
router.get('/', async (req, res, next) => {
    try {
        const filter = {};
        // Category filter
        if (req.query.category) {
            filter.category = req.query.category;
        }
        // Product name search
        if (req.query.search) {
            filter.name = {
                $regex: req.query.search,
                $options: 'i'
            };
        }
        // Sorting
        let sort = { createdAt: -1 };

        if (req.query.sort) {
            const field = req.query.sort.replace('-', '');
            const order = req.query.sort.startsWith('-') ? -1 : 1;
            const allowedFields = [
                'name',
                'price',
                'quantity',
                'createdAt'
            ];
            if (!allowedFields.includes(field)) {
                return res.status(400).json({
                    message: 'Invalid sorting field'
                });
            }
            sort = { [field]: order };
        }
        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (!Number.isInteger(page) || page < 1 ||
            !Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                message: 'Invalid page or limit'
            });
        }

        const skip = (page - 1) * limit;
        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
});

// 3. LOW-STOCK ALERT REPORT
router.get('/low-stock', async (req, res, next) => {
    try {
        const products = await Product.aggregate([
            {
                $match: {
                    $expr: {
                        $lte: ['$quantity', '$reorderLevel']
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    sku: 1,
                    category: 1,
                    price: 1,
                    quantity: 1,
                    reorderLevel: 1,
                    supplier: 1,
                    stockValue: {
                        $multiply: ['$price', '$quantity']
                    }
                }
            }
        ]);
        res.status(200).json({
            count: products.length,
            lowStockItems: products
        });

    } catch (error) {
        next(error);
    }
});

// 4. CATEGORY-WISE INVENTORY SUMMARY
router.get('/summary', async (req, res, next) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalItems: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalStockValue: {
                        $sum: {
                            $multiply: ['$price', '$quantity']
                        }
                    },
                    avgPrice: { $avg: '$price' }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 1,
                    totalItems: 1,
                    totalQuantity: 1,
                    totalStockValue: {
                        $round: ['$totalStockValue', 2]
                    },
                    avgPrice: {
                        $round: ['$avgPrice', 2]
                    }
                }
            }
        ]);
        res.status(200).json({
            categories: summary.length,
            summary
        });
    } catch (error) {
        next(error);
    }
});

// 5. STOCK ADJUSTMENT (RESTOCK / SALE)
router.patch('/:id/stock', async (req, res, next) => {
    try {
        const { change } = req.body;

        if (!Number.isInteger(change) || change === 0) {
            return res.status(400).json({
                message: 'Change must be a non-zero integer'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid product ID'
            });
        }
        const filter = { _id: req.params.id };
        // Prevent stock from becoming negative
        if (change < 0) {
            filter.quantity = { $gte: Math.abs(change) };
        }
        const product = await Product.findOneAndUpdate(
            filter,
            { $inc: { quantity: change } },
            {
                new: true,
                runValidators: true
            }
        );
        if (!product) {
            const existing = await Product.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }
            return res.status(400).json({
                message: 'Insufficient stock for this operation'
            });
        }
        res.status(200).json({
            message: 'Stock updated',
            product
        });
    } catch (error) {
        next(error);
    }
});

// 6. GET SINGLE PRODUCT BY ID
router.get('/:id', async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        res.status(200).json(product);

    } catch (error) {
        next(error);
    }
});

// 7. UPDATE PRODUCT DETAILS
router.put('/:id', validateProduct, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid product ID'
            });
        }
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
});

// 8. DELETE PRODUCT
router.delete('/:id', async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        res.status(200).json({
            message: 'Product deleted',
            id: product._id
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
