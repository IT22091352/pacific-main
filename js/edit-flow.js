// ========================================
// SINGLE-FORM EDIT FLOW FOR TESTIMONIALS
// ========================================

/**
 * Edit Review - Navigate to form and enter edit mode
 * @param {string} id - Review ID to edit
 */
function editReview(id) {
    // Fetch review details
    fetch(`${REVIEW_API_URL}/reviews`)
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                const review = res.data.find(r => r._id === id);
                if (review) {
                    // Store review data in localStorage
                    const editData = {
                        id: review._id,
                        rating: review.rating,
                        comment: review.comment,
                        tourPackage: review.tourPackage || '',
                        country: review.country || ''
                    };

                    localStorage.setItem('editingReview', JSON.stringify(editData));

                    // Navigate to contact page
                    window.location.href = 'contact.html#review-form';
                }
            }
        })
        .catch(error => {
            console.error('Error loading review for edit:', error);
            alert('Failed to load review. Please try again.');
        });
}

/**
 * Enter Edit Mode - Pre-populate form with existing review data
 * @param {object} reviewData - Review data to populate
 */
function enterEditMode(reviewData) {
    // Store review ID in hidden field
    const editIdField = document.getElementById('edit-review-id');
    if (editIdField) {
        editIdField.value = reviewData.id;
    }

    // Pre-populate form fields
    const countryInput = document.getElementById('review-country');
    const tourSelect = document.getElementById('review-tour');
    const commentTextarea = document.getElementById('review-text');

    if (countryInput && reviewData.country) {
        countryInput.value = reviewData.country;
    }

    if (tourSelect && reviewData.tourPackage) {
        tourSelect.value = reviewData.tourPackage;
    }

    if (commentTextarea && reviewData.comment) {
        commentTextarea.value = reviewData.comment;
    }

    // Set rating (radio buttons)
    if (reviewData.rating) {
        const ratingRadio = document.getElementById(`star${reviewData.rating}`);
        if (ratingRadio) {
            ratingRadio.checked = true;
        }
    }

    // Update form UI for edit mode
    updateFormUIForEditMode(true);

    // Scroll to form with highlight effect
    scrollToFormWithHighlight();

    // Show edit mode message
    showEditModeMessage();
}

/**
 * Update Form UI for Edit/Create Mode
 * @param {boolean} isEditMode - True for edit mode, false for create mode
 */
function updateFormUIForEditMode(isEditMode) {
    const formTitle = document.getElementById('review-form-title');
    const formSubtitle = document.getElementById('review-form-subtitle');
    const formDescription = document.getElementById('review-form-description');
    const submitBtn = document.getElementById('reviewSubmitBtn');
    const editIndicator = document.getElementById('edit-mode-indicator');

    if (isEditMode) {
        // Edit Mode
        if (formTitle) formTitle.textContent = 'Edit Your Review';
        if (formSubtitle) formSubtitle.textContent = 'Update Your Experience';
        if (formDescription) formDescription.textContent = 'Make changes to your review below';
        if (submitBtn) {
            submitBtn.value = 'Update Review';
            submitBtn.style.background = 'var(--sunset-orange)';
            submitBtn.style.borderColor = 'var(--sunset-orange)';
        }
        if (editIndicator) editIndicator.style.display = 'block';
    } else {
        // Create Mode (Reset)
        if (formTitle) formTitle.textContent = 'Leave a Review';
        if (formSubtitle) formSubtitle.textContent = 'Share Your Experience';
        if (formDescription) formDescription.textContent = "Traveled with us? We'd love to hear about your experience!";
        if (submitBtn) {
            submitBtn.value = 'Submit Review';
            submitBtn.style.background = '';
            submitBtn.style.borderColor = '';
        }
        if (editIndicator) editIndicator.style.display = 'none';
    }
}

/**
 * Scroll to Form with Highlight Effect
 */
function scrollToFormWithHighlight() {
    setTimeout(() => {
        // Try to find the title element first, fallback to form
        const targetElement = document.getElementById('review-form-title') ||
            document.getElementById('reviewForm');

        const formSection = document.getElementById('reviewForm');

        if (targetElement) {
            // Scroll to title/form with start alignment (top of viewport)
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Apply highlight to the FORM specifically
            if (formSection) {
                formSection.style.transition = 'box-shadow 0.5s ease';
                formSection.style.boxShadow = '0 0 30px rgba(255, 107, 53, 0.6)';

                setTimeout(() => {
                    formSection.style.boxShadow = '';
                }, 2500);
            }
        }
    }, 500);
}

/**
 * Show Edit Mode Message
 */
function showEditModeMessage() {
    const messageDiv = document.getElementById('reviewMessage');
    if (messageDiv) {
        messageDiv.className = 'alert alert-info';
        messageDiv.innerHTML = '<i class="fa fa-edit"></i> Editing your review - make your changes and click "Update Review"';
        messageDiv.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

/**
 * Reset Form to Create Mode
 */
function resetFormToCreateMode() {
    // Clear hidden edit ID
    const editIdField = document.getElementById('edit-review-id');
    if (editIdField) {
        editIdField.value = '';
    }

    // Reset form fields
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.reset();
    }

    // Update UI back to create mode
    updateFormUIForEditMode(false);
}

/**
 * Handle Review Form Submission (Create or Update)
 * @param {Event} e - Form submit event
 */
async function handleReviewSubmit(e) {
    e.preventDefault();

    const editIdField = document.getElementById('edit-review-id');
    const isEditMode = editIdField && editIdField.value;

    // Get form data
    const formData = getReviewFormData();

    if (!formData) {
        return; // Validation failed
    }

    // Disable submit button
    const submitBtn = document.getElementById('reviewSubmitBtn');
    const originalValue = submitBtn.value;
    submitBtn.disabled = true;
    submitBtn.value = isEditMode ? 'Updating...' : 'Submitting...';

    try {
        let response;

        if (isEditMode) {
            // UPDATE existing review
            response = await updateReview(editIdField.value, formData);
        } else {
            // CREATE new review
            response = await createReview(formData);
        }

        if (response.success) {
            // Show success message
            showSuccessMessage(isEditMode ? 'Review updated successfully!' : 'Review submitted successfully!');

            // Reset form
            resetFormToCreateMode();

            // Reload reviews
            setTimeout(() => {
                loadReviews();

                // Scroll to testimonials section
                const testimonialsSection = document.querySelector('.testimony-section') ||
                    document.getElementById('reviews-track');
                if (testimonialsSection) {
                    testimonialsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 1000);
        } else {
            showErrorMessage(response.message || 'Failed to submit review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showErrorMessage('An error occurred. Please try again.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.value = originalValue;
    }
}

/**
 * Get Review Form Data
 * @returns {object|null} Form data or null if validation fails
 */
function getReviewFormData() {
    const countryInput = document.getElementById('review-country');
    const tourSelect = document.getElementById('review-tour');
    const commentTextarea = document.getElementById('review-text');
    const ratingInputs = document.getElementsByName('rating');

    // Get selected rating
    let rating = null;
    for (const radio of ratingInputs) {
        if (radio.checked) {
            rating = parseInt(radio.value);
            break;
        }
    }

    // Validation
    if (!rating) {
        showErrorMessage('Please select a rating');
        return null;
    }

    if (!commentTextarea || !commentTextarea.value.trim()) {
        showErrorMessage('Please enter your review');
        return null;
    }

    return {
        rating: rating,
        comment: commentTextarea.value.trim(),
        country: countryInput ? countryInput.value.trim() : '',
        tourPackage: tourSelect ? tourSelect.value : ''
    };
}

/**
 * Create New Review
 * @param {object} formData - Review data
 * @returns {Promise<object>} API response
 */
async function createReview(formData) {
    const token = localStorage.getItem('token');
    const feedbackToken = getFeedbackToken();

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${REVIEW_API_URL}/reviews`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            ...formData,
            feedbackToken: feedbackToken
        })
    });

    return await response.json();
}

/**
 * Update Existing Review
 * @param {string} reviewId - Review ID to update
 * @param {object} formData - Updated review data
 * @returns {Promise<object>} API response
 */
async function updateReview(reviewId, formData) {
    const token = localStorage.getItem('token');
    const feedbackToken = getFeedbackToken();

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${REVIEW_API_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            ...formData,
            feedbackToken: feedbackToken
        })
    });

    return await response.json();
}

/**
 * Show Success Message
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    const messageDiv = document.getElementById('reviewMessage');
    if (messageDiv) {
        messageDiv.className = 'alert alert-success';
        messageDiv.innerHTML = `<i class="fa fa-check-circle"></i> ${message}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

/**
 * Show Error Message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    const messageDiv = document.getElementById('reviewMessage');
    if (messageDiv) {
        messageDiv.className = 'alert alert-danger';
        messageDiv.innerHTML = `<i class="fa fa-exclamation-circle"></i> ${message}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

/**
 * Initialize Edit Mode on Page Load (if editing)
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('Edit-flow.js: DOMContentLoaded fired');
    console.log('Current pathname:', window.location.pathname);

    const editingReview = localStorage.getItem('editingReview');
    console.log('Editing review data:', editingReview);

    // Check if we're on contact page (more flexible path checking)
    const isContactPage = window.location.pathname.includes('contact.html') ||
        window.location.pathname.endsWith('contact') ||
        window.location.pathname === '/contact.html';

    console.log('Is contact page:', isContactPage);

    if (editingReview && isContactPage) {
        console.log('Entering edit mode...');
        try {
            const reviewData = JSON.parse(editingReview);
            console.log('Parsed review data:', reviewData);

            // Enter edit mode
            enterEditMode(reviewData);

            // Clear localStorage
            localStorage.removeItem('editingReview');
            console.log('Edit mode initialized successfully');
        } catch (error) {
            console.error('Error loading edit data:', error);
            localStorage.removeItem('editingReview');
        }
    } else {
        console.log('Not in edit mode or not on contact page');
    }
});
