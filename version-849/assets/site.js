(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    document.querySelectorAll('img[data-cover]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-off');
      });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('.search-panel').forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var root = panel.parentElement;
      var list = root ? root.querySelector('[data-card-list]') : document;
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-item')) : [];
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
      var empty = panel.querySelector('[data-empty-state]');
      var activeFilter = 'all';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var shown = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          var okQuery = !query || text.indexOf(query) !== -1;
          var okFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
          var visible = okQuery && okFilter;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          activeFilter = chip.getAttribute('data-filter') || 'all';
          apply();
        });
      });
      apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var play = player.querySelector('[data-play]');
      var stream = player.getAttribute('data-stream');
      var hls = null;
      var loaded = false;

      function attach() {
        if (!video || !stream || loaded) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function start() {
        attach();
        player.classList.add('is-playing');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      if (play) {
        play.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded || video.paused) {
            start();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  });
})();
