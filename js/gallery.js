// Gallery Filter Functionality
$(document).ready(function () {
    // Filter buttons
    $('.filter-btn').click(function () {
        var filterValue = $(this).attr('data-filter');

        // Update active button
        $('.filter-btn').removeClass('active btn-primary').addClass('btn-outline-primary');
        $(this).removeClass('btn-outline-primary').addClass('btn-primary active');

        // Filter gallery items
        if (filterValue === 'all') {
            $('.gallery-item').fadeIn(300);
        } else {
            $('.gallery-item').each(function () {
                if ($(this).attr('data-category') === filterValue) {
                    $(this).fadeIn(300);
                } else {
                    $(this).fadeOut(300);
                }
            });
        }
    });

    // Initialize Magnific Popup for gallery images
    $('.gallery-item').magnificPopup({
        delegate: 'img',
        type: 'image',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1]
        },
        image: {
            titleSrc: function (item) {
                return item.el.next('.gallery-overlay').find('.gallery-caption').text();
            }
        }
    });

    // Photo upload preview
    $('#photo').change(function () {
        var files = $(this)[0].files;
        if (files.length > 10) {
            alert('You can only upload a maximum of 10 photos at once.');
            $(this).val('');
            return;
        }

        for (var i = 0; i < files.length; i++) {
            if (files[i].size > 5242880) { // 5MB in bytes
                alert('Each photo must be less than 5MB. Please choose smaller files.');
                $(this).val('');
                return;
            }
        }
    });
});
