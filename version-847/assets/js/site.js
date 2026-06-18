(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = $all('[data-hero-slide]');
    var dots = $all('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    var prev = $('[data-hero-prev]');
    var next = $('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
    var hero = $('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
  }

  function setupSearch() {
    var form = $('[data-filter-form]');
    if (!form) {
      return;
    }
    var query = $('[data-filter-query]', form);
    var region = $('[data-filter-region]', form);
    var type = $('[data-filter-type]', form);
    var year = $('[data-filter-year]', form);
    var cards = $all('[data-card]');
    var empty = $('[data-empty-state]');
    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }
    function apply() {
      var q = normalize(query && query.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var tags = normalize(card.getAttribute('data-tags'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var pass = true;
        if (q && title.indexOf(q) === -1 && tags.indexOf(q) === -1) {
          pass = false;
        }
        if (r && cardRegion !== r) {
          pass = false;
        }
        if (t && cardType !== t) {
          pass = false;
        }
        if (y && cardYear !== y) {
          pass = false;
        }
        card.classList.toggle('hidden-card', !pass);
        if (pass) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    [query, region, type, year].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupPlayer() {
    var shell = $('[data-player-shell]');
    var video = $('[data-player-video]');
    var button = $('[data-player-button]');
    var errorBox = $('[data-player-error]');
    if (!shell || !video || !button) {
      return;
    }
    var source = video.getAttribute('data-source');
    var hls = null;
    var initialized = false;
    function setError(message) {
      if (!errorBox) {
        return;
      }
      errorBox.textContent = message;
      errorBox.classList.add('is-visible');
    }
    function clearError() {
      if (errorBox) {
        errorBox.textContent = '';
        errorBox.classList.remove('is-visible');
      }
    }
    function attachSource() {
      if (initialized) {
        return;
      }
      initialized = true;
      clearError();
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setError('视频加载失败，正在重新连接。');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setError('视频解析异常，正在恢复播放。');
              hls.recoverMediaError();
            } else {
              setError('视频暂时无法播放。');
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setError('当前浏览器不支持该播放格式。');
      }
    }
    function playVideo() {
      attachSource();
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          setError('请再次点击播放器开始播放。');
        });
      }
    }
    button.addEventListener('click', function () {
      shell.classList.add('is-ready');
      playVideo();
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      clearError();
      shell.classList.add('is-ready');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayer();
  });
})();
