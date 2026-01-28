// Ceylon Sang - Reviews Management
// Re-using the same API base URL
const REVIEW_API_URL = '/api';

document.addEventListener('DOMContentLoaded', function () {
    initReviews();
});

function initReviews() {
    // Check auth state for form
    checkReviewFormAuth();

    // Load existing reviews
    loadReviews();

    // Handle form submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
}

// Check authentication for the review form
function checkReviewFormAuth() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    const submitBtn = document.getElementById('reviewSubmitBtn');
    const nameInput = document.getElementById('review-name');
    const emailInput = document.getElementById('review-email');
    const messageDiv = document.getElementById('reviewMessage');

    if (!token) {
        // User not logged in
        if (submitBtn) submitBtn.disabled = true;
        if (messageDiv) {
            messageDiv.className = 'alert alert-warning';
            messageDiv.innerHTML = 'Please <a href="#" onclick="openModal(\'loginModal\'); return false;">login</a> to leave a review.';
            messageDiv.style.display = 'block';
        }
    } else {
        // User logged in
        if (submitBtn) submitBtn.disabled = false;
        if (nameInput) nameInput.value = userName || '';
        if (emailInput) emailInput.value = userEmail || '';
        if (messageDiv) messageDiv.style.display = 'none';
    }
}

// Load reviews from API
async function loadReviews() {
    // Use jQuery selector for Owl Carousel since we changed ID in HTML
    const container = $('#reviews-carousel');
    if (!container.length) return;

    try {
        const response = await fetch(`${REVIEW_API_URL}/reviews`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            // Destroy existing carousel to safely update content, ONLY if it was already initialized
            // This prevents "settings is not defined" error
            if (container.hasClass('owl-loaded')) {
                container.trigger('destroy.owl.carousel');
                container.find('.owl-stage-outer').children().unwrap();
                container.removeClass("owl-center owl-loaded owl-text-select-on");
            }

            // Clear static/old content
            container.html('');

            result.data.forEach(review => {
                const reviewHTML = createReviewCard(review);
                container.append(reviewHTML);
            });

            // Add styling class back
            container.addClass('carousel-testimony');

            // Re-initialize Owl Carousel with Autoplay
            container.owlCarousel({
                center: true,
                loop: true,
                items: 1,
                margin: 30,
                stagePadding: 0,
                nav: false,
                navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
                autoplay: true,
                autoplayTimeout: 2000,
                autoplayHoverPause: true,
                responsive: {
                    0: { items: 1 },
                    600: { items: 2 },
                    1000: { items: 3 }
                }
            });
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Create HTML for a review card
function createReviewCard(review) {
    const stars = generateStars(review.rating);
    const tourInfo = review.tourPackage
        ? `<small>${review.country ? review.country + ' - ' : ''}${getTourLabel(review.tourPackage)}</small>`
        : `<small>${review.country || ''}</small>`;

    return `
        <div class="item">
            <div class="review-card">
                <div class="review-rating">
                    ${stars}
                </div>
                <p>"${escapeHtml(review.comment)}"</p>
                <div class="review-author">
                    <strong>${escapeHtml(review.user.name)}</strong><br>
                    ${tourInfo}
                </div>
            </div>
        </div>
    `;
}

// Helper: Generate star icons
function generateStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<i class="fa fa-star"></i> ';
        } else {
            starsHtml += '<i class="fa fa-star-o"></i> '; // Empty star if font-awesome supports it, or grey
        }
    }
    return starsHtml;
}

// Helper: Get readable label for tour package
function getTourLabel(value) {
    const options = {
        'cultural': 'Cultural Triangle Explorer',
        'beach-wildlife': 'Beach & Wildlife Safari',
        'complete': 'Complete Sri Lanka',
        'hill-country': 'Hill Country & Tea Trails',
        'wildlife': 'Wildlife & Nature Adventure',
        'coastal': 'Coastal Paradise Tour',
        'weekend': 'Weekend Getaway',
        'grand': 'Grand Sri Lanka Tour',
        'custom': 'Custom Tour Package'
    };
    return options[value] || value;
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Handle Form Submission
async function handleReviewSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Please login first', 'danger');
        return;
    }

    const country = document.getElementById('review-country').value;
    const tourPackage = document.getElementById('review-tour').value;
    const comment = document.getElementById('review-text').value;

    // Get rating
    let rating = 0;
    const ratingInputs = document.getElementsByName('rating');
    for (const input of ratingInputs) {
        if (input.checked) {
            rating = parseInt(input.value);
            break;
        }
    }

    if (rating === 0) {
        showMessage('Please select a star rating', 'danger');
        return;
    }

    const submitBtn = document.getElementById('reviewSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.value = 'Submitting...';

    try {
        const response = await fetch(`${REVIEW_API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                country,
                tourPackage,
                rating,
                comment
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Review submitted successfully!', 'success');
            document.getElementById('reviewForm').reset();
            // Refill name/email since form reset clears them
            checkReviewFormAuth();

            // Reload reviews to show the new one
            loadReviews();
        } else {
            showMessage(result.message || 'Error submitting review', 'danger');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showMessage('Network error. Please try again.', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.value = 'Submit Review';
    }
}

function fadeInNewElements() {
    // Simple fade in effect class addition if needed
    const elements = document.querySelectorAll('.ftco-animate');
    elements.forEach(el => {
        el.style.opacity = 1;
        el.style.visibility = 'visible';
    });
}

// Show Message Helper (missing from original file)
function showMessage(msg, type) {
    const messageDiv = document.getElementById('reviewMessage');
    if (messageDiv) {
        messageDiv.className = `alert alert-${type}`;
        messageDiv.textContent = msg;
        messageDiv.style.display = 'block';

        // Scroll to message so user sees it
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(msg);
    }
}
