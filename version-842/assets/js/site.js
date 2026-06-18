(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let currentIndex = 0;
        let timer = null;

        function showSlide(index) {
            currentIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === currentIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === currentIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(currentIndex + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    const searchInputs = Array.from(document.querySelectorAll('[data-site-search]'));
    const yearFilters = Array.from(document.querySelectorAll('[data-year-filter]'));
    const categoryFilters = Array.from(document.querySelectorAll('[data-category-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function getSearchQuery() {
        const activeInput = searchInputs.find(function (input) {
            return input.value.trim() !== '';
        });
        return activeInput ? normalize(activeInput.value) : '';
    }

    function getYearValue() {
        const filter = yearFilters.find(function (select) {
            return select.value !== '';
        });
        return filter ? filter.value : '';
    }

    function getCategoryValue() {
        const filter = categoryFilters.find(function (select) {
            return select.value !== '';
        });
        return filter ? filter.value : '';
    }

    function applyFilters() {
        if (cards.length === 0) {
            return;
        }

        const query = getSearchQuery();
        const year = getYearValue();
        const category = getCategoryValue();
        let visibleCount = 0;

        cards.forEach(function (card) {
            const text = normalize(card.dataset.text || card.textContent);
            const cardYear = card.dataset.year || '';
            const cardCategory = card.dataset.category || '';
            const matchesQuery = query === '' || text.includes(query);
            const matchesYear = year === '' || cardYear === year;
            const matchesCategory = category === '' || cardCategory === category;
            const shouldShow = matchesQuery && matchesYear && matchesCategory;

            card.classList.toggle('is-hidden', !shouldShow);

            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    function syncSearchInputs(sourceInput) {
        searchInputs.forEach(function (input) {
            if (input !== sourceInput) {
                input.value = sourceInput.value;
            }
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            syncSearchInputs(input);
            applyFilters();
        });
    });

    yearFilters.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });

    categoryFilters.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });

    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get('q');

    if (queryFromUrl && searchInputs.length > 0) {
        searchInputs.forEach(function (input) {
            input.value = queryFromUrl;
        });
        applyFilters();
    }
})();
