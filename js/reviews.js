// Ceylon Sang - Reviews Management
// Re-using the same API base URL
const REVIEW_API_URL = (!window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

document.addEventListener('DOMContentLoaded', function () {
    initReviews();
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
    const messageDiv = document.getElementById('reviewMessage');

    if (submitBtn) submitBtn.disabled = false;

    if (!token) {
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
        if (messageDiv) messageDiv.style.display = 'none';
    } else {
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

function isReviewOwner(review) {
    const userId = localStorage.getItem('userId');
    if (userId && review.user && review.user._id === userId) return true;
    const myGuestReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
    if (!userId && myGuestReviews.includes(review._id)) return true;
    return false;
}

// Load reviews for Dual-Row Marquee
async function loadReviews() {
    const row1 = document.getElementById('marquee-row-1');
    const row2 = document.getElementById('marquee-row-2');
    const container = document.querySelector('.marquee-section');

    if (!row1 || !row2) return;

    try {
        const response = await fetch(`${REVIEW_API_URL}/reviews`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            // 1. Deduplicate by ID
            const seen = new Set();
            const uniqueReviews = result.data.filter(r => {
                if (seen.has(r._id)) return false;
                seen.add(r._id);
                return true;
            });

            // Clear rows
            row1.innerHTML = '<div class="marquee-track animate-left"></div>';
            row2.innerHTML = '<div class="marquee-track animate-right"></div>';
            
            const track1 = row1.querySelector('.marquee-track');
            const track2 = row2.querySelector('.marquee-track');

            // --- SMART LOGIC ---
            // If reviews are few (< 5), disable marquee and show static grid
            if (uniqueReviews.length < 5) {
                if (container) container.classList.add('path-static-view');
                
                // Put all in Row 1, Center them, NO CLONES
                const generateHTML = (list) => {
                     return list.map(review => createPremiumReviewCard(review)).join('');
                };

                track1.innerHTML = generateHTML(uniqueReviews);
                
                // Hide Row 2
                row2.style.display = 'none';

            } else {
                // Enough reviews for Marquee
                if (container) container.classList.remove('path-static-view');
                row2.style.display = 'block';

                const mid = Math.ceil(uniqueReviews.length / 2);
                const dataRow1 = uniqueReviews.slice(0, mid);
                const dataRow2 = uniqueReviews.slice(mid);

                const fillTrack = (track, items) => {
                    if (!items.length) {
                        track.innerHTML = ''; 
                        return;
                    }

                    const generateHTML = (list, suffix) => {
                        return list.map((review, i) => {
                            const domId = suffix ? `review-${suffix}-${review._id}` : `review-${review._id}`;
                            let html = createPremiumReviewCard(review);
                            return html.replace(/id="review-[^"]+"/, `id="${domId}"`);
                        }).join('');
                    };

                    let contentHTML = generateHTML(items, '');
                    contentHTML += generateHTML(items, 'clone1');
                    
                    if (items.length < 4) {
                         contentHTML += generateHTML(items, 'clone2');
                    }

                    track.innerHTML = contentHTML;
                };

                fillTrack(track1, dataRow1);
                fillTrack(track2, dataRow2);
            }

        } else {
             row1.innerHTML = '<p class="text-center w-100">No reviews yet.</p>';
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        row1.innerHTML = `
            <div class="text-center w-100 text-danger">
                <p>Failed to load reviews.</p>
                <small>${error.message}</small>
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

    return `
        <div class="testimonial-card-premium" id="review-${review._id}">
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

window.addEventListener('click', function(event) {
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
