gsap.registerPlugin(ScrollTrigger);
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

const logoMorpher = document.querySelector("#one");
const sections = gsap.utils.toArray(".section");

if (logoMorpher && sections.length) {
    // Read every shape's path data up front. #one is the path we animate, so
    // its own "d" gets overwritten as soon as the first morph runs.
    const shapes = ["#one", "#two", "#three", "#four"].map((id) =>
        document.querySelector(id).getAttribute("d")
    );

    gsap.set(["#two", "#three", "#four"], { display: "none" });

    const morphTo = (index) => {
        gsap.to(logoMorpher, {
            morphSVG: {
                shape: shapes[index],
                shapeIndex: "auto", // let MorphSVG pick the point mapping
                map: "complexity"   // match subpaths by detail, not bounding-box size
            },
            duration: 1.2,
            ease: "power2.inOut",
            overwrite: true // on fast scrolls, drop the old morph and head for the new shape
        });
    };

    // Section 1 -> #one, section 2 -> #two, ... A section counts as "in view"
    // while it crosses the middle of the viewport, in either scroll direction.
    sections.forEach((section, index) => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => {
                if (self.isActive) morphTo(index % shapes.length);
            }
        });
    });
}

/* ---------- Section crossfade ---------- */

// Sections are sticky, so each one slides up over the previous. One scrubbed
// timeline covers the whole of <main>: while section N slides in, N-1 fades
// out and N fades in. A single timeline (rather than one ScrollTrigger per
// section) keeps rendering order fixed, so fast scrolls in either direction
// never leave a section at the wrong opacity.
if (sections.length > 1) {
    gsap.set(sections.slice(1), { autoAlpha: 0 });

    const crossfade = gsap.timeline({
        defaults: { duration: 1, ease: "none" },
        scrollTrigger: {
            trigger: ".main",
            start: "top top",
            end: "bottom bottom", // = one viewport of scroll per section change
            scrub: true,
            // Snap to whole sections. Directional: any nudge down goes to the
            // next section, any nudge up to the previous one.
            snap: {
                snapTo: 1 / (sections.length - 1),
                directional: true,
                // delay: 0.05,                    // wait this long after scrolling stops
                duration: { min: 0.1, max: 0.3 },
                ease: "power2.inOut"
            }
        }
    });

    // Section text is vertically centred, so the incoming text is still below
    // the screen for the first half of the slide. Fading over that half would
    // be invisible, so both fades run in the last FADE of each slide instead.
    const FADE = 0.1; // share of the slide spent fading (0-1)

    sections.slice(1).forEach((section, i) => {
        const at = i + 1 - FADE;
        crossfade
            .to(sections[i], { autoAlpha: 0, duration: FADE }, at) // previous out...
            .to(section, { autoAlpha: 1, duration: FADE }, at);    // ...new in, at the same time
    });
}
