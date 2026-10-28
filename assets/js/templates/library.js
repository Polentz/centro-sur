const libraryAccordion = () => {
    const rows = document.querySelectorAll(".library-row");
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!rows.length) return;

    const panelOf = (row) => document.getElementById(row.getAttribute("aria-controls"));

    const setOpen = (row, open) => {
        row.setAttribute("aria-expanded", String(open));
        panelOf(row)?.classList.toggle("is-open", open);
    };

    const reveal = (panel) => {
        if (!panel || calmMotion || !window.gsap) return;

        const paths = panel.querySelectorAll([
            "path", "line", "circle", "rect", "polyline", "polygon", "ellipse"
        ].map((shape) => `.library-gallery svg ${shape}`).join(", "));
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

    if (!calmMotion && window.gsap && window.ScrollTrigger) {
        const targets = document.querySelectorAll(".library-heading, .library-item");
        gsap.set(targets, { autoAlpha: 0, y: 40 });

        const revealIn = (els) => gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            stagger: 0.08,
            clearProps: "transform"
        });

        const heading = document.querySelector(".library-heading");
        if (heading) revealIn(heading);

        ScrollTrigger.batch(".library-item", {
            once: true,
            onEnter: revealIn
        });
    }

    rows.forEach((row) => {
        row.addEventListener("click", () => {
            const opening = row.getAttribute("aria-expanded") !== "true";

            // One title open at a time
            rows.forEach((other) => setOpen(other, other === row && opening));

            // if (opening) {
            //     reveal(panelOf(row));
            //     window.scrollTo({ top: 0, behavior: calmMotion ? "auto" : "smooth" });
            // }
            if (opening) reveal(panelOf(row));
        });
    });
};

const libraryGallery = () => {
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".library-illustration").forEach((wrapper) => {
        const gallery = wrapper.querySelector(".library-gallery");
        const arrows = wrapper.querySelectorAll(".library-gallery-arrow");
        if (!gallery || !arrows.length) return;

        const maxScroll = () => gallery.scrollWidth - gallery.clientWidth;

        // Dim an arrow when there is nothing more to see on its side
        const update = () => {
            const end = maxScroll();
            arrows.forEach((arrow) => {
                const forward = arrow.dataset.direction === "1";
                arrow.disabled = forward ? gallery.scrollLeft >= end - 1 : gallery.scrollLeft <= 1;
            });
        };

        // Go to the start of the previous or next image
        const step = (direction) => {
            const slides = [...gallery.children];
            const current = gallery.scrollLeft;
            const offsets = slides.map((slide) => slide.offsetLeft);
            const target = direction > 0
                ? offsets.find((left) => left > current + 1)
                : offsets.reverse().find((left) => left < current - 1);

            gallery.scrollTo({
                left: Math.min(target ?? (direction > 0 ? maxScroll() : 0), maxScroll()),
                behavior: calmMotion ? "auto" : "smooth"
            });
        };

        arrows.forEach((arrow) => {
            arrow.addEventListener("click", () => step(Number(arrow.dataset.direction)));
        });

        // Turn vertical wheel/trackpad scrolling over the gallery into horizontal scrolling.
        // Once the gallery reaches either end, the page scrolls as usual.
        gallery.addEventListener("wheel", (event) => {
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

            const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
            const atStart = gallery.scrollLeft <= 1;
            const atEnd = gallery.scrollLeft >= maxScroll() - 1;
            if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

            event.preventDefault();
            gallery.scrollLeft += delta;
        }, { passive: false });

        gallery.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        update();
    });
};

libraryAccordion();
libraryGallery();
