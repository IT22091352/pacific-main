const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    try {
        if (cached.conn) {
            console.log('Using cached MongoDB connection');
            return cached.conn;
        }

        if (!cached.promise) {
            const opts = {
                bufferCommands: false, // Disable buffering to fail fast if no connection
            };

            console.log('Creating new MongoDB connection...');
            cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
                console.log(`MongoDB Connected: ${mongoose.connection.host}`);
                return mongoose;
            });
        }

        cached.conn = await cached.promise;
        return cached.conn;

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Reset promise so valid next attempts can try again
        cached.promise = null;
        throw error;
    }
};

module.exports = connectDB;
