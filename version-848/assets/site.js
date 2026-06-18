(function() {
    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            dots.forEach(function(dot, idx) {
                dot.classList.toggle('is-active', idx === current);
            });
        }

        function schedule() {
            clearInterval(timer);
            timer = setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                schedule();
            });
        }

        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                schedule();
            });
        }

        dots.forEach(function(dot, idx) {
            dot.addEventListener('click', function() {
                show(idx);
                schedule();
            });
        });

        show(0);
        schedule();
    }

    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    var pageFilter = document.querySelector('[data-page-filter]');
    var filterList = document.querySelector('[data-filter-list]');
    if (pageFilter && filterList) {
        pageFilter.addEventListener('input', function() {
            var term = pageFilter.value.trim().toLowerCase();
            var items = filterList.querySelectorAll('[data-keywords]');
            items.forEach(function(item) {
                var words = item.getAttribute('data-keywords').toLowerCase();
                item.classList.toggle('is-filter-hidden', term && words.indexOf(term) === -1);
            });
        });
    }

    var index = typeof MOVIE_INDEX !== 'undefined' ? MOVIE_INDEX : [];
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var pageBase = getPageBase();

    searchInputs.forEach(function(input) {
        var panel = input.parentElement.querySelector('[data-search-panel]');
        if (!panel) {
            return;
        }

        function closeLater() {
            setTimeout(function() {
                panel.classList.remove('is-open');
            }, 160);
        }

        function render() {
            var term = input.value.trim().toLowerCase();
            if (!term) {
                panel.innerHTML = '';
                panel.classList.remove('is-open');
                return;
            }
            var matches = index.filter(function(item) {
                return item.keywords.toLowerCase().indexOf(term) !== -1;
            }).slice(0, 9);

            if (!matches.length) {
                panel.innerHTML = '<div class="search-empty">未找到匹配内容</div>';
                panel.classList.add('is-open');
                return;
            }

            panel.innerHTML = matches.map(function(item) {
                var href = pageBase + item.url;
                var cover = pageBase + item.cover.replace(/^\.\//, '');
                return '<a class="search-item" href="' + href + '">' +
                    '<img src="' + cover + '" alt="' + escapeHtml(item.title) + '">' +
                    '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></span>' +
                    '</a>';
            }).join('');
            panel.classList.add('is-open');
        }

        input.addEventListener('input', render);
        input.addEventListener('focus', render);
        input.addEventListener('blur', closeLater);
    });

    function getPageBase() {
        var path = window.location.pathname.replace(/\\/g, '/');
        if (path.indexOf('/movies/') !== -1 || path.indexOf('/category/') !== -1) {
            return '../';
        }
        return '';
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
