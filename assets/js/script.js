gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
gsap.registerPlugin(MorphSVGPlugin);

const documentHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty("--doc-height", `${window.innerHeight}px`);
};

// Set the section height before any ScrollTrigger measures the page.
// Waiting for "load" is too late: triggers would be built on zero-height sections.
documentHeight();

window.addEventListener("load", () => {
    history.scrollRestoration = "manual";
    documentHeight();
});

window.addEventListener("resize", () => {
    documentHeight();
});

/* ---------- Parallax ---------- */

// ScrollSmoother reads data-speed on the section layers: 0.7 moves slower than
// the scroll (back), 1.3 faster than the scroll (front). Each layer lines up
// with its CSS position when it's in the middle of the screen. People who ask
// their system for less motion get a normal, static page.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,        // seconds for the page to catch up with the scroll
        effects: true,    // enables data-speed
        smoothTouch: 0.1  // light smoothing on touch screens
    });
}

/* ---------- Fade in ---------- */

// Logo and text fade in (with a small rise) as they come into view, and fade
// back out if you scroll back up past them, so they replay next time.
// The tweens go on the svg and the p, not on .section-logo / .section-text:
// those carry data-speed, and ScrollSmoother owns their transform.
if (!reduceMotion) {
    gsap.utils.toArray(".section-logo svg, .section-text p").forEach((el) => {
        gsap.from(el, {
            autoAlpha: 0,
            y: 40,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%", // when the element's top is 85% of the way down the screen
                toggleActions: "play none none reverse"
            }
        });
    });
}

/* ---------- Header emblem: continuous morph ---------- */

// The emblem has eight variants, #emblem-one ... #emblem-eight. Each is a
// group of two paths: the border first, then the figure. The border changes
// slightly between variants too, so both morph: one border path and one
// figure path cycle through all eight variants in sync.
const emblem = document.querySelector(".header svg");
const EMBLEM_IDS = ["one", "two", "three", "four", "five", "six", "seven", "eight"];

if (emblem) {
    const EMBLEM_MORPH = 2;   // seconds per morph
    const EMBLEM_HOLD = 0.5;  // pause on each variant; 0 = continuous

    const groups = EMBLEM_IDS.map((id) => emblem.querySelector(`#emblem-${id}`));

    if (groups.every(Boolean)) {
        // Path data for each variant: [border, figure].
        const shapes = groups.map((group) =>
            [...group.querySelectorAll("path")].map((path) => path.getAttribute("d"))
        );

        gsap.set(groups, { display: "none" });

        // The two paths that actually animate, starting on variant one.
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

        // one -> two -> ... -> eight -> back to one, then repeat.
        shapes.forEach((_, i) => {
            const next = shapes[(i + 1) % shapes.length];
            emblemTimeline
                .to(border, { morphSVG: emblemOptions(next[0]) }, `+=${EMBLEM_HOLD}`)
                .to(figure, { morphSVG: emblemOptions(next[1]) }, "<");
        });
    }
}
