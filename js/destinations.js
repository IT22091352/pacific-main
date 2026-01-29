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

    // 2. Destination Modal Logic

    // Open Modal
    $(document).on('click', '.destination-detail', function (e) {
        e.preventDefault();

        // Fetch Data from Hidden Container
        var popupData = $(this).find('.destination-popup-data');

        if (popupData.length > 0) {
            // Get content from hidden divs
            var overview = popupData.find('.popup-overview').html();
            var attractions = popupData.find('.popup-attractions').html(); // Expects <li> items
            var activities = popupData.find('.popup-activities').html(); // Expects <li> items
            var info = popupData.find('.popup-info').html(); // Expects formatted rows

            // Get Card Data for Header
            var title = $(this).find('h2').text();
            var category = $(this).attr('data-category');
            var bgImage = $(this).find('.destination-detail-img').css('background-image');
            // Clean up url("...") to just path
            bgImage = bgImage.replace(/^url\(['"](.+)['"]\)/, '$1');

            // Construct Modal Body HTML
            var modalHtml = `
                <div class="popup-header">
                    <img src="${bgImage}" class="popup-header-img" alt="${title}">
                    <div class="popup-header-overlay">
                        <span class="popup-category">${category}</span>
                        <h2>${title}</h2>
                    </div>
                </div>
                
                <div class="popup-content-grid">
                    <div class="popup-main-col">
                        <div class="popup-section">
                            <h3>Overview</h3>
                            ${overview ? overview : '<p>Experience the beauty of this amazing destination.</p>'}
                        </div>
                        
                        <div class="popup-section">
                            <h3>Attractions</h3>
                            <ul class="attraction-list">
                                ${attractions ? attractions : '<li class="attraction-item">Scenic Views</li><li class="attraction-item">Historical Sites</li>'}
                            </ul>
                        </div>
                        
                        <div class="popup-section">
                            <h3>Activities</h3>
                            <ul class="activity-list">
                                ${activities ? activities : '<li class="activity-item">Photography</li><li class="activity-item">Sightseeing</li>'}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="popup-side-col">
                        <div class="popup-info-box">
                            <h3>Practical Info</h3>
                            ${info ? info : `
                                <div class="info-row"><i class="fa fa-clock-o"></i><div><strong>Duration</strong><span>1 Day</span></div></div>
                                <div class="info-row"><i class="fa fa-sun-o"></i><div><strong>Best Time</strong><span>Year Round</span></div></div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            // Inject Content
            $('#destinationModal .modal-body').html(modalHtml);

            // Show Modal
            $('#destinationModal').addClass('show').css('display', 'block');
            $('body').css('overflow', 'hidden'); // Prevent scrolling
        } else {
            console.log('No detailed data found for this destination.');
        }
    });

    // Close Modal
    $('.close-modal').click(function () {
        $('#destinationModal').removeClass('show');
        setTimeout(function () {
            $('#destinationModal').css('display', 'none');
            $('body').css('overflow', 'auto'); // Enable scrolling
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
