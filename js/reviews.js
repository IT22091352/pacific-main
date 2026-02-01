// Ceylon Sang - Reviews Management
// Re-using the same API base URL
// Determine API URL based on environment
const REVIEW_API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

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

// Helper: Get or create Feedback Token
function getFeedbackToken() {
    let token = localStorage.getItem('feedbackToken');
    if (!token) {
        token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem('feedbackToken', token);
    }
    return token;
}

// Check auth state for form
function checkReviewFormAuth() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    const submitBtn = document.getElementById('reviewSubmitBtn');
    const nameInput = document.getElementById('review-name');
    const emailInput = document.getElementById('review-email');
    const messageDiv = document.getElementById('reviewMessage');

    // Always enable for guests too
    if (submitBtn) submitBtn.disabled = false;

    if (!token) {
        // User not logged in - Guest Mode
        if (nameInput) {
            nameInput.disabled = false;
            nameInput.placeholder = "Enter your name (Guest)";
            nameInput.value = localStorage.getItem('guestName') || '';
        }
        if (emailInput) {
            emailInput.disabled = false;
            emailInput.placeholder = "Enter your email (Guest)";
            emailInput.value = localStorage.getItem('guestEmail') || '';
        }
        if (messageDiv) messageDiv.style.display = 'none'; // Hide generic "please login"
    } else {
        // User logged in
        if (nameInput) {
            nameInput.value = userName || '';
            nameInput.disabled = true;
        }
        if (emailInput) {
            emailInput.value = userEmail || '';
            emailInput.disabled = true;
        }
        if (messageDiv) messageDiv.style.display = 'none';
    }
}

// Check if current user owns the review
function isReviewOwner(review) {
    const userId = localStorage.getItem('userId'); // Assuming login stores userId
    const currentToken = localStorage.getItem('feedbackToken');

    if (userId && review.user && review.user._id === userId) return true;
    // Check token ownership (requires backend to return feedbackToken or we infer it blindly? 
    // Ideally backend shouldn't return token. We can't check 'review.feedbackToken' if it's select:false.
    // However, if we just rely on delete/edit failing, that's secure but bad UX.
    // For guests, we can check if they created it in this session history?
    // OR: for now, assume ownership if we created it locally (better would be if API returned 'isOwner' boolean)
    // To keep it simple: We will try to delete/edit. if backend says 401, we know.
    // But to SHOW buttons: we need a hint.
    // Let's rely on local storage of "myReviewIds" or similiar? No, too complex.
    // Let's Assume the feedbackToken matches. Wait, we can't see the token.
    // Solution: Backend should return `isOwner` virtual field or we check `review.user` vs `userId`.
    // For Guest: we only know if we have the token that matches.
    // We'll proceed by trying. We'll show buttons for ALL potentially (or hide all). 
    // BETTER: Backend returns a flag `isOwner: true` if the request header token matches user OR guest token matches.
    // Since we don't send guest token on GET /reviews, we can't know. 
    // REVISED PLAN: We will store 'myReviews' in localStorage as [id1, id2].

    // For now, let's implement the 'try and fail' approach or local ID storage.
    // We'll use LocalStorage for Guest IDs.
    const myGuestReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
    if (!userId && myGuestReviews.includes(review._id)) return true;

    return false;
}


// Custom Carousel State
const carouselState = {
    currentIndex: 0,
    totalSlides: 0,
    autoplayInterval: null,
    isDragging: false,
    startPos: 0,
    currentTranslate: 0,
    prevTranslate: 0,
    animationID: 0,
    track: null,
    cards: []
};

// Load reviews from API
async function loadReviews() {
    const track = document.getElementById('reviews-track');
    if (!track) return;

    // Store track reference
    carouselState.track = track;

    try {
        const response = await fetch(`${REVIEW_API_URL}/reviews`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {

            // Clear track
            track.innerHTML = '';

            // Store total
            carouselState.totalSlides = result.data.length;

            // Render Cards
            result.data.forEach((review, index) => {
                const reviewHTML = createPremiumReviewCard(review, index);
                track.insertAdjacentHTML('beforeend', reviewHTML);
            });

            // Get cards ref
            carouselState.cards = Array.from(document.querySelectorAll('.testimonial-card-premium'));

            // Initialize Carousel
            initCustomCarousel();

        } else {
            track.innerHTML = '<p class="text-center w-100">No reviews yet. Be the first!</p>';
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        track.innerHTML = '<p class="text-center w-100 text-danger">Failed to load reviews.</p>';
    }
}

// Create Premium Review Card HTML
function createPremiumReviewCard(review, index) {
    const stars = generateStars(review.rating);

    // Get country and tour info
    const country = review.country || '';
    const tourPackage = review.tourPackage ? getTourLabel(review.tourPackage) : '';

    // Build the position/company line (like "VP of Product, Zapay")
    let positionLine = '';
    if (country && tourPackage) {
        positionLine = `${country} - ${tourPackage}`;
    } else if (country) {
        positionLine = country;
    } else if (tourPackage) {
        positionLine = tourPackage;
    } else {
        positionLine = 'International Traveler';
    }

    const initials = (review.user ? review.user.name : (review.guestName || 'G')).charAt(0).toUpperCase();
    const name = escapeHtml(review.user ? review.user.name : review.guestName);

    // Action Menu (if owner)
    let actions = '';
    if (isReviewOwner(review)) {
        actions = `
            <div class="review-actions-menu">
                <button class="btn-icon-menu" onclick="toggleReviewMenu(event, '${review._id}')">
                    <i class="fa fa-ellipsis-v"></i>
                </button>
                <div id="menu-${review._id}" class="dropdown-content">
                    <a href="javascript:void(0)" onclick="editReview('${review._id}')">
                        <i class="fa fa-pencil"></i> Edit
                    </a>
                    <a href="javascript:void(0)" onclick="deleteReview('${review._id}')">
                        <i class="fa fa-trash"></i> Delete
                    </a>
                </div>
            </div>
        `;
    }

    return `
        <div class="testimonial-card-premium ${index === 0 ? 'active' : ''}" id="review-${review._id}">
            ${actions}
            <div class="quote-icon"><i class="fa fa-quote-left"></i></div>
            <div class="rating-stars">${stars}</div>
            
            <p class="review-text">${escapeHtml(review.comment)}</p>
            
            <div class="user-info">
                <div class="avatar">${initials}</div>
                <div class="details">
                    <h4>${name}</h4>
                    ${country ? `<span class="country"><i class="fa fa-map-marker"></i> ${country}</span>` : ''}
                    ${tourPackage ? `<span class="tour-package">${tourPackage}</span>` : ''}
                    ${!country && !tourPackage ? '<span>International Traveler</span>' : ''}
                </div>
            </div>
        </div>
    `;
}

// Initialize Custom Carousel
function initCustomCarousel() {
    setupCarouselEvents();
    updateCarouselPosition();
    startAutoplay();
}

function setupCarouselEvents() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const track = carouselState.track;

    // Buttons
    if (prevBtn) prevBtn.addEventListener('click', () => {
        stopAutoplay();
        prevSlide();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        stopAutoplay();
        nextSlide();
    });

    // Touch / Swipe
    track.addEventListener('touchstart', touchStart);
    track.addEventListener('touchend', touchEnd);
    track.addEventListener('touchmove', touchMove);

    // Mouse Drag (Optional, good for desktop)
    track.addEventListener('mousedown', touchStart);
    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', () => {
        if (carouselState.isDragging) touchEnd();
    });
    track.addEventListener('mousemove', touchMove);

    // Pause on Hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopAutoplay();
            prevSlide();
        }
        if (e.key === 'ArrowRight') {
            stopAutoplay();
            nextSlide();
        }
    });

    // Resize
    window.addEventListener('resize', updateCarouselPosition);
}

function prevSlide() {
    if (carouselState.currentIndex > 0) {
        carouselState.currentIndex--;
    } else {
        carouselState.currentIndex = carouselState.totalSlides - 1; // Loop to end
    }
    updateCarouselPosition();
}

function nextSlide() {
    if (carouselState.currentIndex < carouselState.totalSlides - 1) {
        carouselState.currentIndex++;
    } else {
        carouselState.currentIndex = 0; // Loop to start
    }
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const track = carouselState.track;
    const cards = carouselState.cards;
    const cardWidth = cards[0].offsetWidth + 30; // Width + Gap (gap defined in CSS: 30px)

    // Center logic: content is width of card. 
    // We want current card centered.
    // viewport center = viewportWidth / 2
    // card center = cardWidth / 2
    // offset = (viewportWidth / 2) - (cardWidth / 2)
    // translateX = -(currentIndex * cardWidth) + offset

    const viewportWidth = document.querySelector('.testimonial-viewport').offsetWidth;
    const centerOffset = (viewportWidth - cards[0].offsetWidth) / 2;

    let translatePos = -(carouselState.currentIndex * cardWidth) + centerOffset;

    // Limit bounds (optional, but for "centering" active slide, usually we let it flow)
    // If we want hard looping, we need to clone nodes.
    // Basic slider: just slide.

    carouselState.currentTranslate = translatePos;
    carouselState.prevTranslate = translatePos;

    track.style.transform = `translateX(${translatePos}px)`;

    // Update Active Class
    cards.forEach((card, index) => {
        if (index === carouselState.currentIndex) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    // Update Progress Bar
    const progress = ((carouselState.currentIndex + 1) / carouselState.totalSlides) * 100;
    const bar = document.getElementById('carousel-progress');
    if (bar) bar.style.width = `${progress}%`;
}

// Autoplay Logic
function startAutoplay() {
    stopAutoplay(); // Clear existing
    carouselState.autoplayInterval = setInterval(() => {
        nextSlide();
    }, 1000); // 1 second
}

function stopAutoplay() {
    if (carouselState.autoplayInterval) {
        clearInterval(carouselState.autoplayInterval);
        carouselState.autoplayInterval = null;
    }
}

// Touch/Drag Logic
function touchStart(event) {
    carouselState.isDragging = true;
    carouselState.startPos = getPositionX(event);
    carouselState.animationID = requestAnimationFrame(animation);
    carouselState.track.style.cursor = 'grabbing';
}

function touchMove(event) {
    if (carouselState.isDragging) {
        const currentPosition = getPositionX(event);
        const currentTranslate = carouselState.prevTranslate + currentPosition - carouselState.startPos;
        carouselState.currentTranslate = currentTranslate;
    }
}

function touchEnd() {
    carouselState.isDragging = false;
    cancelAnimationFrame(carouselState.animationID);

    const movedBy = carouselState.currentTranslate - carouselState.prevTranslate;

    // Threshold to change slide
    if (movedBy < -100) nextSlide();
    else if (movedBy > 100) prevSlide();
    else updateCarouselPosition(); // Snap back

    carouselState.track.style.cursor = 'grab';
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function animation() {
    if (carouselState.isDragging) {
        setSliderPosition();
        requestAnimationFrame(animation);
    }
}

function setSliderPosition() {
    carouselState.track.style.transform = `translateX(${carouselState.currentTranslate}px)`;
}


// Create HTML for a review card


// Helper: Toggle Menu
function toggleReviewMenu(event, id) {
    event.stopPropagation(); // Prevent bubbling

    // Close all other menus
    const allMenus = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < allMenus.length; i++) {
        if (allMenus[i].id !== `menu-${id}`) {
            allMenus[i].classList.remove('show');
        }
    }

    document.getElementById(`menu-${id}`).classList.toggle("show");
}

// Close menus when clicking outside
window.onclick = function (event) {
    if (!event.target.matches('.btn-icon-menu') && !event.target.matches('.btn-icon-menu i')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) {
                dropdowns[i].classList.remove('show');
            }
        }
    }
}

// Delete Review
async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    const token = localStorage.getItem('token');
    const feedbackToken = getFeedbackToken();

    try {
        const response = await fetch(`${REVIEW_API_URL}/reviews/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ feedbackToken }) // Send token for guest auth
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Review deleted successfully', 'success');
            // Remove from local guest list
            let myGuestReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
            myGuestReviews = myGuestReviews.filter(reviewId => reviewId !== id);
            localStorage.setItem('myGuestReviews', JSON.stringify(myGuestReviews));

            loadReviews(); // Refresh list
        } else {
            showMessage(result.message || 'Error deleting review', 'danger');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('Error deleting review', 'danger');
    }
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

// Handle Form Submission (Create or Update)
async function handleReviewSubmit(e) {
    e.preventDefault();

    // Check if we're in edit mode
    const editIdField = document.getElementById('edit-review-id');
    const isEditMode = editIdField && editIdField.value;
    const reviewId = isEditMode ? editIdField.value : null;

    const token = localStorage.getItem('token');
    const feedbackToken = getFeedbackToken();
    const isGuest = !token;

    const country = document.getElementById('review-country').value;
    const tourPackage = document.getElementById('review-tour').value;
    const comment = document.getElementById('review-text').value;

    // Guest Details
    let guestName = '';
    let guestEmail = '';
    if (isGuest) {
        guestName = document.getElementById('review-name').value;
        guestEmail = document.getElementById('review-email').value;
        if (!guestName) {
            showMessage('Please enter your name', 'danger');
            return;
        }
        // Save guest details for future
        localStorage.setItem('guestName', guestName);
        localStorage.setItem('guestEmail', guestEmail);
    }

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
    const originalValue = submitBtn.value;
    submitBtn.disabled = true;
    submitBtn.value = isEditMode ? 'Updating...' : 'Submitting...';

    const payload = {
        country,
        tourPackage,
        rating,
        comment,
        feedbackToken: isGuest ? feedbackToken : undefined,
        guestName: isGuest ? guestName : undefined,
        guestEmail: isGuest ? guestEmail : undefined
    };

    try {
        let response;

        if (isEditMode) {
            // UPDATE existing review
            response = await fetch(`${REVIEW_API_URL}/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(payload)
            });
        } else {
            // CREATE new review
            response = await fetch(`${REVIEW_API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(payload)
            });
        }

        const result = await response.json();

        if (result.success) {
            showMessage(
                isEditMode ? 'Review updated successfully!' : 'Review submitted successfully!',
                'success'
            );

            // Reset form
            document.getElementById('reviewForm').reset();

            // Clear edit mode
            if (editIdField) editIdField.value = '';

            // Reset UI to create mode
            if (typeof updateFormUIForEditMode === 'function') {
                updateFormUIForEditMode(false);
            }

            checkReviewFormAuth(); // Refill/Reset UI

            // Store ID if guest for ownership check (only for new reviews)
            if (!isEditMode && isGuest && result.data && result.data._id) {
                let myGuestReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
                myGuestReviews.push(result.data._id);
                localStorage.setItem('myGuestReviews', JSON.stringify(myGuestReviews));
            }

            // Reload reviews
            loadReviews();

            // Scroll to testimonials after update
            if (isEditMode) {
                setTimeout(() => {
                    const testimonialsSection = document.querySelector('.testimony-section') ||
                        document.getElementById('reviews-track');
                    if (testimonialsSection) {
                        testimonialsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 1000);
            }
        } else {
            showMessage(result.message || `Error ${isEditMode ? 'updating' : 'submitting'} review`, 'danger');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showMessage('Network error. Please try again.', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.value = originalValue;
    }
}

// Edit Review Helper
let currentEditingId = null;

function editReview(id) {
    console.log('=== EDIT REVIEW CLICKED ===');
    console.log('Review ID:', id);

    // Fetch review details
    fetch(`${REVIEW_API_URL}/reviews`)
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                const review = res.data.find(r => r._id === id);
                if (review) {
                    console.log('Review found:', review);

                    // Store review data in localStorage for contact page
                    const editData = {
                        id: review._id,
                        rating: review.rating,
                        comment: review.comment,
                        tourPackage: review.tourPackage || '',
                        country: review.country || ''
                    };

                    localStorage.setItem('editingReview', JSON.stringify(editData));
                    console.log('Stored in localStorage:', editData);

                    // Navigate to contact page with timestamp to force reload
                    console.log('Navigating to contact.html with forced reload...');
                    window.location.assign(`contact.html?t=${Date.now()}#review-form`);
                } else {
                    console.error('Review not found!');
                }
            }
        })
        .catch(error => {
            console.error('Error loading review for edit:', error);
            alert('Failed to load review. Please try again.');
        });
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

// Check if we're in edit mode (on contact page)
document.addEventListener('DOMContentLoaded', function () {
    const editingReview = localStorage.getItem('editingReview');

    if (editingReview && window.location.pathname.includes('contact.html')) {
        const reviewData = JSON.parse(editingReview);

        // Store the ID for the update operation
        currentEditingId = reviewData.id;

        // Pre-populate the form fields
        const ratingSelect = document.getElementById('rating');
        const commentTextarea = document.getElementById('comment');
        const tourPackageSelect = document.getElementById('tourPackage');
        const countryInput = document.getElementById('country');

        if (ratingSelect) ratingSelect.value = reviewData.rating;
        if (commentTextarea) commentTextarea.value = reviewData.comment;
        if (tourPackageSelect && reviewData.tourPackage) tourPackageSelect.value = reviewData.tourPackage;
        if (countryInput && reviewData.country) countryInput.value = reviewData.country;

        // Scroll to the form
        setTimeout(() => {
            const formSection = document.querySelector('.ftco-section.contact-section') ||
                document.querySelector('[id*="review"]') ||
                document.querySelector('form');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);

        // Change submit button text to indicate update mode
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn && submitBtn.textContent.includes('Submit')) {
            submitBtn.textContent = 'Update Review';
            submitBtn.style.background = 'var(--sunset-orange)';
        }

        // Clear the localStorage after loading
        localStorage.removeItem('editingReview');
    }
});
