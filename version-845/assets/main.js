(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var grid = document.querySelector('[data-card-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var keywordInput = document.querySelector('[data-filter-input]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var noResults = document.querySelector('[data-no-results]');

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function filterCards() {
      var keyword = valueOf(keywordInput);
      var region = valueOf(regionSelect);
      var type = valueOf(typeSelect);
      var year = valueOf(yearSelect);
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && card.getAttribute('data-region').toLowerCase() !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type').toLowerCase() !== type) {
          matched = false;
        }
        if (year && card.getAttribute('data-year').toLowerCase() !== year) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', filterCards);
        element.addEventListener('change', filterCards);
      }
    });
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.MOVIE_INDEX) {
    var searchInput = searchPage.querySelector('[data-search-input]');
    var resultBox = searchPage.querySelector('[data-search-results]');
    var searchButton = searchPage.querySelector('.search-box button');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (searchInput) {
      searchInput.value = initial;
    }

    function cardTemplate(item) {
      return [
        '<article class="movie-card compact">',
        '<a class="poster-link" href="./' + item.file + '" aria-label="' + escapeHtml(item.title) + '">',
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-play">▶</span>',
        '</a>',
        '<div class="movie-info">',
        '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
        '<h2><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h2>',
        '<p class="movie-genre">' + escapeHtml(item.genre) + '</p>',
        '<p class="movie-line">' + escapeHtml(item.oneLine) + '</p>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function renderSearch() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var matches = window.MOVIE_INDEX.filter(function (item) {
        if (!query) {
          return true;
        }
        return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(query) !== -1;
      }).slice(0, 120);

      if (!matches.length) {
        resultBox.innerHTML = '<p class="no-results is-visible">没有找到匹配的影片。</p>';
        return;
      }

      resultBox.innerHTML = '<div class="movie-grid">' + matches.map(cardTemplate).join('') + '</div>';
    }

    if (searchInput) {
      searchInput.addEventListener('input', renderSearch);
    }
    if (searchButton) {
      searchButton.addEventListener('click', renderSearch);
    }
    renderSearch();
  }
})();
