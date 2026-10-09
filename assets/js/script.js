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

const sections = gsap.utils.toArray(".section");

const sectionScroll = (index) => gsap.utils.clamp(
    0,
    ScrollTrigger.maxScroll(window),
    sections[index].offsetTop + sections[index].offsetHeight / 2 - window.innerHeight / 2
);

if (!reduceMotion) {
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

    // Reveal text and logos on scroll
    const revealOnScroll = (el) => ({
        trigger: el,
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
        const path = svg.querySelector("path");

        const reveal = gsap.timeline({ scrollTrigger: revealOnScroll(svg) })
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
