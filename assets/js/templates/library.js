/* ---------- Library: open a title's details like an accordion ---------- */

(() => {
    const rows = document.querySelectorAll(".library-row");
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!rows.length) return;

    const panelOf = (row) => document.getElementById(row.getAttribute("aria-controls"));

    const setOpen = (row, open) => {
        row.setAttribute("aria-expanded", String(open));
        panelOf(row)?.classList.toggle("is-open", open);
    };

    // Redraw the SVG lines (or fade in a bitmap) when a panel opens
    const reveal = (panel) => {
        if (!panel || calmMotion || !window.gsap) return;

        const paths = panel.querySelectorAll("svg path, svg line, svg circle, svg rect, svg polyline, svg polygon, svg ellipse");
        if (paths.length && window.DrawSVGPlugin) {
            gsap.killTweensOf(paths);
            gsap.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, delay: 0.2, ease: "power1.inOut" });
        }

        const img = panel.querySelector("img");
        if (img) {
            gsap.killTweensOf(img);
            gsap.fromTo(img, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay: 0.2, ease: "power1.out" });
        }
    };

    rows.forEach((row) => {
        row.addEventListener("click", () => {
            const opening = row.getAttribute("aria-expanded") !== "true";

            // One title open at a time
            rows.forEach((other) => setOpen(other, other === row && opening));

            if (opening) reveal(panelOf(row));
        });
    });

    const list = document.querySelector(".library-list");
    if (list && window.ScrollTrigger && window.ResizeObserver) {
        let timer;
        new ResizeObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(() => ScrollTrigger.refresh(), 100);
        }).observe(list);
    }
})();
