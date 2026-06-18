function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var cover = document.getElementById('player-cover');
    var shell = document.getElementById('player-shell');
    var hls = null;
    var ready = false;

    if (!video || !cover || !shell || !streamUrl) {
        return;
    }

    function bindStream() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function(event, data) {
                if (data && data.fatal && hls) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
        } else {
            video.src = streamUrl;
        }
    }

    function start() {
        bindStream();
        cover.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function() {
                cover.classList.remove('is-hidden');
            });
        }
    }

    cover.addEventListener('click', start);
    shell.addEventListener('click', function(event) {
        if (event.target === video && !ready) {
            start();
        }
    });
    video.addEventListener('play', function() {
        cover.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function() {
        if (hls) {
            hls.destroy();
        }
    });
}
