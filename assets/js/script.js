gsap.registerPlugin(ScrollTrigger, ScrollSmoother, MorphSVGPlugin, DrawSVGPlugin);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const documentHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty("--doc-height", `${window.innerHeight}px`);
};

const scrollEffects = () => {
    const hasSmoothWrapper = document.querySelector("#smooth-wrapper") !== null;
    if (reduceMotion || !hasSmoothWrapper) return;

    const DRAW_DURATION = 3;
    const MOBILE_LOGO_SPEED = 1.25;

    // Logos and illustrations wait until their top reaches this point of the
    // viewport (instead of the bottom edge), so the reveal starts a bit later
    // and never plays while the element is barely peeking in.
    const LOGO_REVEAL_START = "top 70%";

    const sections = gsap.utils.toArray(".section");

    const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,
        effects: false,
        smoothTouch: 0.1
    });

    // Snap to the nearest section once scrolling stops.
    // Section snapping suits short pages only: opt in with data-snap on .main
    const sectionSnapping = () => {
        const snapToSections = sections.length > 0 && document.querySelector(".main[data-snap]") !== null;
        if (!snapToSections) return;

        const sectionScroll = (index) => gsap.utils.clamp(
            0,
            ScrollTrigger.maxScroll(window),
            sections[index].offsetTop + sections[index].offsetHeight / 2 - window.innerHeight / 2
        );

        const isTall = (section) => section.offsetHeight > window.innerHeight;

        // Short sections snap to their center; tall ones (e.g. Info) snap to
        // their top or bottom edge, so their first lines are never pushed
        // off screen.
        const sectionPoints = (index) => {
            const section = sections[index];
            if (!isTall(section)) return [sectionScroll(index)];
            return [section.offsetTop, section.offsetTop + section.offsetHeight - window.innerHeight];
        };

        const sectionProgress = (self) => sections.flatMap((_, index) => sectionPoints(index)).map((point) =>
            gsap.utils.normalize(self.start, self.end, gsap.utils.clamp(self.start, self.end, point))
        );

        // Inside a tall section, let the reader scroll freely
        const insideTallSection = (scroll) => sections.some((section) =>
            isTall(section) &&
            scroll >= section.offsetTop &&
            scroll <= section.offsetTop + section.offsetHeight - window.innerHeight
        );

        gsap.matchMedia().add("(min-width: 801px)", () => {
            ScrollTrigger.create({
                trigger: ".main",
                start: "top top",
                end: "bottom bottom",
                snap: {
                    snapTo: (value, self) => {
                        const scroll = self.start + value * (self.end - self.start);
                        if (insideTallSection(scroll)) return value;
                        return gsap.utils.snap(sectionProgress(self), value);
                    },
                    duration: { min: 0.4, max: 0.9 },
                    ease: "power2.inOut"
                }
            });
        });
    };

    // Parallax effect for elements with data-speed attribute
    const parallax = () => {
        const addEffects = (options) => () => {
            const effects = smoother.effects("[data-speed]", options);

            return () => {
                effects.forEach((effect) => effect.kill());
                gsap.set("[data-speed]", { clearProps: "transform" });
            };
        };

        gsap.matchMedia().add("(min-width: 801px)", addEffects({}));
        gsap.matchMedia().add("(max-width: 800px)", addEffects({ speed: MOBILE_LOGO_SPEED }));
    };

    // Text plays once: reversing it made the last contact lines fade out and
    // slide back down whenever the scroll dipped near the end of the page.
    const revealOnScroll = (el) => ({
        trigger: el,
        once: true
    });

    // Logos fade and draw on the way down, and rewind on the way back up.
    const revealLogoOnScroll = (el) => ({
        trigger: el,
        start: LOGO_REVEAL_START,
        toggleActions: "play none none reverse"
    });

    const revealText = () => {
        gsap.utils.toArray(".section-text p").forEach((el) => {
            gsap.from(el, {
                autoAlpha: 0,
                y: 40,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: revealOnScroll(el)
            });
        });
    };

    const revealLogos = () => {
        gsap.utils.toArray(".section-logo svg").forEach((svg) => {
            const path = svg.querySelector("path");

            const reveal = gsap.timeline({ scrollTrigger: revealLogoOnScroll(svg) })
                .from(svg, { autoAlpha: 0, y: 40, duration: 1.2, ease: "power2.out" });

            if (path) {
                reveal.from(path, {
                    drawSVG: "35%",
                    duration: DRAW_DURATION,
                    ease: "power1.inOut"
                }, 0);
            };
        });
    };

    // JPEG/PNG/WebP illustrations can't be drawn, so they only fade and rise.
    const revealImages = () => {
        gsap.utils.toArray(".section-logo img").forEach((img) => {
            gsap.from(img, {
                autoAlpha: 0,
                y: 40,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: revealLogoOnScroll(img)
            });
        });
    };

    sectionSnapping();
    parallax();
    revealText();
    revealLogos();
    revealImages();
};

const headerEmblem = () => {
    const emblem = document.querySelector(".header svg");
    if (!emblem) return;

    const EMBLEM_IDS = ["one", "two", "three", "four", "five", "six", "seven", "eight"];
    const EMBLEM_MORPH = 2;
    const EMBLEM_HOLD = 0.5;

    const groups = EMBLEM_IDS.map((id) => emblem.querySelector(`#emblem-${id}`));
    if (!groups.every(Boolean)) return;

    const shapes = groups.map((group) =>
        [...group.querySelectorAll("path")].map((path) => path.getAttribute("d"))
    );

    gsap.set(groups, { display: "none" });

    const makeLayer = (d) => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        emblem.appendChild(path);
        return path;
    };

    const border = makeLayer(shapes[0][0]);
    const figure = makeLayer(shapes[0][1]);

    const emblemOptions = (shape) => ({
        shape,
        shapeIndex: "auto",
        map: "complexity"
    });

    const emblemTimeline = gsap.timeline({
        repeat: -1,
        defaults: { duration: EMBLEM_MORPH, ease: "power2.inOut" }
    });

    shapes.forEach((_, i) => {
        const next = shapes[(i + 1) % shapes.length];
        emblemTimeline
            .to(border, { morphSVG: emblemOptions(next[0]) }, `+=${EMBLEM_HOLD}`)
            .to(figure, { morphSVG: emblemOptions(next[1]) }, "<");
    });
};

const languageMenu = () => {
    const menu = document.querySelector(".menu");
    const footer = document.querySelector("footer.footer");
    if (!menu || !footer || getComputedStyle(footer).position === "fixed") return;

    gsap.matchMedia().add("(min-width: 801px)", () => {
        const setY = gsap.quickSetter(menu, "y", "px");
        let lastY = null;

        const followFooter = () => {
            const overlap = window.innerHeight - footer.getBoundingClientRect().top;
            const y = -gsap.utils.clamp(0, footer.offsetHeight, overlap);
            if (y !== lastY) setY(lastY = y);
        };

        followFooter();
        gsap.ticker.add(followFooter);

        return () => {
            gsap.ticker.remove(followFooter);
            gsap.set(menu, { clearProps: "transform" });
        };
    });
};

const searchTool = () => {
    document.querySelectorAll(".search-wrapper").forEach((wrapper) => {
        const opener = wrapper.querySelector(".search-label");
        const input = wrapper.querySelector(".search-input");
        const close = wrapper.querySelector(".search-reset");
        const counter = wrapper.closest(".index-heading")?.querySelector(".index-counter");
        const isActive = wrapper.classList.contains("is-active");

        if (!opener || !input || !close) return;

        const addClasses = () => {
            gsap.set(input, {
                opacity: 0,
            });
            input.classList.add("visible");
            counter?.classList.add("hidden");
            gsap.to(input, {
                opacity: 1,
                duration: 0.5,
                ease: "power1.out",
            });
        };

        const removeClasses = () => {
            gsap.to(input, {
                opacity: 0,
                duration: 0.5,
                ease: "power1.out",
                onComplete: () => {
                    input.classList.remove("visible");
                    counter?.classList.remove("hidden");
                },
            });
        };

        input.addEventListener("focus", () => {
            input.value = "";
        });

        if (isActive) {
            addClasses();
            close.classList.add("visible");
        };

        const nullMessage = wrapper.querySelector(".search-null");
        if (input.classList.contains("null")) {
            input.addEventListener("focus", () => {
                input.classList.remove("null");
                if (nullMessage) {
                    gsap.to(nullMessage, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power1.out",
                        onComplete: () => nullMessage.remove(),
                    });
                };
            }, { once: true });
        };

        opener.addEventListener("click", (e) => {
            if (!input.classList.contains("visible")) {
                addClasses();
                input.focus();
                return;
            };
            e.preventDefault();
            if (input.value.trim() !== "") {
                wrapper.requestSubmit();
            } else {
                input.focus();
            };
        });

        close.addEventListener("click", () => {
            removeClasses()
        });

        document.addEventListener("click", (e) => {
            if (!input.classList.contains("visible")) return;
            if (isActive) return;
            if (wrapper.contains(e.target)) return;
            removeClasses();
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) return;
                if (!input.classList.contains("visible")) return;
                if (isActive) return;
                removeClasses();
            });
        });
        observer.observe(wrapper);
    });
};

const accordion = () => {
    const rows = document.querySelectorAll(".index-row");
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!rows.length) return;

    const panelOf = (row) => document.getElementById(row.getAttribute("aria-controls"));

    const setOpen = (row, open) => {
        row.setAttribute("aria-expanded", String(open));
        const panel = panelOf(row);
        panel?.classList.toggle("is-open", open);

        // Closing a title restores its gallery to the initial layout
        if (!open) panel?.dispatchEvent(new CustomEvent("index:reset"));
    };

    const reveal = (panel) => {
        if (!panel || calmMotion || !window.gsap) return;

        const paths = panel.querySelectorAll([
            "path", "line", "circle", "rect", "polyline", "polygon", "ellipse"
        ].map((shape) => `.index-gallery svg ${shape}`).join(", "));
        if (paths.length && window.DrawSVGPlugin) {
            gsap.killTweensOf(paths);
            gsap.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, delay: 0.2, ease: "power1.inOut" });
        };

        const images = panel.querySelectorAll("img");
        if (images.length) {
            gsap.killTweensOf(images);
            gsap.fromTo(images, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, delay: 0.2, ease: "power1.out", stagger: 0.08 });
        };
    };

    if (!calmMotion && window.gsap && window.ScrollTrigger) {
        const targets = document.querySelectorAll(".index-heading, .index-item");
        gsap.set(targets, { autoAlpha: 0, y: 40 });

        const revealIn = (els) => gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            stagger: 0.08,
            clearProps: "transform"
        });

        document.querySelectorAll(".index-heading").forEach((heading) => revealIn(heading));

        ScrollTrigger.batch(".index-item", {
            once: true,
            onEnter: revealIn
        });
    };

    rows.forEach((row) => {
        row.addEventListener("click", (e) => {
            const opening = row.getAttribute("aria-expanded") !== "true";
            const siblings = row.closest(".index-list")?.querySelectorAll(".index-row") ?? rows;
            siblings.forEach((other) => setOpen(other, other === row && opening));
            if (opening) reveal(panelOf(row));
        });
    });
};

const gallery = () => {
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 801px)");
    const animate = !calmMotion && !!window.gsap;
    const containers = document.querySelectorAll(".index-panel-illustration");

    if (!containers.length) return;

    containers.forEach((wrapper) => {
        const gallery = wrapper.querySelector(".index-gallery");
        const inner = wrapper.closest(".index-panel-inner");
        const panel = wrapper.closest(".index-panel");
        const text = inner?.querySelector(".index-panel-text");
        const arrows = wrapper.querySelectorAll(".index-gallery-arrow");
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

        // Grab and drag with the mouse to scroll (touch screens already swipe natively).
        // On release the gallery settles on the nearest image. Dragging only scrolls,
        // in either layout: expanding and restoring the layout stays with the arrows.
        const DRAG_START = 5;
        const SWIPE = 60;
        let drag = null;
        let dragged = false;

        // Galleries with a single image never get here (no arrows), so they keep the default cursor
        gallery.classList.add("is-draggable");

        const nearest = () => {
            const end = maxScroll();
            const offsets = [...gallery.children].map((slide) => Math.min(slide.offsetLeft, end));
            return offsets.reduce((best, left) =>
                Math.abs(left - gallery.scrollLeft) < Math.abs(best - gallery.scrollLeft) ? left : best, 0);
        };

        gallery.addEventListener("pointerdown", (e) => {
            if (e.pointerType !== "mouse" || e.button !== 0 || busy) return;
            if (window.gsap) gsap.killTweensOf(scroll);
            drag = { x: e.clientX, left: gallery.scrollLeft, moved: false };
        });

        gallery.addEventListener("pointermove", (e) => {
            if (!drag) return;
            const dx = e.clientX - drag.x;
            if (!drag.moved) {
                if (Math.abs(dx) < DRAG_START) return;
                drag.moved = true;
                gallery.setPointerCapture(e.pointerId);
                gallery.classList.add("is-dragging");
            }
            gallery.scrollLeft = drag.left - dx;
        });

        const endDrag = (e) => {
            if (!drag) return;
            const { x, left, moved } = drag;
            drag = null;
            gallery.classList.remove("is-dragging");
            if (!moved) return;

            dragged = true;
            const dx = e.clientX - x;
            const direction = dx < 0 ? 1 : -1;
            const swiped = Math.abs(dx) > SWIPE;

            // A short drag that would settle back on the same image moves one image instead
            const target = nearest();
            glide(swiped && Math.abs(target - left) <= 1 ? targetOf(direction) : target);
        };

        window.addEventListener("pointerup", endDrag);
        gallery.addEventListener("pointercancel", endDrag);

        // A drag shouldn't also count as a click, or drag the image out as a file
        gallery.addEventListener("click", (e) => {
            if (!dragged) return;
            dragged = false;
            e.preventDefault();
            e.stopPropagation();
        }, true);
        gallery.addEventListener("pointerdown", () => { dragged = false; });
        gallery.addEventListener("dragstart", (e) => e.preventDefault());

        gallery.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        desktop.addEventListener("change", reset);
        panel?.addEventListener("index:reset", reset);
        update();
    });
};

const sectionGallery = () => {
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !!window.gsap;

    document.querySelectorAll(".section-gallery").forEach((gallery) => {
        const section = gallery.closest(".split-section");
        const images = [...gallery.querySelectorAll("img")];
        if (!section || !images.length) return;

        const others = section.querySelectorAll(".section-logo, .section-text > :not(.section-gallery)");
        const isOpen = () => section.classList.contains("is-gallery-open");
        const close = section.querySelector(".section-gallery-close");
        let busy = false;

        // Images scale out while the rest fades; the layout switches, then images scale back in
        const SCALE = 0.95;

        const morph = (open) => {
            const fromHeight = section.offsetHeight;
            section.classList.toggle("is-gallery-open", open);
            const toHeight = section.offsetHeight;

            const tl = gsap.timeline()
                .fromTo(section,
                    { height: fromHeight },
                    { height: toHeight, duration: 0.5, ease: "power2.inOut", clearProps: "height" }, 0)
                .fromTo(images,
                    { scale: SCALE, autoAlpha: 0 },
                    {
                        scale: 1, autoAlpha: 1, duration: 0.5, ease: "power2.out", stagger: 0.05,
                        clearProps: "transform,opacity,visibility"
                    }, 0.15);

            // On close the logo and text are shown again: fade them in (they are still at opacity 0 here)
            if (!open) {
                tl.fromTo(others,
                    { autoAlpha: 0 },
                    { autoAlpha: 1, duration: 0.5, ease: "power1.out", clearProps: "opacity,visibility" }, 0.15);
            }
            return tl;
        };

        const onKeydown = (e) => {
            if (e.key === "Escape") toggle(false);
        };

        const toggle = async (open) => {
            if (busy || open === isOpen()) return;
            busy = true;
            if (open) document.addEventListener("keydown", onKeydown);
            else document.removeEventListener("keydown", onKeydown);
            // Hidden right away; on open it fades in only once the images are back
            close?.classList.remove("is-visible");
            if (animate) {
                gsap.set(images, { transformOrigin: "50% 50%" });
                await Promise.all([
                    gsap.to(others, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }),
                    gsap.to(images, { scale: SCALE, autoAlpha: 0, duration: 0.3, ease: "power2.in" })
                ]);
                await morph(open);
                gsap.set(others, { clearProps: "opacity,visibility" });
                if (open && close) {
                    close.classList.add("is-visible");
                    await gsap.fromTo(close,
                        { autoAlpha: 0 },
                        { autoAlpha: 1, duration: 0.4, ease: "power1.out", clearProps: "opacity,visibility" });
                }
            } else {
                section.classList.toggle("is-gallery-open", open);
                close?.classList.toggle("is-visible", open);
            }
            busy = false;
        };

        close?.addEventListener("click", () => toggle(false));

        images.forEach((img) => {
            img.addEventListener("click", () => toggle(true));
        });
    });
};

const slideshow = () => {
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".slideshow-frame[data-slideshow]").forEach((frame) => {
        const slides = [...frame.querySelectorAll(".slideshow-slide")];
        const counter = frame.querySelector(".slideshow-current");
        const delay = calmMotion ? 0 : Number(frame.dataset.autoplay) || 0;
        if (slides.length < 2) return;

        let current = 0;
        let timer = null;
        let hovered = false;
        let focused = false;
        let visible = true;

        const draw = (slide) => {
            if (calmMotion || !window.gsap || !window.DrawSVGPlugin) return;
            const shapes = slide.querySelectorAll([
                "path", "line", "circle", "rect", "polyline", "polygon", "ellipse"
            ].map((shape) => `.slideshow-media svg ${shape}`).join(", "));
            if (!shapes.length) return;
            gsap.killTweensOf(shapes);
            gsap.fromTo(shapes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.6, ease: "power1.inOut" });
        };

        const show = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                const active = i === current;
                slide.classList.toggle("is-active", active);
                slide.inert = !active;
            });
            if (counter) counter.textContent = String(current + 1).padStart(2, "0");
            draw(slides[current]);
        };

        const restart = () => {
            clearInterval(timer);
            if (!delay || hovered || focused || !visible) return;
            timer = setInterval(() => show(current + 1), delay);
        };

        const step = (direction) => {
            show(current + direction);
            restart();
        };

        frame.querySelectorAll(".slideshow-arrow").forEach((arrow) => {
            arrow.addEventListener("click", () => step(Number(arrow.dataset.direction)));
        });

        frame.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") step(-1);
            if (e.key === "ArrowRight") step(1);
        });

        // Swipe on touch screens
        let startX = null;
        frame.addEventListener("pointerdown", (e) => {
            if (e.pointerType !== "mouse") startX = e.clientX;
        });
        frame.addEventListener("pointerup", (e) => {
            if (startX === null) return;
            const distance = e.clientX - startX;
            startX = null;
            if (Math.abs(distance) > 50) step(distance < 0 ? 1 : -1);
        });
        frame.addEventListener("pointercancel", () => { startX = null; });

        frame.addEventListener("mouseenter", () => { hovered = true; restart(); });
        frame.addEventListener("mouseleave", () => { hovered = false; restart(); });
        frame.addEventListener("focusin", () => { focused = true; restart(); });
        frame.addEventListener("focusout", (e) => {
            if (frame.contains(e.relatedTarget)) return;
            focused = false;
            restart();
        });

        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            restart();
        }).observe(frame);
    });
};

const slideshowBanner = () => {
    const MARQUEE_SPEED = 60; // px per second

    // sessionStorage can be unavailable (private mode, blocked data): fall back to no memory
    const remember = (key, closed) => {
        try {
            if (closed) sessionStorage.setItem(key, "1");
            else sessionStorage.removeItem(key);
        } catch (e) { /* ignore */ }
    };
    const wasClosed = (key) => {
        try { return sessionStorage.getItem(key) === "1"; } catch (e) { return false; }
    };

    document.querySelectorAll(".slideshow-section").forEach((section, index) => {
        const frame = section.querySelector(".slideshow-frame");
        const close = section.querySelector(".slideshow-close");
        const banner = section.querySelector(".slideshow-banner");
        const open = banner?.querySelector(".slideshow-open");
        if (!frame || !close || !banner || !open) return;

        const key = `slideshow-closed:${location.pathname}:${index}`;

        // Fixed positioning breaks inside the smooth-scroll content, so the banner lives on <body>
        document.body.appendChild(banner);

        const refresh = () => {
            if (window.ScrollTrigger) ScrollTrigger.refresh();
        };

        const animated = !reduceMotion && !!window.gsap;

        const showBanner = (animate) => {
            banner.hidden = false;
            const group = banner.querySelector(".slideshow-banner-group");
            banner.style.setProperty("--marquee-duration", `${Math.max(10, group.offsetWidth / MARQUEE_SPEED)}s`);
            if (animate && animated) {
                gsap.fromTo(banner, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "power2.out", clearProps: "transform" });
            }
        };

        const collapse = (animate = true) => {
            section.style.display = "none";
            showBanner(animate);
            refresh();
        };

        const expand = () => {
            const reveal = () => {
                banner.hidden = true;
                section.style.display = "";
                refresh();
                const smoother = window.ScrollSmoother?.get();
                if (smoother) smoother.scrollTo(section, true, "center center");
                else section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
                if (animated) gsap.fromTo(section, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power1.out", clearProps: "opacity,visibility" });
            };

            remember(key, false);
            if (animated) gsap.to(banner, { yPercent: 100, duration: 0.4, ease: "power2.in", onComplete: () => { reveal(); gsap.set(banner, { clearProps: "transform" }); } });
            else reveal();
        };

        close.addEventListener("click", () => {
            remember(key, true);
            if (!animated) return collapse(false);
            gsap.to(section, { autoAlpha: 0, duration: 0.5, ease: "power1.out", onComplete: () => collapse(true) });
        });

        open.addEventListener("click", expand);

        if (wasClosed(key)) collapse(false);
    });
};

history.scrollRestoration = "manual";

documentHeight();
slideshowBanner();
scrollEffects();
headerEmblem();
languageMenu();
searchTool();
accordion();
gallery();
sectionGallery();
slideshow();

window.addEventListener("resize", documentHeight);
