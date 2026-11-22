require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const { notFound, errorHandler } =
    require('./middleware/errorMiddleware');
const productRoutes = require('./routes/productRoutes');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Inventory Management API is Running!');
});

app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
