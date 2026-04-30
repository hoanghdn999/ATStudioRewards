document.addEventListener('DOMContentLoaded', () => {
    const entryScreen = document.getElementById('entry-screen');
    const loader = document.getElementById('loader');
    const video = document.getElementById('main-video');

    // Parse URL parameters to determine which video to play
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');

    const videoFiles = {
        '1': 'Tra.mp4',
        '2': 'Tra bonus.mp4',
        '3': 'Cafe.mp4',
        '4': 'Cafe bonus.mp4',
        '5': 'Freeze.mp4',
        '6': 'Freeze bonus.mp4'
    };

    // Default to video 1 if no specific video is requested
    const selectedVideo = videoFiles[videoId] || videoFiles['1'];

    video.src = selectedVideo;
    entryScreen.classList.add('active');

    video.isLooping = false;
    video.loop = false; // Disable native loop so we can do our morph loop

    // Show video when ready
    video.addEventListener('canplaythrough', () => {
        video.classList.add('ready');
    }, { once: true });

    if (video.readyState > 3) {
        video.classList.add('ready');
    }

    // Smooth Morph Loop Logic
    video.addEventListener('timeupdate', () => {
        if (!video.duration) return;

        // Trigger 600ms before the end to prevent the native pause at the end
        const triggerTime = video.duration - 0.6;
        const seekBackTime = Math.max(0, video.duration - 3);

        if (video.currentTime >= triggerTime && !video.isLooping) {
            video.isLooping = true;
            video.classList.add('morph');

            // Wait 250ms for morph to start, then seek
            setTimeout(() => {
                video.currentTime = seekBackTime;
                video.play().catch(e => console.error(e)); // Ensure it continues playing

                // Wait a moment before easing out the morph
                setTimeout(() => {
                    video.classList.remove('morph');
                    setTimeout(() => {
                        video.isLooping = false;
                    }, 400); // Cool-down before next loop can trigger
                }, 150);
            }, 250);
        }
    });

    // Handle Unmuted Autoplay Policy
    entryScreen.addEventListener('click', () => {
        entryScreen.classList.remove('active');
        loader.classList.add('active');

        // iOS requires play() to be called synchronously in the click handler
        video.muted = false;
        video.classList.add('ready'); // Ensure visibility

        video.play().then(() => {
            loader.classList.remove('active');
        }).catch(e => {
            console.error('Play failed:', e);
            loader.classList.remove('active');
        });
    });

    // Handle buffering states using native events
    video.addEventListener('waiting', () => {
        loader.classList.add('active');
    });

    video.addEventListener('playing', () => {
        loader.classList.remove('active');
    });
});
