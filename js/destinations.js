// Destinations Filter Functionality & Modal Logic
$(document).ready(function () {
    // 1. Filter Logic (Existing + Flex Fix)
    $('.filter-btn').click(function () {
        var filterValue = $(this).attr('data-filter');

        // Update active button
        $('.filter-btn').removeClass('active btn-primary').addClass('btn-outline-primary');
        $(this).removeClass('btn-outline-primary').addClass('btn-primary active');

        // Filter destination items
        if (filterValue === 'all') {
            $('.destination-detail').each(function () {
                if ($(this).css('display') === 'none') {
                    $(this).css({
                        'display': 'flex',
                        'opacity': 0
                    }).animate({ 'opacity': 1 }, 300);
                }
            });
        } else {
            $('.destination-detail').each(function () {
                var category = $(this).attr('data-category');
                if (category === filterValue) {
                    if ($(this).css('display') === 'none') {
                        $(this).css({
                            'display': 'flex',
                            'opacity': 0
                        }).animate({ 'opacity': 1 }, 300);
                    }
                } else {
                    $(this).fadeOut(300, function () {
                        $(this).css('display', 'none');
                    });
                }
            });
        }
    });

    // Ensure all items are visible on load
    $('.destination-detail').css('display', 'flex');

    // ---------------------------------------------------------
    // 3. Dynamic Sticky Navbar Logic
    // ---------------------------------------------------------

    const mainNavbar = document.getElementById('navbar');
    const filterBar = document.querySelector('.sticky-filter-bar');

    if (mainNavbar && filterBar) {

        // Function to update sticky position
        function updateStickyPosition() {
            // Get height of main navbar
            const navbarHeight = mainNavbar.offsetHeight;
            // Get current top offset (computed style to account for CSS top: 20px)
            const navbarTop = parseInt(window.getComputedStyle(mainNavbar).top) || 0;

            // Calculate total top spacing needed
            const totalSpacing = navbarHeight + navbarTop + 10; // +10px buffer

            // Apply to filter bar
            filterBar.style.top = `${totalSpacing}px`;
        }

        // Initial Calculation
        updateStickyPosition();

        // Update on Resize
        window.addEventListener('resize', updateStickyPosition);

        // Optional: Add shadow when sticky
        // We use IntersectionObserver to detect when it hits the "sticky" state
        // Trick: Add a sentinel element -1px above current position

        const observer = new IntersectionObserver(
            ([e]) => e.target.classList.toggle('is-pinned', e.intersectionRatio < 1),
            { threshold: [1] }
        );

        // Check if browser supports sticky before observing
        if (getComputedStyle(filterBar).position === 'sticky') {
            // To properly detect "stuck" state via Observers is complex without a sentinel
            // Simpler approach: Check scroll position
            window.addEventListener('scroll', () => {
                const rect = filterBar.getBoundingClientRect();
                // If the bar's top position matches the calculated sticky top
                const stickyTop = parseInt(filterBar.style.top);

                // Allow small tolerance (pixels)
                if (rect.top <= stickyTop + 1) {
                    filterBar.classList.add('is-pinned');
                } else {
                    filterBar.classList.remove('is-pinned');
                }
            });
        }
    }

    // 2. Destination Modal Logic (Premium Tabbed Version)

    // Open Modal
    $(document).on('click', '.destination-detail', function (e) {
        e.preventDefault();

        // Fetch Data from Hidden Container
        var popupData = $(this).find('.destination-popup-data');

        if (popupData.length > 0) {
            // Get content from hidden divs
            var overview = popupData.find('.popup-overview').html();
            var attractions = popupData.find('.popup-attractions').html();
            var activities = popupData.find('.popup-activities').html();
            var info = popupData.find('.popup-info').html();
            // Gallery Data
            var gallery = popupData.find('.popup-gallery').html();

            // Get Card Data for Header
            var title = $(this).find('h2').text();
            var category = $(this).attr('data-category');
            var bgImage = $(this).find('.destination-detail-img').css('background-image');
            bgImage = bgImage.replace(/^url\(['"](.+)['"]\)/, '$1');

            // Construct Modal Body HTML with Tabs
            var modalHtml = `
                <div class="popup-header">
                    <img src="${bgImage}" class="popup-header-img" alt="${title}">
                    <div class="popup-header-overlay">
                        <span class="popup-category">${category}</span>
                        <h2>${title}</h2>
                    </div>
                </div>
                
                <div class="popup-nav-container">
                    <ul class="popup-tabs">
                        <li class="tab-link active" data-tab="overview">Overview</li>
                        <li class="tab-link" data-tab="attractions">Attractions</li>
                        <li class="tab-link" data-tab="activities">Activities</li>
                        <li class="tab-link" data-tab="gallery">Gallery</li>
                        <li class="tab-link" data-tab="info">Practical Info</li>
                    </ul>
                </div>
                
                <div class="popup-content-grid">
                    <div class="tab-content" style="width: 100%;">
                        
                        <!-- Overview Tab -->
                        <div id="overview" class="tab-pane active">
                            <div class="popup-section">
                                <h3>Overview</h3>
                                ${overview ? overview : '<p>Experience the beauty of this amazing destination.</p>'}
                            </div>
                        </div>

                        <!-- Attractions Tab -->
                        <div id="attractions" class="tab-pane">
                            <div class="popup-section">
                                <h3>Attractions</h3>
                                <ul class="attraction-list">
                                    ${attractions ? attractions : '<li class="attraction-item">Scenic Views</li><li class="attraction-item">Historical Sites</li>'}
                                </ul>
                            </div>
                        </div>

                        <!-- Activities Tab -->
                        <div id="activities" class="tab-pane">
                            <div class="popup-section">
                                <h3>Activities</h3>
                                <ul class="activity-list">
                                    ${activities ? activities : '<li class="activity-item">Photography</li><li class="activity-item">Sightseeing</li>'}
                                </ul>
                            </div>
                        </div>

                        <!-- Gallery Tab -->
                        <div id="gallery" class="tab-pane">
                            <div class="popup-section">
                                <h3>Gallery</h3>
                                <div class="gallery-grid">
                                    ${gallery ? gallery : '<p>No additional images available for this destination.</p>'}
                                </div>
                            </div>
                        </div>

                        <!-- Practical Info Tab -->
                        <div id="info" class="tab-pane">
                            <div class="popup-info-box">
                                <h3>Practical Info</h3>
                                ${info ? info : `
                                    <div class="info-row"><i class="fa fa-clock-o"></i><div><strong>Duration</strong><span>1 Day</span></div></div>
                                    <div class="info-row"><i class="fa fa-sun-o"></i><div><strong>Best Time</strong><span>Year Round</span></div></div>
                                `}
                            </div>
                        </div>

                    </div>
                </div>
            `;

            // Inject Content
            $('#destinationModal .modal-body').html(modalHtml);

            // Re-initialize Magnific Popup for new content if script exists
            if ($.fn.magnificPopup) {
                $('.gallery-grid').magnificPopup({
                    delegate: 'a', // child items selector, by clicking on it popup will open
                    type: 'image',
                    gallery: { enabled: true }
                });
            }

            // Show Modal
            $('#destinationModal').addClass('show').css('display', 'block');
            $('body').css('overflow', 'hidden');
        } else {
            console.log('No detailed data found for this destination.');
        }
    });

    // Tab Switching Logic (Delegate event for dynamic content)
    $(document).on('click', '.tab-link', function () {
        var tabId = $(this).attr('data-tab');

        // Update Tabs
        $('.tab-link').removeClass('active');
        $(this).addClass('active');

        // Update Content
        $('.tab-pane').removeClass('active');
        $('#' + tabId).addClass('active');

        // Optional: Smooth scroll to top of content if needed on mobile
        // $('.modal-content').animate({ scrollTop: 0 }, 300);
    });

    // Close Modal
    $('.close-modal').click(function () {
        $('#destinationModal').removeClass('show');
        setTimeout(function () {
            $('#destinationModal').css('display', 'none');
            $('body').css('overflow', 'auto');
        }, 300);
    });

    // Close on Outside Click
    $(window).click(function (e) {
        if ($(e.target).is('#destinationModal')) {
            $('#destinationModal').removeClass('show');
            setTimeout(function () {
                $('#destinationModal').css('display', 'none');
                $('body').css('overflow', 'auto');
            }, 300);
        }
    });
});
