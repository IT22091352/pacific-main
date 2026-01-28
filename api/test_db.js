const mongoose = require('mongoose');

module.exports = async (req, res) => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        return res.status(500).json({ error: "MONGODB_URI is undefined in Vercel Environment Variables" });
    }

    try {
        // If already connected
        if (mongoose.connection.readyState === 1) {
            return res.status(200).json({
                status: "Success",
                message: "Already Connected to MongoDB",
                host: mongoose.connection.host
            });
        }

        // Attempt connection
        await mongoose.connect(uri);

        res.status(200).json({
            status: "Success",
            message: "New Connection Established",
            host: mongoose.connection.host
        });

    } catch (error) {
        console.error("DB Connection Error:", error);
        res.status(500).json({
            status: "Error",
            message: "Failed to connect to MongoDB",
            error_name: error.name,
            error_details: error.message,
            // Common codes: 8000 (Auth), MongooseServerSelectionError (Network/IP)
            suggestion: error.name === 'MongooseServerSelectionError' ? 'Check IP Whitelist (0.0.0.0/0)' : 'Check Password/URI'
        });
    }
};
