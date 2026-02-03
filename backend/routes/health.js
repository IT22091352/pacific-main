const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };

    const health = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        dbStatus: statusMap[dbStatus] || 'unknown',
        dbHost: mongoose.connection.host || 'none',
        env: process.env.NODE_ENV
    };

    if (dbStatus === 1) {
        res.status(200).json({ success: true, ...health });
    } else {
        res.status(503).json({ success: false, ...health, message: 'Database Not Connected' });
    }
});

module.exports = router;
