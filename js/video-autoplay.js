// Mobile Video Autoplay Fix
document.addEventListener('DOMContentLoaded', function () {
    const heroVideo = document.getElementById('hero-video');

    if (heroVideo) {
        // Function to play video
        function playVideo() {
            heroVideo.play().catch(function (error) {
                console.log('Video autoplay failed:', error);
                // If autoplay fails, try again on user interaction
                document.addEventListener('touchstart', function () {
                    heroVideo.play();
                }, { once: true });
            });
        }

        // Try to play immediately
        playVideo();

        // Also try when page is fully loaded
        window.addEventListener('load', function () {
            playVideo();
        });

        // For iOS devices - ensure video plays when visible
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        playVideo();
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(heroVideo);
        }

        // Ensure video is muted (required for autoplay on mobile)
        heroVideo.muted = true;
        heroVideo.playsInline = true;
    }
});
