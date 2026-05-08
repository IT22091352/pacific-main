// ============================================================
//  Wander Lanka Tours – Reviews Module
//  Modern Marquee Design | No Owl Carousel dependency
// ============================================================

const REVIEW_API_URL = (!window.location.hostname ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://ceylon-sang-tour-backend.vercel.app/api';

document.addEventListener('DOMContentLoaded', function () {
    initReviews();
    window.addEventListener('auth:login', checkReviewFormAuth);
    window.addEventListener('auth:logout', checkReviewFormAuth);
});

// ── Initialise ────────────────────────────────────────────────
function initReviews() {
    checkReviewFormAuth();
    loadReviews();

    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }

    // Handle deep-link edit (e.g. from card on index page → contact page)
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editReviewId');
    if (editId) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => editReview(editId), 600);
    }
}

// ── Auth token helpers ────────────────────────────────────────
function getFeedbackToken() {
    let token = localStorage.getItem('feedbackToken');
    if (!token) {
        token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem('feedbackToken', token);
    }
    return token;
}

// ── Review Form Auth Gate ─────────────────────────────────────
function checkReviewFormAuth() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    const submitBtn   = document.getElementById('reviewSubmitBtn');
    const nameInput   = document.getElementById('review-name');
    const emailInput  = document.getElementById('review-email');
    const countryInput = document.getElementById('review-country');
    const tourInput   = document.getElementById('review-tour');
    const msgInput    = document.getElementById('review-message') || document.getElementById('review-text');
    const messageDiv  = document.getElementById('reviewMessage');
    const stars       = document.querySelectorAll('input[name="rating"]');

    if (!token) {
        // Not logged in – disable form
        if (messageDiv) {
            messageDiv.style.display = 'flex';
            messageDiv.className = 'review-auth-alert';
            messageDiv.innerHTML = `
                <i class="fa fa-lock"></i>
                <span>Please <a href="javascript:void(0)" onclick="openModal('loginModal')">login</a> to leave a review.</span>
            `;
        }

        [nameInput, emailInput, countryInput, tourInput, msgInput].forEach(el => {
            if (el) {
                el.value = '';
                el.disabled = true;
                el.placeholder = 'Login required';
            }
        });
        stars.forEach(s => s.disabled = true);

        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa fa-lock"></i> Login to Review';
            submitBtn.type = 'button';
            submitBtn.onclick = () => openModal('loginModal');
            submitBtn.className = 'review-submit-btn btn-secondary';
        }
    } else {
        // Logged in – enable form
        if (messageDiv) messageDiv.style.display = 'none';

        if (nameInput)  { nameInput.value  = userName || '';  nameInput.disabled  = true; }
        if (emailInput) { emailInput.value = userEmail || ''; emailInput.disabled = true; }
        if (countryInput) countryInput.disabled = false;
        if (tourInput)    tourInput.disabled    = false;
        if (msgInput)     msgInput.disabled     = false;
        stars.forEach(s => s.disabled = false);

        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Submit Review';
            submitBtn.type = 'submit';
            submitBtn.onclick = null;
            submitBtn.className = 'review-submit-btn';
            submitBtn.disabled = false;
        }
    }
}

// ── Ownership check ───────────────────────────────────────────
function isReviewOwner(review) {
    const userId = localStorage.getItem('userId');
    if (userId && review.user && review.user._id === userId) return true;
    const myGuestReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
    if (!userId && myGuestReviews.includes(review._id)) return true;
    return false;
}

// ── Load Reviews → render marquee ─────────────────────────────
async function loadReviews() {
    const container = document.getElementById('reviews-marquee-container');
    if (!container) return;

    // Skeleton loading state
    container.innerHTML = buildSkeletons();

    try {
        const response = await fetch(`${REVIEW_API_URL}/reviews`);
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Server returned non-JSON: ${text.substring(0, 80)}`);
        }

        const result = await response.json();

        if (result.success && result.data.length > 0) {
            // Deduplicate
            const seen = new Set();
            const reviews = result.data.filter(r => {
                if (seen.has(r._id)) return false;
                seen.add(r._id);
                return true;
            });

            // Store globally for modal access
            window.loadedReviewsMap = new Map(reviews.map(r => [r._id, r]));

            // Update stats
            updateStats(reviews);

            // Build marquee
            renderMarquee(container, reviews);

        } else {
            container.innerHTML = `
                <div class="reviews-empty-state">
                    <i class="fa fa-comments-o"></i>
                    <h4 style="color:rgba(255,255,255,0.6)">No reviews yet</h4>
                    <p>Be the first to share your experience!</p>
                </div>`;
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        container.innerHTML = `
            <div class="reviews-error-state">
                <i class="fa fa-exclamation-triangle"></i>
                <h4 style="color:rgba(255,255,255,0.6)">Could not load reviews</h4>
                <p>${error.message}</p>
                <button onclick="loadReviews()" style="
                    margin-top:12px; background:rgba(249,109,0,0.2);
                    border:1px solid rgba(249,109,0,0.4); color:#f97316;
                    border-radius:8px; padding:8px 20px; cursor:pointer;
                ">Retry</button>
            </div>`;
    }
}

// ── Skeleton placeholders ─────────────────────────────────────
function buildSkeletons() {
    const card = `
        <div class="tcard-skeleton">
            <div class="skeleton-line short" style="margin-bottom:14px;height:10px;"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium" style="margin-bottom:24px;"></div>
            <div style="display:flex;gap:12px;align-items:center;">
                <div class="skeleton-line" style="width:42px;height:42px;border-radius:50%;margin:0;flex-shrink:0;"></div>
                <div style="flex:1;">
                    <div class="skeleton-line short" style="margin-bottom:6px;height:10px;"></div>
                    <div class="skeleton-line" style="width:40%;height:8px;"></div>
                </div>
            </div>
        </div>`;
    return `<div class="marquee-row"><div class="marquee-track" style="animation:none">${card.repeat(4)}</div></div>`;
}

// ── Update stats numbers ──────────────────────────────────────
function updateStats(reviews) {
    const total = reviews.length;
    const avg   = total > 0 ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / total).toFixed(1) : '–';

    const totalEl = document.getElementById('reviews-total-count');
    const avgEl   = document.getElementById('reviews-avg-rating');
    if (totalEl) totalEl.textContent = total + '+';
    if (avgEl)   avgEl.textContent   = avg;
}

// ── Build dual-row marquee (desktop) + mobile slider ─────────
function renderMarquee(container, reviews) {
    const allDoubled = [...reviews, ...reviews, ...reviews, ...reviews];
    const row1Html = allDoubled.map(r => buildCard(r)).join('');
    const row2Html = [...allDoubled].reverse().map(r => buildCard(r)).join('');

    container.innerHTML = `
        <div class="marquee-row">
            <div class="marquee-track">${row1Html}</div>
        </div>
        <div class="marquee-row reverse">
            <div class="marquee-track">${row2Html}</div>
        </div>
    `;

    // Mobile swipe slider injected after the marquee wrapper
    renderMobileSlider(reviews);
}

// ── Build mobile swipe slider ─────────────────────────────────
function renderMobileSlider(reviews) {
    const section = document.getElementById('testimonials');
    if (!section) return;

    const existing = section.querySelector('.testimonials-mobile-slider');
    if (existing) existing.remove();

    const cardsHtml = reviews.map(r => buildCard(r)).join('');
    const dotsHtml  = reviews.map((_, i) =>
        `<button class="tslider-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`
    ).join('');

    const slider = document.createElement('div');
    slider.className = 'testimonials-mobile-slider';
    slider.innerHTML = `
        <div class="tslider-track-wrap" id="tslider-wrap">
            <div class="tslider-track" id="tslider-track">${cardsHtml}</div>
        </div>
        <p class="tslider-hint"><i class="fa fa-hand-o-right"></i> Swipe to explore</p>
        <div class="tslider-dots" id="tslider-dots">${dotsHtml}</div>
        <div class="tslider-arrows">
            <button class="tslider-arrow" id="tslider-prev" aria-label="Previous review">
                <i class="fa fa-chevron-left"></i>
            </button>
            <button class="tslider-arrow" id="tslider-next" aria-label="Next review">
                <i class="fa fa-chevron-right"></i>
            </button>
        </div>
    `;

    const marqueeWrapper = section.querySelector('.testimonials-marquee-wrapper');
    if (marqueeWrapper) {
        marqueeWrapper.insertAdjacentElement('afterend', slider);
    } else {
        section.appendChild(slider);
    }

    const firstCard = slider.querySelector('.tcard');
    if (firstCard) firstCard.classList.add('active-slide');

    initSwiper(slider, reviews.length);
}

// ── Touch / mouse drag swipe engine ──────────────────────────
function initSwiper(slider, total) {
    const wrap  = slider.querySelector('.tslider-track-wrap');
    const track = slider.querySelector('.tslider-track');
    const dots  = slider.querySelectorAll('.tslider-dot');
    const prev  = slider.querySelector('#tslider-prev');
    const next  = slider.querySelector('#tslider-next');

    if (!wrap || !track) return;

    let current    = 0;
    let startX     = 0;
    let startY     = 0;
    let isDragging = false;
    let isHoriz    = null;
    let baseOffset = 0;

    function getCardWidth() {
        const card = track.querySelector('.tcard');
        if (!card) return 0;
        return card.offsetWidth + 16; // 16 = gap
    }

    function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }

    function goTo(index, animate = true) {
        current = clamp(index, 0, total - 1);
        const offset = -(current * getCardWidth());
        if (!animate) track.classList.add('no-transition');
        track.style.transform = `translateX(${offset}px)`;
        if (!animate) requestAnimationFrame(() => track.classList.remove('no-transition'));
        updateDots();
        updateArrows();
        updateActiveCard();
    }

    function updateDots() {
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function updateArrows() {
        if (prev) prev.disabled = current === 0;
        if (next) next.disabled = current === total - 1;
    }

    function updateActiveCard() {
        track.querySelectorAll('.tcard').forEach((c, i) => {
            c.classList.toggle('active-slide', i === current);
        });
    }

    // ── Touch events ──────────────────────────────────────────
    wrap.addEventListener('touchstart', (e) => {
        const t  = e.touches[0];
        startX   = t.clientX;
        startY   = t.clientY;
        isDragging = true;
        isHoriz    = null;
        baseOffset = -(current * getCardWidth());
        track.classList.add('no-transition');
    }, { passive: true });

    wrap.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const t  = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (isHoriz === null) isHoriz = Math.abs(dx) > Math.abs(dy);
        if (!isHoriz) return;
        e.preventDefault();

        const resist   = 0.35;
        const minOff   = -((total - 1) * getCardWidth());
        let rawOffset  = baseOffset + dx;
        if (rawOffset > 0)       rawOffset = rawOffset * resist;
        if (rawOffset < minOff)  rawOffset = minOff + (rawOffset - minOff) * resist;
        track.style.transform = `translateX(${rawOffset}px)`;
    }, { passive: false });

    wrap.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('no-transition');
        if (!isHoriz) return;
        const dx        = e.changedTouches[0].clientX - startX;
        const threshold = getCardWidth() * 0.3;
        if (dx < -threshold && current < total - 1) current++;
        else if (dx > threshold && current > 0)     current--;
        goTo(current);
    }, { passive: true });

    // ── Mouse drag (desktop testing) ──────────────────────────
    wrap.addEventListener('mousedown', (e) => {
        startX     = e.clientX;
        isDragging = true;
        baseOffset = -(current * getCardWidth());
        track.classList.add('no-transition');
        wrap.classList.add('is-dragging');
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx      = e.clientX - startX;
        const resist  = 0.35;
        const minOff  = -((total - 1) * getCardWidth());
        let rawOffset = baseOffset + dx;
        if (rawOffset > 0)       rawOffset = rawOffset * resist;
        if (rawOffset < minOff)  rawOffset = minOff + (rawOffset - minOff) * resist;
        track.style.transform = `translateX(${rawOffset}px)`;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('no-transition');
        wrap.classList.remove('is-dragging');
        const dx        = e.clientX - startX;
        const threshold = getCardWidth() * 0.25;
        if (dx < -threshold && current < total - 1) current++;
        else if (dx > threshold && current > 0)     current--;
        goTo(current);
    });

    // ── Arrow buttons ─────────────────────────────────────────
    if (prev) prev.addEventListener('click', () => { if (current > 0)          goTo(current - 1); });
    if (next) next.addEventListener('click', () => { if (current < total - 1)  goTo(current + 1); });

    // ── Dot clicks ────────────────────────────────────────────
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // ── Keyboard navigation ───────────────────────────────────
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); if (current > 0)          goTo(current - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); if (current < total - 1)  goTo(current + 1); }
    });

    // ── Recalculate on orientation change / resize ────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => goTo(current, false), 120);
    });

    // Initial state
    updateArrows();
    updateDots();
    updateActiveCard();
}

// ── Build a single tcard HTML ─────────────────────────────────
function buildCard(review) {
    const stars      = generateStars(review.rating);
    const initials   = ((review.user ? review.user.name : (review.guestName || 'G')) || 'G').charAt(0).toUpperCase();
    const name       = escapeHtml(review.user ? review.user.name : (review.guestName || 'Anonymous'));
    const country    = review.country ? escapeHtml(review.country) : '';
    const tourLabel  = review.tourPackage ? getTourLabel(review.tourPackage) : '';
    const maxChars   = 130;
    const fullText   = escapeHtml(review.comment || '');

    let displayText  = fullText;
    let readMoreBtn  = '';

    if (fullText.length > maxChars) {
        let sub = fullText.substring(0, maxChars);
        const lastSpace = sub.lastIndexOf(' ');
        if (lastSpace > 0) sub = sub.substring(0, lastSpace);
        displayText = `${sub}…`;
        readMoreBtn = `<button type="button" class="btn-read-more" onclick="event.stopPropagation();window.showFullReview('${review._id}')">Read more</button>`;
    }

    const actionsHtml = isReviewOwner(review) ? `
        <div class="tcard-actions">
            <button class="btn-icon-menu" onclick="event.stopPropagation();openGlobalMenu(event,'${review._id}')" title="Options">
                <i class="fa fa-ellipsis-v"></i>
            </button>
        </div>` : '';

    const metaHtml = [
        country   ? `<span class="tcard-country"><i class="fa fa-map-marker"></i>${country}</span>` : '',
        tourLabel ? `<span class="tcard-package">${tourLabel}</span>` : '',
        (!country && !tourLabel) ? '<span class="tcard-country">International Traveler</span>' : ''
    ].filter(Boolean).join('');

    return `
        <div class="tcard" id="review-${review._id}">
            ${actionsHtml}
            <span class="tcard-quote">"</span>
            <div class="tcard-stars">${stars}</div>
            <p class="tcard-text">${displayText}${readMoreBtn}</p>
            <div class="tcard-user">
                <div class="tcard-avatar">${initials}</div>
                <div class="tcard-info">
                    <h4>${name}</h4>
                    <div class="tcard-meta">${metaHtml}</div>
                </div>
            </div>
        </div>`;
}

// ── Star HTML ─────────────────────────────────────────────────
function generateStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= rating
            ? '<i class="fa fa-star"></i>'
            : '<i class="fa fa-star-o"></i>';
    }
    return html;
}

// ── Full-review modal ─────────────────────────────────────────
window.showFullReview = function (reviewId) {
    if (!window.loadedReviewsMap) { alert('Review data not ready. Please refresh.'); return; }
    const review = window.loadedReviewsMap.get(reviewId);
    if (!review) return;

    const existing = document.getElementById('reviewDetailModal');
    if (existing) existing.remove();

    const stars = generateStars(review.rating);
    const name  = escapeHtml(review.user ? review.user.name : (review.guestName || 'Anonymous'));

    const modal = document.createElement('div');
    modal.id        = 'reviewDetailModal';
    modal.className = 'modal';
    modal.style.cssText = 'display:block;z-index:10000;';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:600px;margin:8% auto;background:#1e293b;border:1px solid rgba(255,255,255,0.1);border-radius:20px;overflow:hidden;">
            <div class="modal-header" style="background:rgba(249,109,0,0.08);border-bottom:1px solid rgba(255,255,255,0.08);padding:24px 28px;display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <h2 style="color:#fff;margin:0 0 4px;font-size:1.3rem;">${name}'s Review</h2>
                    <div style="display:flex;gap:3px;">${stars}</div>
                </div>
                <button class="close-modal" onclick="document.getElementById('reviewDetailModal').remove()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.6);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;">&times;</button>
            </div>
            <div class="modal-body" style="padding:28px;">
                <p style="font-size:1.02rem;line-height:1.85;color:rgba(255,255,255,0.75);margin-bottom:24px;">${escapeHtml(review.comment || '')}</p>
                <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:18px;display:flex;gap:16px;flex-wrap:wrap;">
                    ${review.country ? `<span style="color:rgba(255,255,255,0.45);font-size:0.85rem;"><i class="fa fa-map-marker" style="color:#f97316;margin-right:5px;"></i>${escapeHtml(review.country)}</span>` : ''}
                    ${review.tourPackage ? `<span style="background:rgba(249,109,0,0.12);color:#f97316;border-radius:20px;padding:3px 12px;font-size:0.8rem;font-weight:600;">${getTourLabel(review.tourPackage)}</span>` : ''}
                </div>
            </div>
        </div>`;

    document.body.appendChild(modal);

    requestAnimationFrame(() => modal.classList.add('show'));

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    };
};

// ── Helpers ───────────────────────────────────────────────────
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#039;');
}

function getTourLabel(key) {
    const map = {
        'island-escape':      'Island Escape (10 Days)',
        'cultural-odyssey':   'Cultural Odyssey (7 Days)',
        'cultural':           'Cultural Triangle Explorer',
        'wildlife-adventure': 'Wildlife Adventure (6 Days)',
        'wildlife':           'Wildlife & Nature Adventure',
        'luxury-honeymoon':   'Luxury Honeymoon (8 Days)',
        'beach-wildlife':     'Beach & Wildlife Safari',
        'complete':           'Complete Sri Lanka',
        'hill-country':       'Hill Country & Tea Trails',
        'coastal':            'Coastal Paradise Tour',
        'weekend':            'Weekend Getaway',
        'grand':              'Grand Sri Lanka Tour',
        'custom':             'Custom Tour Package',
    };
    return map[key] || key;
}

// ── Owner dropdown ────────────────────────────────────────────
function openGlobalMenu(event, reviewId) {
    event.stopPropagation();
    closeGlobalMenu();

    const btn  = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id        = 'global-review-menu';
    menu.className = 'global-dropdown-menu';

    menu.style.cssText = `
        position:fixed;
        top:${rect.bottom + 6}px;
        left:${rect.left - 90}px;
        z-index:9999;
        min-width:130px;
        display:flex;
        flex-direction:column;
    `;

    menu.innerHTML = `
        <a href="javascript:void(0)" onclick="editReview('${reviewId}');closeGlobalMenu()">
            <i class="fa fa-pencil"></i> Edit
        </a>
        <a href="javascript:void(0)" onclick="deleteReview('${reviewId}');closeGlobalMenu()">
            <i class="fa fa-trash"></i> Delete
        </a>`;

    document.body.appendChild(menu);
}

function closeGlobalMenu() {
    const menu = document.getElementById('global-review-menu');
    if (menu) menu.remove();
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('#global-review-menu') && !e.target.closest('.btn-icon-menu')) {
        closeGlobalMenu();
    }
});

// ── Edit Review ───────────────────────────────────────────────
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
    const formTitle     = document.getElementById('review-form-title');
    const submitBtn     = document.getElementById('reviewSubmitBtn');
    const editIndicator = document.getElementById('edit-mode-indicator');
    const reviewForm    = document.getElementById('reviewForm');

    if (reviewForm) reviewForm.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const msgInput = document.getElementById('review-message') || document.getElementById('review-text');
    if (msgInput)     msgInput.value = review.comment;

    const pkgInput = document.getElementById('review-package') || document.getElementById('review-tour');
    if (pkgInput)     pkgInput.value = review.tourPackage || '';

    const countryInput = document.getElementById('review-country');
    if (countryInput) countryInput.value = review.country || '';

    const star = document.querySelector(`input[name="rating"][value="${review.rating}"]`);
    if (star) star.checked = true;

    if (review.guestName  && document.getElementById('review-name'))  document.getElementById('review-name').value  = review.guestName;
    if (review.guestEmail && document.getElementById('review-email')) document.getElementById('review-email').value = review.guestEmail;

    if (formTitle)     formTitle.textContent = 'Edit Your Review';
    if (editIndicator) {
        editIndicator.style.display = 'flex';
        editIndicator.className = 'edit-mode-banner';
        editIndicator.innerHTML = '<i class="fa fa-edit"></i><span>You are editing your existing review</span>';
    }

    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa fa-check"></i> Update Review';
        submitBtn.dataset.editingId = review._id;
    }

    if (!document.getElementById('cancelEditBtn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type      = 'button';
        cancelBtn.id        = 'cancelEditBtn';
        cancelBtn.className = 'btn-outline-cancel';
        cancelBtn.innerHTML = '<i class="fa fa-times"></i> Cancel';
        cancelBtn.onclick   = cancelEdit;
        submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
    }
}

function cancelEdit() {
    const form = document.getElementById('reviewForm');
    if (form) form.reset();

    const formTitle = document.getElementById('review-form-title');
    if (formTitle) formTitle.textContent = 'Leave a Review';

    const editIndicator = document.getElementById('edit-mode-indicator');
    if (editIndicator) editIndicator.style.display = 'none';

    const submitBtn = document.getElementById('reviewSubmitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Submit Review';
        delete submitBtn.dataset.editingId;
    }

    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.remove();
}

// ── Submit Review ─────────────────────────────────────────────
async function handleReviewSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('reviewSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting…';

    const formData = {
        rating:      document.querySelector('input[name="rating"]:checked')?.value,
        comment:     (document.getElementById('review-message') || document.getElementById('review-text'))?.value,
        tourPackage: (document.getElementById('review-package') || document.getElementById('review-tour'))?.value,
        country:     document.getElementById('review-country')?.value,
        guestName:   document.getElementById('review-name')?.value,
        guestEmail:  document.getElementById('review-email')?.value,
    };

    if (!formData.rating) {
        showToast('Please select a star rating.', 'warning');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> Submit Review';
        return;
    }

    const feedbackToken = getFeedbackToken();
    const editingId     = submitBtn.dataset.editingId;
    const token         = localStorage.getItem('token');
    const headers       = { 'Content-Type': 'application/json', 'x-feedback-token': feedbackToken };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url    = editingId ? `${REVIEW_API_URL}/reviews/${editingId}` : `${REVIEW_API_URL}/reviews`;
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, { method, headers, body: JSON.stringify(formData) });
        const result   = await response.json();

        if (response.ok) {
            showToast(editingId ? 'Review updated! ✓' : 'Review submitted! ✓', 'success');
            document.getElementById('reviewForm').reset();

            if (!token && result.data?._id) {
                const myReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
                if (!myReviews.includes(result.data._id)) myReviews.push(result.data._id);
                localStorage.setItem('myGuestReviews', JSON.stringify(myReviews));
                localStorage.setItem('guestName',  formData.guestName);
                localStorage.setItem('guestEmail', formData.guestEmail);
            }

            cancelEdit();
            loadReviews();
        } else {
            showToast(result.message || 'Failed to submit review.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Error submitting review.', 'error');
    } finally {
        submitBtn.disabled = false;
        const isEditing = !!submitBtn.dataset.editingId;
        submitBtn.innerHTML = isEditing
            ? '<i class="fa fa-check"></i> Update Review'
            : '<i class="fa fa-paper-plane"></i> Submit Review';
    }
}

// ── Delete Review ─────────────────────────────────────────────
async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    const token   = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', 'x-feedback-token': getFeedbackToken() };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${REVIEW_API_URL}/reviews/${reviewId}`, { method: 'DELETE', headers });
        if (res.ok) {
            showToast('Review deleted.', 'success');
            let myReviews = JSON.parse(localStorage.getItem('myGuestReviews') || '[]');
            myReviews = myReviews.filter(id => id !== reviewId);
            localStorage.setItem('myGuestReviews', JSON.stringify(myReviews));
            loadReviews();
        } else {
            const result = await res.json();
            showToast(result.message || 'Failed to delete.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Error deleting review.', 'error');
    }
}

// ── Toast notification ────────────────────────────────────────
function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.getElementById('wlt-toast');
    if (existing) existing.remove();

    const colors = {
        success: { bg: '#065f46', border: '#10b981', icon: 'fa-check-circle' },
        error:   { bg: '#7f1d1d', border: '#ef4444', icon: 'fa-times-circle' },
        warning: { bg: '#78350f', border: '#f59e0b', icon: 'fa-exclamation-circle' },
    };
    const c = colors[type] || colors.success;

    const toast = document.createElement('div');
    toast.id = 'wlt-toast';
    toast.style.cssText = `
        position:fixed;bottom:28px;right:28px;z-index:99999;
        background:${c.bg};border:1px solid ${c.border};color:#fff;
        border-radius:14px;padding:14px 22px;
        display:flex;align-items:center;gap:12px;
        font-size:0.92rem;font-weight:600;
        box-shadow:0 12px 40px rgba(0,0,0,0.4);
        transform:translateY(20px);opacity:0;
        transition:transform 0.3s ease,opacity 0.3s ease;
        max-width:320px;
    `;
    toast.innerHTML = `<i class="fa ${c.icon}" style="font-size:1.1rem;"></i>${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity   = '1';
    });

    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity   = '0';
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}
