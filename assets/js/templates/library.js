/* ---------- Library: show the hovered or focused title in the preview ---------- */

(() => {
    const rows = document.querySelectorAll(".library-row");
    const previews = document.querySelectorAll(".library-preview-item");
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!rows.length || !previews.length) return;

    const activate = (id) => {
        let shown = null;

        rows.forEach((row) => row.classList.toggle("is-active", row.dataset.item === id));
        previews.forEach((preview) => {
            const match = preview.dataset.item === id;
            if (match && !preview.classList.contains("is-active")) shown = preview;
            preview.classList.toggle("is-active", match);
        });

        if (!shown || calmMotion || !window.gsap) return;

        // SVG: redraw the lines, like the logo reveal
        const paths = shown.querySelectorAll("svg path, svg line, svg circle, svg rect, svg polyline, svg polygon, svg ellipse");
        if (paths.length && window.DrawSVGPlugin) {
            gsap.killTweensOf(paths);
            gsap.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, ease: "power1.inOut" });
        }

        // JPEG/PNG/WebP: a short fade
        const img = shown.querySelector("img");
        if (img) {
            gsap.killTweensOf(img);
            gsap.fromTo(img, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power1.out" });
        }
    };

    rows.forEach((row) => {
        row.addEventListener("mouseenter", () => activate(row.dataset.item));
        row.addEventListener("focus", () => activate(row.dataset.item));
    });
})();
