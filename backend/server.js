const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Load env vars
dotenv.config();

const app = express();

// Trust proxy (Required for Vercel/Heroku/Cloud platforms)
app.set('trust proxy', 1);

// Middleware to ensure DB is connected on every request (Vercel/Serverless resilience)
app.use(async (req, res, next) => {
    if (require('mongoose').connection.readyState !== 1) { // 1 = Connected
        try {
            console.log('Re-establishing MongoDB connection in middleware...');
            await connectDB();
        } catch (error) {
            console.error('Middleware DB Connection Error:', error.message);
            // We don't block here, we let the route fail if it needs DB, 
            // or the errorHandler catch it.
        }
    }
    next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Performance: Compression
app.use(compression());

// Serve static files from the root directory with Caching (1 day)
app.use(express.static(path.join(__dirname, '../'), {
    maxAge: '0', // Disable cache for development
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}));

// Security: Helmet
app.use(helmet({
    contentSecurityPolicy: false, // Disabling CSP for simplicity in this setup, can be enabled later
}));

// Security: NoSQL Injection
app.use(mongoSanitize());

// Security: XSS Protection
app.use(xss());

// Security: Prevent HTTP Parameter Pollution
app.use(hpp());

// Enable CORS
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests, or local file://)
        if (!origin || origin === 'null') return callback(null, true);
        return callback(null, true);
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
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
app.use('/api', require('./routes/health')); // Exposes /api/health
app.use('/', require('./routes/seo')); // Handle sitemap.xml and robots.txt at root
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
