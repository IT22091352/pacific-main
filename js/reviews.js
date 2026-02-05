// Ceylon Sang - Reviews Management
// Re-using the same API base URL
const REVIEW_API_URL = (!window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

document.addEventListener('DOMContentLoaded', function () {
    initReviews();

    // Listen for auth changes
    window.addEventListener('auth:login', checkReviewFormAuth);
    window.addEventListener('auth:logout', checkReviewFormAuth);
});

function initReviews() {
    checkReviewFormAuth();
    loadReviews();

    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editReviewId');
    if (editId) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        setTimeout(() => editReview(editId), 500);
    }
}

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

function checkReviewFormAuth() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const submitBtn = document.getElementById('reviewSubmitBtn');
    const nameInput = document.getElementById('review-name');
    const emailInput = document.getElementById('review-email');
    const countryInput = document.getElementById('review-country');
    const tourInput = document.getElementById('review-tour');
    const msgInput = document.getElementById('review-message') || document.getElementById('review-text');
    const messageDiv = document.getElementById('reviewMessage');
    const stars = document.querySelectorAll('input[name="rating"]');

    if (!token) {
        // Not logged in: Disable form and show login prompt
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.className = 'alert alert-warning text-center';
            messageDiv.innerHTML = '<strong>Please <a href="javascript:void(0)" onclick="openModal(\'loginModal\')">login</a> to leave a review.</strong>';
        }

        if (nameInput) {
            nameInput.value = '';
            nameInput.disabled = true;
            nameInput.placeholder = "Login required";
        }
        if (emailInput) {
            emailInput.value = '';
            emailInput.disabled = true;
            emailInput.placeholder = "Login required";
        }
        if (countryInput) countryInput.disabled = true;
        if (tourInput) tourInput.disabled = true;
        if (msgInput) msgInput.disabled = true;
        stars.forEach(s => s.disabled = true);

        if (submitBtn) {
            submitBtn.innerHTML = 'Login to Review';
            submitBtn.type = 'button'; // Prevent form submission
            submitBtn.onclick = function () { openModal('loginModal'); };
            submitBtn.classList.remove('btn-primary');
            submitBtn.classList.add('btn-secondary');
        }

    } else {
        // Logged in: Enable form (except name/email which are fixed)
        if (messageDiv) messageDiv.style.display = 'none';

        if (nameInput) {
            nameInput.value = userName || '';
            nameInput.disabled = true; // Still disabled as it comes from account
            nameInput.placeholder = "Your Name";
        }
        if (emailInput) {
            emailInput.value = userEmail || '';
            emailInput.disabled = true; // Still disabled as it comes from account
            emailInput.placeholder = "Your Email";
        }

        if (countryInput) countryInput.disabled = false;
        if (tourInput) tourInput.disabled = false;
        if (msgInput) msgInput.disabled = false;
        stars.forEach(s => s.disabled = false);

        if (submitBtn) {
            submitBtn.innerText = 'Submit Review';
            submitBtn.type = 'submit';
            submitBtn.onclick = null; // Remove the direct onclick handler so it submits form
            submitBtn.classList.add('btn-primary');
            submitBtn.classList.remove('btn-secondary');
            submitBtn.disabled = false;
        }
    }
}

function isReviewOwner(review) {
    const userId = localStorage.getItem('userId');
    if (userId && review.user && review.user._id === userId) return true;
    const myGuestReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
    if (!userId && myGuestReviews.includes(review._id)) return true;
    return false;
}

// Load reviews for Owl Carousel
async function loadReviews() {
    const carouselContainer = document.getElementById('reviews-carousel');

    if (!carouselContainer) return;

    try {
        const response = await fetch(`${REVIEW_API_URL}/reviews`);
        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
        }

        const result = await response.json();

        if (result.success && result.data.length > 0) {
            // Deduplicate by ID
            const seen = new Set();
            const uniqueReviews = result.data.filter(r => {
                if (seen.has(r._id)) return false;
                seen.add(r._id);
                return true;
            });

            // Store globally for modal access
            window.loadedReviewsMap = new Map();
            uniqueReviews.forEach(r => window.loadedReviewsMap.set(r._id, r));

            // Generate HTML for all reviews
            const reviewsHTML = uniqueReviews.map(review => createPremiumReviewCard(review)).join('');

            // Destroy previous instance safely
            if ($(carouselContainer).data('owl.carousel')) {
                try {
                    $(carouselContainer).trigger('destroy.owl.carousel');
                } catch (e) {
                    console.warn('Owl Carousel destroy failed (harmless):', e);
                }
            }

            // Inject HTML
            carouselContainer.innerHTML = reviewsHTML;

            // Initialize Owl Carousel
            $(carouselContainer).owlCarousel({
                loop: uniqueReviews.length > 3, // Only loop if enough items
                margin: 20,
                nav: false,
                dots: true,
                autoplay: true,
                autoplayTimeout: 2000, // 2 second interval
                autoplayHoverPause: true,
                smartSpeed: 800,
                responsive: {
                    0: { items: 1 },
                    600: { items: 2 },
                    1000: { items: 3 }
                }
            });

        } else {
            carouselContainer.innerHTML = '<p class="text-center w-100">No reviews yet.</p>';
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        carouselContainer.innerHTML = `
            <div class="text-center w-100 p-5">
                 <h4 class="text-danger">Failed to load reviews</h4>
                 <p class="text-muted">${error.message}</p>
                 <small>Check console for details.</small>
            </div>`;
    }
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fa fa-star text-warning"></i>';
        } else {
            stars += '<i class="fa fa-star-o text-muted"></i>';
        }
    }
    return stars;
}

function createPremiumReviewCard(review) {
    const stars = generateStars(review.rating);
    const country = review.country || '';
    const tourPackage = review.tourPackage ? getTourLabel(review.tourPackage) : '';
    const initials = (review.user ? review.user.name : (review.guestName || 'G')).charAt(0).toUpperCase();
    const name = escapeHtml(review.user ? review.user.name : review.guestName);

    let actions = '';
    if (isReviewOwner(review)) {
        actions = `
            <div class="review-actions-menu">
                <button class="btn-icon-menu" onclick="openGlobalMenu(event, '${review._id}')">
                    <i class="fa fa-ellipsis-v"></i>
                </button>
            </div>
        `;
    }

    // Logic for truncation and Read More
    const maxChars = 120;
    const fullText = escapeHtml(review.comment);
    let displayHtml = fullText;
    let readMoreBtn = '';

    if (fullText.length > maxChars) {
        // Truncate cleanly at word boundary if possible
        let sub = fullText.substring(0, maxChars);
        const lastSpace = sub.lastIndexOf(' ');
        if (lastSpace > 0) sub = sub.substring(0, lastSpace);

        displayHtml = `${sub}...`;
        readMoreBtn = `<button type="button" class="btn-read-more" onclick="window.showFullReview('${review._id}'); return false;">Read More</button>`;
    }

    return `
        <div class="testimonial-card-premium" id="review-${review._id}">
            ${actions}
            <div class="quote-icon"><i class="fa fa-quote-left"></i></div>
            <div class="rating-stars">${stars}</div>
            <p class="review-text">
                ${displayHtml}
                ${readMoreBtn}
            </p>
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

// Function to show full review modal
window.showFullReview = function (reviewId) {
    console.log('Opening review:', reviewId);
    if (!window.loadedReviewsMap) {
        console.error('Reviews map not loaded');
        alert('Review data not ready. Please refresh.');
        return;
    }

    const review = window.loadedReviewsMap.get(reviewId);
    if (!review) {
        console.error('Review not found in map:', reviewId);
        return;
    }

    // Remove existing modal if any
    const existing = document.getElementById('reviewDetailModal');
    if (existing) existing.remove();

    // Create Modal HTML re-using your modal structure styles
    const modal = document.createElement('div');
    modal.id = 'reviewDetailModal';
    modal.className = 'modal'; // Uses your existing modal class
    modal.style.display = 'block'; // Make it visible in layout
    modal.style.zIndex = '10000'; // High z-index to sit over everything

    const stars = generateStars(review.rating);
    const name = escapeHtml(review.user ? review.user.name : review.guestName);

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; margin: 10% auto;">
            <div class="modal-header">
                <h2>${name}'s Review</h2>
                <button class="close-modal" onclick="document.getElementById('reviewDetailModal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="text-center mb-3">
                    <div class="rating-stars" style="font-size: 1.2rem;">${stars}</div>
                </div>
                <div class="review-full-content" style="font-size: 1rem; line-height: 1.8; color: #444; max-height: 400px; overflow-y: auto;">
                    ${escapeHtml(review.comment)}
                </div>
                <div class="mt-4 text-center">
                    <span class="text-muted"><i class="fa fa-map-marker"></i> ${review.country || 'International'}</span>
                    ${review.tourPackage ? `<br><span class="text-primary">${getTourLabel(review.tourPackage)}</span>` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Trigger transition
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    // Close on outside click
    modal.onclick = function (event) {
        if (event.target == modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function getTourLabel(packageKey) {
    const packages = {
        'island-escape': 'Island Escape (10 Days)',
        'cultural-odyssey': 'Cultural Odyssey (7 Days)',
        'wildlife-adventure': 'Wildlife Adventure (6 Days)',
        'luxury-honeymoon': 'Luxury Honeymoon (8 Days)'
    };
    return packages[packageKey] || packageKey;
}

function openGlobalMenu(event, reviewId) {
    event.stopPropagation();
    event.preventDefault();
    closeGlobalMenu();
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = 'global-review-menu';
    menu.className = 'global-dropdown-menu';
    menu.innerHTML = `
        <a href="javascript:void(0)" onclick="editReview('${reviewId}'); closeGlobalMenu()">
            <i class="fa fa-pencil"></i> Edit
        </a>
        <a href="javascript:void(0)" onclick="deleteReview('${reviewId}'); closeGlobalMenu()">
            <i class="fa fa-trash"></i> Delete
        </a>
    `;
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.left - 80}px`;
    menu.style.zIndex = '9999';
    menu.style.background = '#fff';
    menu.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    menu.style.borderRadius = '8px';
    menu.style.padding = '8px 0';
    menu.style.minWidth = '120px';
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';
    document.body.appendChild(menu);
    const links = menu.querySelectorAll('a');
    links.forEach(a => {
        a.style.display = 'block';
        a.style.padding = '8px 15px';
        a.style.color = '#333';
        a.style.textDecoration = 'none';
        a.style.fontSize = '14px';
        a.style.transition = 'background 0.2s';
        a.onmouseenter = () => a.style.background = '#f3f4f6';
        a.onmouseleave = () => a.style.background = 'transparent';
    });
}

function closeGlobalMenu() {
    const menu = document.getElementById('global-review-menu');
    if (menu) menu.remove();
}

window.addEventListener('click', function (event) {
    if (!event.target.closest('#global-review-menu') && !event.target.closest('.btn-icon-menu')) {
        closeGlobalMenu();
    }
});

function editReview(reviewId) {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) {
        window.location.href = `contact.html?editReviewId=${reviewId}`;
        return;
    }
    fetch(`${REVIEW_API_URL}/reviews`)
        .then(res => res.json())
        .then(result => {
            const review = result.data.find(r => r._id === reviewId);
            if (review) populateReviewForm(review);
        })
        .catch(err => console.error(err));
}

function populateReviewForm(review) {
    const formTitle = document.getElementById('review-form-title');
    const submitBtn = document.getElementById('reviewSubmitBtn');
    const editIndicator = document.getElementById('edit-mode-indicator');
    const reviewForm = document.getElementById('reviewForm');

    if (reviewForm) reviewForm.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const msgInput = document.getElementById('review-message') || document.getElementById('review-text');
    if (msgInput) msgInput.value = review.comment;
    const pkgInput = document.getElementById('review-package') || document.getElementById('review-tour');
    if (pkgInput) pkgInput.value = review.tourPackage || '';
    const countryInput = document.getElementById('review-country');
    if (countryInput) countryInput.value = review.country || '';
    const star = document.querySelector(`input[name="rating"][value="${review.rating}"]`);
    if (star) star.checked = true;
    if (review.guestName && document.getElementById('review-name')) document.getElementById('review-name').value = review.guestName;
    if (review.guestEmail && document.getElementById('review-email')) document.getElementById('review-email').value = review.guestEmail;

    if (formTitle) formTitle.innerText = 'Edit Your Review';
    if (editIndicator) editIndicator.style.display = 'block';

    submitBtn.innerText = 'Update Review';
    submitBtn.dataset.editingId = review._id;

    if (!document.getElementById('cancelEditBtn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'cancelEditBtn';
        cancelBtn.className = 'btn-outline-cancel';
        cancelBtn.innerHTML = '<i class="fa fa-times"></i> Cancel Edit';
        cancelBtn.onclick = cancelEdit;
        submitBtn.parentNode.appendChild(cancelBtn);
    }
}

function cancelEdit() {
    document.getElementById('reviewForm').reset();
    document.getElementById('review-form-title').innerText = 'Leave a Review';
    document.getElementById('edit-mode-indicator').style.display = 'none';
    const submitBtn = document.getElementById('reviewSubmitBtn');
    submitBtn.innerText = 'Submit Review';
    delete submitBtn.dataset.editingId;
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.remove();
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('reviewSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting...';

    const formData = {
        rating: document.querySelector('input[name="rating"]:checked')?.value,
        comment: document.getElementById('review-message') ? document.getElementById('review-message').value : document.getElementById('review-text').value,
        tourPackage: document.getElementById('review-package') ? document.getElementById('review-package').value : document.getElementById('review-tour').value,
        country: document.getElementById('review-country').value,
        guestName: document.getElementById('review-name').value,
        guestEmail: document.getElementById('review-email').value,
    };

    if (!formData.rating) {
        alert('Please select a star rating.');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Submit Review';
        return;
    }

    const feedbackToken = getFeedbackToken();
    const editingId = submitBtn.dataset.editingId;
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', 'x-feedback-token': feedbackToken };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = editingId ? `${REVIEW_API_URL}/reviews/${editingId}` : `${REVIEW_API_URL}/reviews`;
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, { method, headers, body: JSON.stringify(formData) });
        const result = await response.json();

        if (response.ok) {
            alert(editingId ? 'Review updated successfully!' : 'Review submitted successfully!');
            document.getElementById('reviewForm').reset();
            if (!token && result.data?._id) {
                const myReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
                if (!myReviews.includes(result.data._id)) {
                    myReviews.push(result.data._id);
                    localStorage.setItem('myGuestReviews', JSON.stringify(myReviews));
                }
                localStorage.setItem('guestName', formData.guestName);
                localStorage.setItem('guestEmail', formData.guestEmail);
            }
            cancelEdit();
            loadReviews();
        } else {
            alert(result.message || 'Failed to submit review.');
        }
    } catch (error) {
        console.error(error);
        alert('Error submitting review.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = editingId ? 'Update Review' : 'Submit Review';
    }
}

async function deleteReview(reviewId) {
    if (!confirm('Delete this review?')) return;
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', 'x-feedback-token': getFeedbackToken() };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${REVIEW_API_URL}/reviews/${reviewId}`, { method: 'DELETE', headers });
        if (res.ok) {
            alert('Review deleted.');
            let myReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
            myReviews = myReviews.filter(id => id !== reviewId);
            localStorage.setItem('myGuestReviews', JSON.stringify(myReviews));
            loadReviews();
        } else {
            const result = await res.json();
            alert(result.message || 'Failed to delete.');
        }
    } catch (e) { console.error(e); alert('Error deleting review.'); }
}
