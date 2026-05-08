// Mobile Video Autoplay Fix - Robust Version with Bandwidth Saving
document.addEventListener('DOMContentLoaded', function () {
    const heroVideo = document.getElementById('hero-video');
    const videoSource = heroVideo ? heroVideo.querySelector('source') : null;

    // Helper: Check if mobile
    const isMobile = window.innerWidth < 768;

    if (heroVideo && videoSource && !isMobile) {
        // Desktop: Load and Play Video
        console.log('Desktop detected. Loading hero video...');

        // Swap data-src to src
        if (videoSource.dataset.src) {
            videoSource.src = videoSource.dataset.src;
            heroVideo.load();
        }

        heroVideo.muted = true;
        heroVideo.setAttribute('muted', '');
        heroVideo.setAttribute('playsinline', '');
        heroVideo.setAttribute('webkit-playsinline', '');

        const attemptPlay = async () => {
            try {
                await heroVideo.play();
                heroVideo.classList.add('video-playing');
            } catch (error) {
                console.log('Autoplay prevented. Waiting for interaction.', error);
            }
        };

        attemptPlay();

        // Interaction fallback
        const onInteraction = () => {
            if (heroVideo.paused) {
                attemptPlay();
                ['touchstart', 'click', 'scroll'].forEach(evt =>
                    document.removeEventListener(evt, onInteraction)
                );
            }
        };

        document.addEventListener('click', onInteraction, { passive: true });
        document.addEventListener('scroll', onInteraction, { passive: true, once: true });

    } else if (heroVideo && isMobile) {
        // Mobile: Do NOT load video. Rely on poster/fallback image.
        console.log('Mobile detected. Skipping video load to save bandwidth.');
        // Ensure fallback shows
        const fallback = document.querySelector('.hero-video-fallback');
        if (fallback) fallback.style.display = 'block';
    }
});
