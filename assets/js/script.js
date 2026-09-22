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

/* ---------- Header emblem: continuous morph ---------- */

// Each emblem group (#emblem-one ... #emblem-four) is several paths, and the
// groups don't have the same number of them. MorphSVG morphs one path into one
// path, so each group is flattened into three layers, keeping its stacking
// order: white paths drawn under the black ones, the black ones, and white
// paths drawn over them. (Every group follows that white / black / white
// order.) Three paths then morph through the four groups in sync.
// #border is never touched.
const emblem = document.querySelector(".header svg");
const emblemBorder = document.querySelector("#border");

if (emblem && emblemBorder) {
    const EMBLEM_MORPH = 2; // seconds per morph
    const EMBLEM_HOLD = .5;    // pause on each shape; 0 = continuous

    const groups = ["#emblem-one", "#emblem-two", "#emblem-three", "#emblem-four"]
        .map((id) => emblem.querySelector(id));

    // Split a group into its three layers, as path data strings.
    const splitLayers = (group) => {
        const paths = [...group.querySelectorAll("path")];
        const isWhite = (path) => path.classList.contains("cls-1");
        const firstBlack = paths.findIndex((path) => !isWhite(path));
        const lastBlack = paths.length - 1 - [...paths].reverse().findIndex((path) => !isWhite(path));
        const join = (list) => list.map((path) => path.getAttribute("d")).join(" ");

        // A layer the group doesn't have becomes a tiny square at the centre
        // of its black shape, so there's still something to morph from/to.
        // (It needs a real size: a zero-length path hangs MorphSVG.)
        const box = paths[firstBlack].getBBox();
        const point = `M${box.x + box.width / 2},${box.y + box.height / 2}h0.5v0.5h-0.5z`;

        return {
            under: join(paths.slice(0, firstBlack)) || point,
            black: join(paths.slice(firstBlack, lastBlack + 1)),
            over: join(paths.slice(lastBlack + 1).filter(isWhite)) || point
        };
    };

    // Measure (getBBox) before hiding the groups.
    const shapes = groups.map(splitLayers);
    gsap.set(groups, { display: "none" });

    // The morphing layers go where the groups were: under the border.
    const makeLayer = (d, white) => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        if (white) path.setAttribute("class", "cls-1");
        emblem.insertBefore(path, emblemBorder);
        return path;
    };

    const layers = {
        under: makeLayer(shapes[0].under, true),
        black: makeLayer(shapes[0].black, false),
        over: makeLayer(shapes[0].over, true)
    };

    const emblemOptions = (shape) => ({
        shape,
        shapeIndex: "auto",
        map: "complexity"
    });

    const emblemTimeline = gsap.timeline({
        repeat: -1,
        defaults: { duration: EMBLEM_MORPH, ease: "power2.inOut" }
    });

    // one -> two -> three -> four -> back to one, then repeat.
    [1, 2, 3, 0].forEach((next) => {
        emblemTimeline
            .to(layers.under, { morphSVG: emblemOptions(shapes[next].under) }, `+=${EMBLEM_HOLD}`)
            .to(layers.black, { morphSVG: emblemOptions(shapes[next].black) }, "<")
            .to(layers.over, { morphSVG: emblemOptions(shapes[next].over) }, "<");
    });
}
