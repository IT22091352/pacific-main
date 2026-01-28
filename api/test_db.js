const mongoose = require('mongoose');

module.exports = async (req, res) => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        return res.status(500).json({ error: "MONGODB_URI is undefined" });
    }

    // Debug: Extract Username to verify what Vercel is seeing
    let debug_user = "Unknown";
    try {
        // uri format: mongodb+srv://USER:PASS@...
        const parts = uri.split('//');
        if (parts.length > 1) {
            const credentials = parts[1].split('@')[0];
            debug_user = credentials.split(':')[0]; // Get the username part
        }
    } catch (e) {
        debug_user = "Parse Error";
    }

    try {
        if (mongoose.connection.readyState === 1) {
            return res.status(200).json({ status: "Success", message: "Already Connected" });
        }
        await mongoose.connect(uri);
        res.status(200).json({
            status: "Success",
            message: "Connected Successfully!",
            connected_as: debug_user
        });
    } catch (error) {
        res.status(500).json({
            status: "Error",
            message: "Connection Failed",
            error_code: error.code,
            error_name: error.name,
            // This tells us EXACLTY who Vercel is trying to login as
            VERCEL_IS_USING_USERNAME: debug_user,
            suggestion: "If the username above is wrong, redeploy. If right, check password."
        });
    }
};
