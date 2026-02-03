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
const { identifyUserOrGuest } = require('../middleware/userOrGuest');
const { reviewValidation } = require('../middleware/validators');

router.route('/')
    .get(getReviews)
    .post(identifyUserOrGuest, reviewValidation, addReview);

router.route('/:id')
    .put(identifyUserOrGuest, reviewValidation, updateReview)
    .delete(identifyUserOrGuest, deleteReview);

module.exports = router;
