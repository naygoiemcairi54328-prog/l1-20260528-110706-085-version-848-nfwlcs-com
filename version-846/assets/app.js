(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', () => {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const previous = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const showSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const startTimer = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(current + 1), 5200);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener('click', () => {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    const normalize = (value) => String(value || '').toLowerCase().trim();
    const grid = document.querySelector('[data-card-grid]');
    const searchInput = document.querySelector('[data-card-search]');
    const sortSelect = document.querySelector('[data-sort-select]');
    const viewButtons = Array.from(document.querySelectorAll('[data-view-button]'));

    const getCards = () => grid ? Array.from(grid.querySelectorAll('[data-movie-card]')) : [];

    const filterCards = () => {
        if (!grid || !searchInput) {
            return;
        }

        const value = normalize(searchInput.value);
        let visible = 0;

        getCards().forEach((card) => {
            const text = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags
            ].join(' '));
            const isVisible = !value || text.includes(value);
            card.hidden = !isVisible;
            if (isVisible) {
                visible += 1;
            }
        });

        let empty = grid.querySelector('[data-empty-state]');
        if (!visible) {
            if (!empty) {
                empty = document.createElement('div');
                empty.className = 'no-results';
                empty.dataset.emptyState = 'true';
                empty.textContent = '没有找到匹配影片';
                grid.appendChild(empty);
            }
        } else if (empty) {
            empty.remove();
        }
    };

    const sortCards = () => {
        if (!grid || !sortSelect) {
            return;
        }

        const cards = getCards();
        const mode = sortSelect.value;
        const sorted = cards.sort((a, b) => {
            const yearA = Number.parseInt(a.dataset.year, 10) || 0;
            const yearB = Number.parseInt(b.dataset.year, 10) || 0;
            const titleA = a.dataset.title || '';
            const titleB = b.dataset.title || '';

            if (mode === 'year-desc') {
                return yearB - yearA;
            }

            if (mode === 'year-asc') {
                return yearA - yearB;
            }

            if (mode === 'title-asc') {
                return titleA.localeCompare(titleB, 'zh-Hans-CN');
            }

            return 0;
        });

        sorted.forEach((card) => grid.appendChild(card));
        filterCards();
    };

    if (searchInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener('input', filterCards);
        filterCards();
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
    }

    if (grid && viewButtons.length) {
        viewButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const mode = button.dataset.viewButton;
                grid.classList.toggle('is-list-view', mode === 'list');
                viewButtons.forEach((item) => item.classList.toggle('is-active', item === button));
            });
        });
        viewButtons[0].classList.add('is-active');
    }

    document.querySelectorAll('[data-player]').forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        const source = video.dataset.streamUrl;
        let ready = false;
        let hls = null;

        const prepareVideo = () => {
            if (ready || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            ready = true;
        };

        const playVideo = () => {
            prepareVideo();
            player.classList.add('is-playing');
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    player.classList.remove('is-playing');
                });
            }
        };

        button.addEventListener('click', playVideo);

        video.addEventListener('play', () => {
            player.classList.add('is-playing');
        });

        video.addEventListener('pause', () => {
            player.classList.remove('is-playing');
        });

        video.addEventListener('ended', () => {
            player.classList.remove('is-playing');
        });

        video.addEventListener('click', () => {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', () => {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
