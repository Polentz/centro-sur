gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(MorphSVGPlugin);

const documentHeight = () => {
    const doc = document.documentElement;
    doc.style.setProperty("--doc-height", `${window.innerHeight}px`);
};

window.addEventListener("load", () => {
    history.scrollRestoration = "manual";
    documentHeight();
});

window.addEventListener("resize", () => {
    documentHeight();
});

const logoMorpher = document.querySelector("#one");

if (logoMorpher) {
    const shapeOne = logoMorpher.getAttribute("d");

    // The in-between state: a flat rule across the middle of the viewBox
    // (0 0 1134 917). Raw path data, so no extra markup is needed.
    // const LINE = "M2,458L1132,458";
    const LINE = "M62,458L1072,458";
    // Tune the rhythm here.
    const HOLD = 1.2;      // how long each glyph sits still
    const COLLAPSE = 1.2;  // glyph -> line
    const FLASH = 0.01;    // how long the line is held: "very very short"
    const EXPAND = 1.2;    // line -> next glyph

    gsap.set(["#two", "#three", "#four"], { display: "none" });

    const morphOptions = (shape) => ({
        shape,
        shapeIndex: "auto", // let MorphSVG pick the point mapping
        map: "complexity"   // match subpaths by detail, not bounding-box size
    });

    // Starting on #one, the cycle is: hold -> collapse to line -> flash -> expand to next.
    const sequence = ["#two", "#three", "#four", shapeOne];

    const logoTimeline = gsap.timeline({ repeat: -1 });

    sequence.forEach((next) => {
        logoTimeline
            // .to(logoMorpher, {
            //     morphSVG: morphOptions(LINE),
            //     duration: COLLAPSE,
            //     ease: "power2.in"
            // }, `+=${HOLD}`)
            .to(logoMorpher, {
                morphSVG: morphOptions(next),
                duration: EXPAND,
                ease: "power2.out"
            }, `+=${FLASH}`);
    });
};

