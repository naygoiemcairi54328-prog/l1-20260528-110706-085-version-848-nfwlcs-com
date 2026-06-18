(() => {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let index = slides.findIndex((slide) => slide.classList.contains("is-active"));

    if (index < 0) {
      index = 0;
    }

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }
      slides[index].classList.remove("is-active");
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add("is-active");
    };

    if (prev) {
      prev.addEventListener("click", () => show(index - 1));
    }

    if (next) {
      next.addEventListener("click", () => show(index + 1));
    }

    if (slides.length > 1) {
      window.setInterval(() => show(index + 1), 5200);
    }
  });

  const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

  const normalize = (value) => String(value || "").toLowerCase().trim();

  document.querySelectorAll(".site-search").forEach((searchBox) => {
    const input = searchBox.querySelector(".site-search-input");
    const results = searchBox.querySelector(".site-search-results");

    if (!input || !results) {
      return;
    }

    const renderResults = (items) => {
      results.innerHTML = "";

      if (!input.value.trim()) {
        return;
      }

      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "search-empty";
        empty.textContent = "未找到相关影片";
        results.appendChild(empty);
        return;
      }

      items.slice(0, 16).forEach((item) => {
        const link = document.createElement("a");
        link.className = "search-result-row";
        link.href = item.href;

        const image = document.createElement("img");
        image.src = item.cover;
        image.alt = `${item.title}封面`;
        image.loading = "lazy";

        const copy = document.createElement("span");
        const title = document.createElement("strong");
        const meta = document.createElement("small");
        title.textContent = item.title;
        meta.textContent = `${item.year} · ${item.region} · ${item.type}`;
        copy.appendChild(title);
        copy.appendChild(meta);

        link.appendChild(image);
        link.appendChild(copy);
        results.appendChild(link);
      });
    };

    input.addEventListener("input", () => {
      const query = normalize(input.value);
      if (!query) {
        results.innerHTML = "";
        return;
      }

      const found = movies.filter((item) => {
        const haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.category
        ].join(" "));
        return haystack.includes(query);
      });

      renderResults(found);
    });
  });

  document.querySelectorAll("[data-filter-panel]").forEach((panel) => {
    const targetSelector = panel.getAttribute("data-target");
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    const cards = target ? Array.from(target.querySelectorAll("[data-movie-card]")) : [];
    const textInput = panel.querySelector("[data-filter-text]");
    const regionInput = panel.querySelector("[data-filter-region]");
    const typeInput = panel.querySelector("[data-filter-type]");
    const count = panel.querySelector("[data-visible-count]");

    const update = () => {
      const query = normalize(textInput ? textInput.value : "");
      const region = normalize(regionInput ? regionInput.value : "");
      const type = normalize(typeInput ? typeInput.value : "");
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize(card.getAttribute("data-search"));
        const cardRegion = normalize(card.getAttribute("data-region"));
        const cardType = normalize(card.getAttribute("data-type"));
        const matched = (!query || haystack.includes(query)) && (!region || cardRegion === region) && (!type || cardType === type);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    };

    [textInput, regionInput, typeInput].forEach((input) => {
      if (input) {
        input.addEventListener("input", update);
        input.addEventListener("change", update);
      }
    });
  });
})();
