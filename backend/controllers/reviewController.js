const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all approved reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ status: 'approved' })
            .populate({
                path: 'user',
                select: 'name'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Public (User or Guest)
exports.addReview = async (req, res, next) => {
    try {
        // Authenticated User
        if (req.user) {
            req.body.user = req.user.id;
        }
        // Guest User
        else {
            if (!req.body.feedbackToken) {
                return res.status(400).json({ success: false, message: 'Guest review requires a feedback token' });
            }
            if (!req.body.guestName) {
                return res.status(400).json({ success: false, message: 'Please provide your name' });
            }
        }

        const review = await Review.create(req.body);

        // Populate user details if it exists
        if (review.user) {
            await review.populate({
                path: 'user',
                select: 'name'
            });
        }

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Public (Owner only)
exports.updateReview = async (req, res, next) => {
    try {
        // Need to include feedbackToken in selection to verify ownership for guests
        let review = await Review.findById(req.params.id).select('+feedbackToken');

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Verify Ownership
        let isOwner = false;

        // 1. Check User Ownership
        if (req.user && review.user && review.user.toString() === req.user.id) {
            isOwner = true;
        }
        // 2. Check Admin
        else if (req.user && req.user.role === 'admin') {
            isOwner = true;
        }
        // 3. Check Guest Ownership (via Token)
        else if (!review.user && req.body.feedbackToken && review.feedbackToken === req.body.feedbackToken) {
            isOwner = true;
        }

        if (!isOwner) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this review' });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Public (Owner only)
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id).select('+feedbackToken');

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Verify Ownership
        let isOwner = false;

        // 1. Check User Ownership
        if (req.user && review.user && review.user.toString() === req.user.id) {
            isOwner = true;
        }
        // 2. Check Admin
        else if (req.user && req.user.role === 'admin') {
            isOwner = true;
        }
        // 3. Check Guest Ownership (via Token)
        // For delete, we might receive token in body or query, let's allow body for now as standard
        else if (!review.user && req.body.feedbackToken && review.feedbackToken === req.body.feedbackToken) {
            isOwner = true;
        }

        if (!isOwner) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
        }

        await review.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
