gsap.registerPlugin(ScrollTrigger, ScrollSmoother, MorphSVGPlugin, DrawSVGPlugin);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const documentHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty("--doc-height", `${window.innerHeight}px`);
};

const scrollEffects = () => {
    // Pages without the smooth-scroll wrapper (e.g. the Library, which needs
    // position: sticky) skip smoothing, parallax and reveals
    const hasSmoothWrapper = document.querySelector("#smooth-wrapper") !== null;
    if (reduceMotion || !hasSmoothWrapper) return;

    const DRAW_DURATION = 3;
    const MOBILE_LOGO_SPEED = 1.25;

    // JPEG/PNG/WebP illustrations wait until their top reaches this point of
    // the viewport (instead of the bottom edge), so the reveal starts a bit later.
    const IMAGE_REVEAL_START = "top 70%";

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
                scrollTrigger: {
                    ...revealLogoOnScroll(img),
                    start: IMAGE_REVEAL_START
                }
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
    const opener = document.querySelector(".search-label");
    const elements = document.querySelectorAll(".search-input, .search-reset");
    const input = document.querySelector(".search-input");
    const wrapper = document.querySelector(".search-wrapper");
    const close = document.querySelector(".search-reset");
    const searchLocation = "?q=";

    if (!opener || !input || !wrapper || !close) return;

    const addClasses = () => {
        gsap.set(elements, {
            opacity: 0,
        });
        elements.forEach(el => {
            el.classList.add("visible");
        });
        gsap.to(elements, {
            opacity: 1,
            duration: 0.5,
            ease: "power1.out",
        });
    };

    const removeClasses = () => {
        gsap.to(elements, {
            opacity: 0,
            duration: 0.5,
            ease: "power1.out",
            onComplete: () => {
                elements.forEach(el => {
                    el.classList.remove("visible");
                });
                opener.classList.remove("hidden");
            },
        });
    };

    input.addEventListener("focus", () => {
        input.value = "";
    });

    if (window.location.href.includes(searchLocation)) {
        addClasses();
    };

    const nullMessage = document.querySelector(".search-null");
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
        if (window.location.href.includes(searchLocation)) return;
        if (wrapper.contains(e.target)) return;
        removeClasses();
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) return;
            if (!input.classList.contains("visible")) return;
            if (window.location.href.includes(searchLocation)) return;
            removeClasses();
        });
    });
    observer.observe(wrapper);
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
        }

        const img = panel.querySelector("img");
        if (img) {
            gsap.killTweensOf(img);
            gsap.fromTo(img, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay: 0.2, ease: "power1.out" });
        }
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

        const heading = document.querySelector(".index-heading");
        if (heading) revealIn(heading);

        ScrollTrigger.batch(".index-item", {
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

const gallery = () => {
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 801px)");
    const animate = !calmMotion && !!window.gsap;
    // const ease = "power2.inOut";

    document.querySelectorAll(".index-panel-illustration").forEach((wrapper) => {
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

        gallery.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        desktop.addEventListener("change", reset);
        panel?.addEventListener("index:reset", reset);
        update();
    });
};

history.scrollRestoration = "manual";

documentHeight();
scrollEffects();
headerEmblem();
languageMenu();
searchTool();
accordion();
gallery();

window.addEventListener("resize", documentHeight);
