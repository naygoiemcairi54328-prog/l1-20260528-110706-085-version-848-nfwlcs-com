(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-menu-toggle]");

    if (header && toggle) {
        toggle.addEventListener("click", function () {
            header.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
        var active = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === active);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === active);
            });
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                show(idx);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(active + 1);
            }, 5200);
        }
    });

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters(container) {
        var area = container.closest("section") || document;
        var searchInput = area.querySelector("[data-page-search]");
        var yearSelect = area.querySelector("[data-year-filter]");
        var regionSelect = area.querySelector("[data-region-filter]");
        var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
        var empty = area.querySelector("[data-empty-result]");
        var query = normalize(searchInput ? searchInput.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var cardRegion = normalize(card.getAttribute("data-region"));
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            if (region && cardRegion !== region) {
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

    document.querySelectorAll("[data-filter-container]").forEach(function (container) {
        var area = container.closest("section") || document;
        var inputs = area.querySelectorAll("[data-page-search], [data-year-filter], [data-region-filter]");

        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                applyFilters(container);
            });
            input.addEventListener("change", function () {
                applyFilters(container);
            });
        });

        applyFilters(container);
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
        document.querySelectorAll("[data-auto-query]").forEach(function (input) {
            input.value = query;
            var section = input.closest("section");
            var container = section ? section.querySelector("[data-filter-container]") : null;
            if (container) {
                applyFilters(container);
            }
        });
    }

    function playVideo(player) {
        var video = player.querySelector("video");
        var stream = player.getAttribute("data-stream");
        var cover = player.querySelector(".play-cover");

        if (!video || !stream) {
            return;
        }

        player.classList.add("is-playing");

        if (!player.__ready) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                player.__ready = true;
                video.play().catch(function () {});
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(stream);
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    player.__ready = true;
                    video.play().catch(function () {});
                });
                player.__hls = hls;
            } else {
                video.src = stream;
                player.__ready = true;
                video.play().catch(function () {});
            }
        } else {
            video.play().catch(function () {});
        }

        if (cover) {
            cover.setAttribute("aria-hidden", "true");
        }
    }

    document.querySelectorAll(".video-player").forEach(function (player) {
        var cover = player.querySelector(".play-cover");
        if (cover) {
            cover.addEventListener("click", function () {
                playVideo(player);
            });
        }
    });
})();
