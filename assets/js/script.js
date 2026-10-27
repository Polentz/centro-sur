gsap.registerPlugin(ScrollTrigger, ScrollSmoother, MorphSVGPlugin, DrawSVGPlugin);

const documentHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty("--doc-height", `${window.innerHeight}px`);
};

const searchTool = () => {
    const opener = document.querySelector(".search-label");
    const elements = document.querySelectorAll(".search-input, .search-reset");
    const input = document.querySelector(".search-input");
    const wrapper = document.querySelector(".search-wrapper");
    const close = document.querySelector(".search-reset");
    const searchLocation = "?q=";

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

documentHeight();

window.addEventListener("load", () => {
    history.scrollRestoration = "manual";
    documentHeight();
    searchTool();
});

window.addEventListener("resize", () => {
    documentHeight();
});

/* ---------- Scroll behaviour: parallax, snapping, reveals ---------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sections = gsap.utils.toArray(".section");

const sectionScroll = (index) => gsap.utils.clamp(
    0,
    ScrollTrigger.maxScroll(window),
    sections[index].offsetTop + sections[index].offsetHeight / 2 - window.innerHeight / 2
);

// Section snapping suits short pages only: opt in with data-snap on .main
const snapToSections = sections.length > 0 && document.querySelector(".main[data-snap]") !== null;

// Pages without the smooth-scroll wrapper (e.g. the Library, which needs
// position: sticky) skip smoothing, parallax and reveals
const hasSmoothWrapper = document.querySelector("#smooth-wrapper") !== null;

if (!reduceMotion && hasSmoothWrapper) {
    const DRAW_DURATION = 3;
    const MOBILE_LOGO_SPEED = 1.25;

    const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,
        effects: false,
        smoothTouch: 0.1
    });

    gsap.matchMedia().add("(min-width: 801px)", () => {
        // Snap to the nearest section once scrolling stops
        if (snapToSections) {
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
        }

        // Parallax effect for elements with data-speed attribute
        const effects = smoother.effects("[data-speed]", {});

        return () => {
            effects.forEach((effect) => effect.kill());
            gsap.set("[data-speed]", { clearProps: "transform" });
        };
    });

    // Parallax effect for elements with data-speed attribute
    gsap.matchMedia().add("(max-width: 800px)", () => {
        const effects = smoother.effects("[data-speed]", { speed: MOBILE_LOGO_SPEED });

        return () => {
            effects.forEach((effect) => effect.kill());
            gsap.set("[data-speed]", { clearProps: "transform" });
        };
    });

    // Reveal text and logos on scroll.
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

    gsap.utils.toArray(".section-text p").forEach((el) => {
        gsap.from(el, {
            autoAlpha: 0,
            y: 40,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: revealOnScroll(el)
        });
    });

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

    // JPEG/PNG/WebP illustrations can't be drawn, so they only fade and rise.
    // They wait until their top reaches IMAGE_REVEAL_START of the viewport
    // (instead of the bottom edge), so the reveal starts a bit later.
    const IMAGE_REVEAL_START = "top 70%";

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

/* ---------- Header emblem: continuous morph ---------- */

const emblem = document.querySelector(".header svg");
const EMBLEM_IDS = ["one", "two", "three", "four", "five", "six", "seven", "eight"];

if (emblem) {
    const EMBLEM_MORPH = 2;
    const EMBLEM_HOLD = 0.5;

    const groups = EMBLEM_IDS.map((id) => emblem.querySelector(`#emblem-${id}`));

    if (groups.every(Boolean)) {
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
};

const languageMenu = document.querySelector(".menu");
const pageFooter = document.querySelector("footer.footer");

// Keep the menu above the footer. It reads the footer's live position every
// frame, so it follows smoothly when the page height changes (e.g. the
// Library accordion opening) instead of jumping after a recalculation.
if (languageMenu && pageFooter && getComputedStyle(pageFooter).position !== "fixed") {
    gsap.matchMedia().add("(min-width: 801px)", () => {
        const setY = gsap.quickSetter(languageMenu, "y", "px");
        let lastY = null;

        const followFooter = () => {
            const overlap = window.innerHeight - pageFooter.getBoundingClientRect().top;
            const y = -gsap.utils.clamp(0, pageFooter.offsetHeight, overlap);
            if (y !== lastY) setY(lastY = y);
        };

        followFooter();
        gsap.ticker.add(followFooter);

        return () => {
            gsap.ticker.remove(followFooter);
            gsap.set(languageMenu, { clearProps: "transform" });
        };
    });
};
