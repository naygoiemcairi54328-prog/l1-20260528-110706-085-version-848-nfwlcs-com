(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var button = document.querySelector(".nav-toggle");
        var links = document.querySelector(".nav-links");
        if (!button || !links) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = links.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var area = document.querySelector("[data-filter-area]");
        if (!panel || !area) {
            return;
        }
        var input = panel.querySelector("[data-search-input]");
        var year = panel.querySelector("[data-year-filter]");
        var region = panel.querySelector("[data-region-filter]");
        var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input && initial) {
            input.value = initial;
        }
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var regionValue = region ? region.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var matched = true;
                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }
                if (regionValue && cardRegion !== regionValue) {
                    matched = false;
                }
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [input, year, region].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener("input", apply);
            element.addEventListener("change", apply);
        });
        var form = panel.querySelector("form");
        if (form && area) {
            form.addEventListener("submit", function (event) {
                if (window.location.pathname.split("/").pop() === "search.html") {
                    event.preventDefault();
                    apply();
                }
            });
        }
        apply();
    }

    window.initPlayer = function (source) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("player-start");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;
        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }
        function play() {
            load();
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
        load();
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
