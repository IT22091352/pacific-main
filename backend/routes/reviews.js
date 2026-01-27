const express = require('express');
const {
    getReviews,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

console.log('Loading review routes...'); // Debug log

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getReviews)
    .post(protect, addReview);

router.route('/:id')
    .put(protect, updateReview)
    .delete(protect, deleteReview);

module.exports = router;
