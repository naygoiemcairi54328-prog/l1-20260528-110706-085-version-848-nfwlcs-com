(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var playlist = options.playlist;
    var loaded = false;

    if (!video || !cover || !playlist) {
      return;
    }

    function loadHlsClass() {
      if (window.Hls && window.Hls.isSupported()) {
        return Promise.resolve(window.Hls);
      }
      if (typeof import === 'function') {
        return import('./assets/hls-dru42stk.js').then(function (module) {
          return module.H;
        }).catch(function () {
          return null;
        });
      }
      return Promise.resolve(null);
    }

    function attachSource() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playlist;
        return Promise.resolve();
      }

      return loadHlsClass().then(function (HlsClass) {
        if (HlsClass && HlsClass.isSupported()) {
          var hls = new HlsClass({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(playlist);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = playlist;
        }
      });
    }

    function playMovie() {
      cover.classList.add('is-hidden');
      attachSource().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      });
    }

    cover.addEventListener('click', playMovie);
    video.addEventListener('click', function () {
      if (video.paused) {
        playMovie();
      }
    });
  };
})();
