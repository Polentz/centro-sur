const libraryAccordion = () => {
    const rows = document.querySelectorAll(".library-row");
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!rows.length) return;

    const panelOf = (row) => document.getElementById(row.getAttribute("aria-controls"));

    const setOpen = (row, open) => {
        row.setAttribute("aria-expanded", String(open));
        const panel = panelOf(row);
        panel?.classList.toggle("is-open", open);

        // Closing a title restores its gallery to the initial layout
        if (!open) panel?.dispatchEvent(new CustomEvent("library:reset"));
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
    const desktop = window.matchMedia("(min-width: 801px)");
    const animate = !calmMotion && !!window.gsap;
    // const ease = "power2.inOut";

    document.querySelectorAll(".library-panel-illustration").forEach((wrapper) => {
        const gallery = wrapper.querySelector(".library-gallery");
        const inner = wrapper.closest(".library-panel-inner");
        const panel = wrapper.closest(".library-panel");
        const text = inner?.querySelector(".library-panel-text");
        const arrows = wrapper.querySelectorAll(".library-gallery-arrow");
        if (!gallery || !inner || !text || !arrows.length) return;

        let busy = false;
        const scroll = { left: 0 };

        const maxScroll = () => gallery.scrollWidth - gallery.clientWidth;
        const isExpanded = () => inner.classList.contains("is-expanded");

        // Dim an arrow when there is nothing more to see on its side.
        // Exceptions: "next" stays active to expand the gallery (desktop),
        // "previous" stays active on the first image to restore it.
        const update = () => {
            const atStart = gallery.scrollLeft <= 1;
            const atEnd = gallery.scrollLeft >= maxScroll() - 1;
            const canExpand = desktop.matches && !isExpanded();
            arrows.forEach((arrow) => {
                arrow.disabled = arrow.dataset.direction === "1"
                    ? atEnd && !canExpand
                    : atStart && !isExpanded();
            });
        };

        // Switch layout, then animate the gallery from its old size and place to the new ones
        const morph = (expanded) => {
            const from = wrapper.getBoundingClientRect();
            const fromHeight = inner.offsetHeight;

            inner.classList.toggle("is-expanded", expanded);
            const to = wrapper.getBoundingClientRect();
            const toHeight = inner.offsetHeight;

            return gsap.timeline({ defaults: { duration: 0.5, ease: "power2.inOut" } })
                .fromTo(wrapper,
                    { x: from.left - to.left, width: from.width },
                    { x: 0, width: to.width, clearProps: "transform,width" }, 0)
                .fromTo(inner,
                    { height: fromHeight },
                    { height: toHeight, clearProps: "height" }, 0);
        };

        const expand = async () => {
            busy = true;
            if (animate) {
                await gsap.to(text, { autoAlpha: 0, duration: 0.3, ease: "power1.out" });
                await morph(true);
            } else {
                inner.classList.add("is-expanded");
            }
            busy = false;
            update();
        };

        // Back to the initial layout, showing the first image
        const restore = async () => {
            busy = true;
            if (animate) {
                await glide(0);
                gsap.set(text, { autoAlpha: 0 });
                await morph(false);
                await gsap.to(text, {
                    autoAlpha: 1,
                    duration: 0.3,
                    ease: "power1.out",
                    clearProps: "opacity,visibility"
                });
            } else {
                inner.classList.remove("is-expanded");
                gallery.scrollLeft = 0;
            }
            busy = false;
            update();
        };

        // Instant reset, used when the title closes or the screen becomes mobile
        const reset = () => {
            if (window.gsap) {
                gsap.killTweensOf([wrapper, inner, text, gallery, scroll]);
                gsap.set([wrapper, inner, text, gallery], { clearProps: "all" });
            }
            inner.classList.remove("is-expanded");
            gallery.scrollLeft = 0;
            busy = false;
            update();
        };

        // Start of the previous or next image
        const targetOf = (direction) => {
            const end = maxScroll();
            const current = gallery.scrollLeft;
            const offsets = [...gallery.children].map((slide) => slide.offsetLeft);
            const target = direction > 0
                ? offsets.find((left) => left > current + 1)
                : offsets.reverse().find((left) => left < current - 1);
            return Math.min(target ?? (direction > 0 ? end : 0), end);
        };

        // All arrow scrolling goes through one GSAP tween, so two scroll animations
        // never run at the same time (native smooth scroll + GSAP made the image jump)
        const glide = (left) => {
            if (window.gsap) gsap.killTweensOf(scroll);
            if (!animate) {
                gallery.scrollLeft = left;
                return Promise.resolve();
            }
            scroll.left = gallery.scrollLeft;
            return gsap.to(scroll, {
                left,
                duration: 0.6,
                ease: "power2.out",
                onUpdate: () => { gallery.scrollLeft = scroll.left; }
            });
        };

        const scrollToTarget = (direction) => glide(targetOf(direction));

        const step = async (direction) => {
            if (busy) return;
            if (direction > 0 && !isExpanded() && desktop.matches) return expand();
            if (direction < 0 && isExpanded() && targetOf(direction) <= 0) return restore();
            scrollToTarget(direction);
        };

        arrows.forEach((arrow) => {
            arrow.addEventListener("click", () => step(Number(arrow.dataset.direction)));
        });

        gallery.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        desktop.addEventListener("change", reset);
        panel?.addEventListener("library:reset", reset);
        update();
    });
};

libraryAccordion();
libraryGallery();
