const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error(`Error: ${error.message} (Continuing despite DB error)`);
        // process.exit(1); // Don't kill serverless function
    }
};

module.exports = connectDB;
