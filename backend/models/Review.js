const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Changed from true to false to support guests
    },
    // Guest details for non-active users
    feedbackToken: {
        type: String,
        select: false // Don't return this in normal queries for security
    },
    guestName: {
        type: String,
        trim: true
    },
    guestEmail: {
        type: String,
        trim: true
    },
    // Adding fields to match the frontend form
    country: {
        type: String,
        trim: true
    },
    tourPackage: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved' // Auto-approve for now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent user from submitting more than one review per tour package (optional but good)
// reviewSchema.index({ user: 1, tourPackage: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
