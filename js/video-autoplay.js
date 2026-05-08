// Mobile Video Autoplay Fix - Robust Version
document.addEventListener('DOMContentLoaded', function () {
    const heroVideo = document.getElementById('hero-video');

    if (heroVideo) {
        // 1. Enforce critical mobile attributes immediately
        console.log('Initializing hero video...');
        heroVideo.muted = true;
        heroVideo.setAttribute('muted', '');
        heroVideo.setAttribute('playsinline', '');
        heroVideo.setAttribute('webkit-playsinline', '');
        
        // 2. Define Play Function
        const attemptPlay = async () => {
            try {
                await heroVideo.play();
                console.log('Video playing successfully');
                heroVideo.classList.add('video-playing');
            } catch (error) {
                console.log('Autoplay prevented. Waiting for interaction.', error);
            }
        };

        // 3. Try immediately
        attemptPlay();

        // 4. Fallback: Unlock on any interaction (common mobile pattern)
        const onInteraction = () => {
            attemptPlay();
            // Clean up listeners if playing
            if (!heroVideo.paused) {
                ['touchstart', 'click', 'scroll'].forEach(evt => 
                    document.removeEventListener(evt, onInteraction)
                );
            }
        };

        // Add passive listeners for better performance
        document.addEventListener('touchstart', onInteraction, { passive: true });
        document.addEventListener('click', onInteraction, { passive: true });
        document.addEventListener('scroll', onInteraction, { passive: true, once: true });
        
        // 5. Visibility Check (Re-play if tab becomes active/visible)
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && heroVideo.paused) {
                        attemptPlay();
                    }
                });
            }, { threshold: 0.1 }); // Low threshold for early triggering
            observer.observe(heroVideo);
        }
    }
});
