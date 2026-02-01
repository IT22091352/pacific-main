const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Identify User or Guest (don't block if no token, just set req.user to null)
exports.identifyUserOrGuest = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Default to null
    req.user = null;

    if (!token) {
        return next();
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        // If token is invalid, we treat them as a guest (req.user is null)
        // Check if we strictly require auth (this middleware is permissive)
        next();
    }
};
