(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function createElement(tag, className, text) {
        var element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        if (typeof text === 'string') {
            element.textContent = text;
        }
        return element;
    }

    function initImages() {
        $all('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
                image.setAttribute('aria-hidden', 'true');
            }, { once: true });
        });
    }

    function initMenu() {
        var toggle = $('[data-menu-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initLocalFilters() {
        $all('[data-filter-scope]').forEach(function (scope) {
            var keyword = $('[data-filter-keyword]', scope);
            var region = $('[data-filter-region]', scope);
            var year = $('[data-filter-year]', scope);
            var type = $('[data-filter-type]', scope);
            var empty = $('[data-empty-state]', scope);
            var cards = $all('[data-card]', scope);

            function apply() {
                var q = normalize(keyword && keyword.value);
                var selectedRegion = normalize(region && region.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.category
                    ].join(' '));
                    var matched = true;
                    if (q && haystack.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (selectedRegion && normalize(card.dataset.region) !== selectedRegion) {
                        matched = false;
                    }
                    if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
                        matched = false;
                    }
                    if (selectedType && normalize(card.dataset.type) !== selectedType) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [keyword, region, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initSearchRedirect() {
        $all('[data-global-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = $('[name="q"]', form);
                var root = document.body.dataset.root || './';
                var q = input ? input.value.trim() : '';
                window.location.href = root + 'search.html?q=' + encodeURIComponent(q);
            });
        });
    }

    function movieCard(movie, root) {
        var article = createElement('article', 'movie-card');
        var poster = createElement('a', 'card-poster');
        poster.href = root + movie.url;
        poster.setAttribute('aria-label', '观看 ' + movie.title);

        var img = document.createElement('img');
        img.src = root + movie.cover;
        img.alt = movie.title;
        img.loading = 'lazy';
        img.addEventListener('error', function () {
            img.classList.add('is-missing');
        }, { once: true });
        poster.appendChild(img);
        poster.appendChild(createElement('span', 'poster-badge', movie.year));
        poster.appendChild(createElement('span', 'poster-play', '播放'));

        var body = createElement('div', 'card-body');
        var title = createElement('a', 'card-title', movie.title);
        title.href = root + movie.url;
        var desc = createElement('p', 'card-desc', movie.one_line || movie.summary || '');
        var meta = createElement('div', 'card-meta');
        var category = createElement('a', '', movie.category_name);
        category.href = root + movie.category_url;
        meta.appendChild(category);
        meta.appendChild(createElement('span', '', movie.region));
        body.appendChild(title);
        body.appendChild(desc);
        body.appendChild(meta);

        article.appendChild(poster);
        article.appendChild(body);
        return article;
    }

    function initSearchPage() {
        var page = $('[data-search-page]');
        if (!page || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var input = $('[data-search-input]', page);
        var region = $('[data-search-region]', page);
        var category = $('[data-search-category]', page);
        var year = $('[data-search-year]', page);
        var results = $('[data-search-results]', page);
        var count = $('[data-search-count]', page);
        var empty = $('[data-empty-state]', page);
        var root = document.body.dataset.root || './';
        var params = new URLSearchParams(window.location.search);
        var initialQ = params.get('q') || '';
        if (input) {
            input.value = initialQ;
        }

        function render() {
            var q = normalize(input && input.value);
            var selectedRegion = normalize(region && region.value);
            var selectedCategory = normalize(category && category.value);
            var selectedYear = normalize(year && year.value);
            var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.year,
                    movie.type,
                    movie.genre,
                    movie.category_name,
                    movie.one_line,
                    movie.summary,
                    (movie.tags || []).join(' ')
                ].join(' '));
                if (q && text.indexOf(q) === -1) {
                    return false;
                }
                if (selectedRegion && normalize(movie.region) !== selectedRegion) {
                    return false;
                }
                if (selectedCategory && normalize(movie.category_name) !== selectedCategory) {
                    return false;
                }
                if (selectedYear && normalize(movie.year) !== selectedYear) {
                    return false;
                }
                return true;
            });

            results.innerHTML = '';
            matched.slice(0, 240).forEach(function (movie) {
                results.appendChild(movieCard(movie, root));
            });
            if (count) {
                count.textContent = '找到 ' + matched.length + ' 部影片' + (matched.length > 240 ? '，当前展示前 240 部' : '');
            }
            if (empty) {
                empty.classList.toggle('is-visible', matched.length === 0);
            }
        }

        [input, region, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });
        render();
    }

    function initPlayer() {
        var panel = $('[data-player]');
        if (!panel) {
            return;
        }
        var video = $('video', panel);
        var button = $('[data-play]', panel);
        var message = $('[data-player-message]', panel);
        var source = panel.dataset.src;
        var started = false;
        var hls = null;

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function start() {
            if (!video || !source) {
                setMessage('当前播放源不可用');
                return;
            }
            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放加载遇到问题，请刷新页面或稍后重试');
                        }
                    });
                } else {
                    setMessage('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Firefox 或 Safari');
                    return;
                }
                started = true;
            }
            panel.classList.add('is-playing');
            video.controls = true;
            video.play().catch(function () {
                setMessage('浏览器阻止了自动播放，请再次点击播放按钮');
                panel.classList.remove('is-playing');
            });
        }

        if (button) {
            button.addEventListener('click', start);
        }
        panel.addEventListener('click', function (event) {
            if (event.target === panel || event.target.classList.contains('player-overlay')) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initImages();
        initMenu();
        initHero();
        initLocalFilters();
        initSearchRedirect();
        initSearchPage();
        initPlayer();
    });
})();
