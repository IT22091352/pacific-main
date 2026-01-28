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

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or file://)
        if (!origin) return callback(null, true);

        // Allow localhost and 127.0.0.1 with any port
        if (origin.match(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
            return callback(null, true);
        }

        // Allow the configured frontend URL
        if (origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
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
