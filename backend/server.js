const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy (Required for Vercel/Heroku/Cloud platforms)
app.set('trust proxy', 1);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: function (origin, callback) {
        console.log('Request Origin:', origin); // Debug log
        return callback(null, true); // Allow all for debugging
    },
    credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Mount routers
app.use('/api/auth', require('./routes/auth'));
try {
    console.log('Mounting review routes...'); // Debug log
    app.use('/api/reviews', require('./routes/reviews'));
    console.log('Review routes mounted.'); // Debug log
} catch (error) {
    console.error('FAILED TO MOUNT REVIEW ROUTES:', error);
}

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Ceylon Sang API is running',
        version: '1.0.0'
    });
});

// Error handler
app.use(errorHandler);

// Export app for Vercel
module.exports = app;

// Only listen if run directly (development / standard node server)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.log(`Error: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
}
