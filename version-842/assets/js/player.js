import { H as Hls } from './hls-dru42stk.js';

function setStatus(container, message) {
    const status = container.querySelector('[data-player-status]');

    if (status) {
        status.textContent = message;
    }
}

function initPlayer(container) {
    const video = container.querySelector('video[data-src]');
    const button = container.querySelector('.player-play-button');

    if (!video || !button) {
        return;
    }

    const source = video.dataset.src;
    let hls = null;
    let hasLoaded = false;

    function playVideo() {
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setStatus(container, '浏览器阻止了自动播放，请再次点击播放器开始播放。');
                button.hidden = false;
                container.classList.remove('is-playing');
            });
        }
    }

    function loadSource() {
        if (!source) {
            setStatus(container, '当前影片未配置播放源。');
            return;
        }

        button.hidden = true;
        container.classList.add('is-playing');
        setStatus(container, '正在载入播放源…');

        if (hasLoaded) {
            playVideo();
            return;
        }

        hasLoaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
            setStatus(container, '已使用浏览器原生 HLS 播放。');
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus(container, '播放源已就绪。');
                playVideo();
            });

            hls.on(Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }

                setStatus(container, '播放源载入异常，请刷新页面后重试。');

                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });

            return;
        }

        video.src = source;
        video.load();
        playVideo();
        setStatus(container, '当前浏览器不支持 HLS.js，已尝试直接播放。');
    }

    button.addEventListener('click', loadSource);

    video.addEventListener('click', function () {
        if (!hasLoaded || video.paused) {
            loadSource();
        }
    });

    video.addEventListener('play', function () {
        button.hidden = true;
        container.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.hidden = false;
            container.classList.remove('is-playing');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

Array.from(document.querySelectorAll('[data-player]')).forEach(initPlayer);
