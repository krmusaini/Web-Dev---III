const validateProduct = (req, res, next) => {
    const { name, sku, category, price, quantity, reorderLevel, supplier } = req.body;

    const allowedFields = [
        'name',
        'sku',
        'category',
        'price',
        'quantity',
        'reorderLevel',
        'supplier'
    ];

    const invalidFields = Object.keys(req.body).filter(
        field => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: 'Invalid fields',
            fields: invalidFields
        });
    }
    if (req.method === 'POST') {
        const requiredFields = [
            'name',
            'sku',
            'category',
            'price',
            'quantity',
            'reorderLevel',
            'supplier'
        ];
        const missingFields = requiredFields.filter(
            field => req.body[field] === undefined ||
                req.body[field] === null ||
                req.body[field] === ''
        );
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Required fields are missing',
                fields: missingFields
            });
        }
    }

    if (price !== undefined && (!Number.isFinite(price) || price < 0)) {
        return res.status(400).json({
            message: 'Price must be a non-negative number'
        });
    }

    if (quantity !== undefined &&
        (!Number.isInteger(quantity) || quantity < 0)) {
        return res.status(400).json({
            message: 'Quantity must be a non-negative integer'
        });
    }

    if (reorderLevel !== undefined &&
        (!Number.isInteger(reorderLevel) || reorderLevel < 0)) {
        return res.status(400).json({
            message: 'Reorder level must be a non-negative integer'
        });
    }
    next();
};

module.exports = validateProduct;
