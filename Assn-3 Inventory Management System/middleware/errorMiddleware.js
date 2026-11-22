const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        message = 'SKU already exists. Please use a unique SKU.';
    }
    // Invalid MongoDB ID
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid product ID';
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(error => error.message)
            .join(', ');
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = { notFound, errorHandler };
