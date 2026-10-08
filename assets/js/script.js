gsap.registerPlugin(ScrollTrigger, ScrollSmoother, MorphSVGPlugin, DrawSVGPlugin);

const documentHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty("--doc-height", `${window.innerHeight}px`);
};

documentHeight();

window.addEventListener("load", () => {
    history.scrollRestoration = "manual";
    documentHeight();
});

window.addEventListener("resize", () => {
    documentHeight();
});

/* ---------- Scroll behaviour: parallax, snapping, reveals ---------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Where the page has to be scrolled for a section to sit mid-screen.
const sections = gsap.utils.toArray(".section");

const sectionScroll = (index) => gsap.utils.clamp(
    0,
    ScrollTrigger.maxScroll(window),
    sections[index].offsetTop + sections[index].offsetHeight / 2 - window.innerHeight / 2
);

if (!reduceMotion) {
    const DRAW_DURATION = 3; // seconds to draw a whole logo

    // Built once and never rebuilt. Recreating the smoother at a breakpoint
    // resets the scroll to the top and leaves any ScrollTrigger pointing at a
    // dead smoother, which is what made snapping jump around while resizing.
    const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,       // seconds for the page to catch up with the scroll
        effects: false,  // added per breakpoint below
        smoothTouch: 0.1 // light smoothing on touch screens
    });

    gsap.matchMedia().add("(min-width: 801px)", () => {
        const effects = smoother.effects("[data-speed]", {});

        return () => {
            effects.forEach((effect) => effect.kill());
            gsap.set("[data-speed]", { clearProps: "transform" });
        };
    });

    // Snap to the nearest section once scrolling stops.
    const sectionProgress = (self) => sections.map((section, index) =>
        gsap.utils.normalize(self.start, self.end, gsap.utils.clamp(self.start, self.end, sectionScroll(index)))
    );

    ScrollTrigger.create({
        trigger: ".main",
        start: "top top",
        end: "bottom bottom",
        snap: {
            snapTo: (value, self) => gsap.utils.snap(sectionProgress(self), value),
            duration: { min: 0.4, max: 0.9 },
            ease: "power2.inOut"
        }
    });

    const revealOnScroll = (el) => ({
        trigger: el,
        // toggleActions: "play none none reverse"
        once: true
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
        gsap.timeline({ scrollTrigger: revealOnScroll(svg) })
            .from(svg, { autoAlpha: 0, y: 40, duration: 1.2, ease: "power2.out" })
            .from(svg.querySelector(".logo-path"), {
                drawSVG: "35%",
                duration: DRAW_DURATION,
                ease: "power1.inOut"
            }, 0);
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
