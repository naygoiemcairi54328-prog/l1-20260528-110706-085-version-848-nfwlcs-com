(() => {
  const currentScript = document.currentScript;
  const hlsModuleUrl = currentScript ? new URL("hls-vendor-dru42stk.js", currentScript.src).href : "./assets/hls-vendor-dru42stk.js";
  let HlsConstructor = window.Hls || null;

  const loadHls = async () => {
    if (HlsConstructor) {
      return HlsConstructor;
    }

    try {
      const module = await import(hlsModuleUrl);
      HlsConstructor = module.H;
      return HlsConstructor;
    } catch (error) {
      return window.Hls || null;
    }
  };

  const startPlayer = async (root) => {
    if (!root || root.dataset.ready === "true") {
      const video = root ? root.querySelector("video") : null;
      if (video) {
        video.play().catch(() => {});
      }
      return;
    }

    const video = root.querySelector("video");
    const overlay = root.querySelector("[data-player-start]");
    const url = root.getAttribute("data-video");

    if (!video || !url) {
      return;
    }

    root.dataset.ready = "true";
    video.controls = true;

    const play = () => {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.play().catch(() => {});
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", play, { once: true });
      video.load();
      play();
      return;
    }

    const Hls = await loadHls();

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, play);
      video.addEventListener("click", play);
      return;
    }

    video.src = url;
    video.addEventListener("loadedmetadata", play, { once: true });
    video.load();
    play();
  };

  document.querySelectorAll("[data-player]").forEach((root) => {
    const overlay = root.querySelector("[data-player-start]");
    const video = root.querySelector("video");

    if (overlay) {
      overlay.addEventListener("click", () => startPlayer(root));
    }

    if (video) {
      video.addEventListener("click", () => startPlayer(root));
    }
  });
})();
