import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP, gsap } from "../../animations/gsap";
import styles from "./SelectedWorks.module.css";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    number: "01",
    name: "SUBDIVERSE",
    description: "Community-based web portal and real-time booking platform.",
    role: "FULL STACK DEVELOPER",
    stack: "REACT · FIREBASE · VITE",
    type: "CAPSTONE PROJECT",
    visual: "subdiverse",
    symbol: "SD",
  },
  {
    number: "02",
    name: "COMPUTER AID (E-COMMERCE)",
    description:
      "An e-commerce platform developed collaboratively for browsing and purchasing computer items and gadgets.",
    role: "FULL STACK DEVELOPER",
    stack: "TO BE ADDED",
    type: "WEB APP PROJECT",
    visual: "computerAid",
    symbol: "CA",
  },
  {
    number: "03",
    name: "GEAREDUP!",
    description:
      "An organization merchandise project translating the club's identity into wearable and physical materials.",
    role: "CO-PROJECT HEAD · GRAPHIC DESIGNER",
    stack: "DESIGN · MERCHANDISE",
    type: "ORGANIZATION PROJECT",
    visual: "gearedUp",
    symbol: "GD",
  },
];

function SelectedWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const heading = headingRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;

      if (!section || !heading || !viewport || !track) return;

      const getTravelDistance = () =>
        Math.max(0, track.scrollWidth - viewport.clientWidth);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 0.9 + getTravelDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Phase 1: hold on a clean, black title screen, then move the title
      // into its final upper-left position.
      timeline.fromTo(
        heading,
        {
          left: "50%",
          top: "50%",
          xPercent: -50,
          yPercent: -50,
          scale: 1,
        },
        {
          left: "4.2vw",
          top: "7vh",
          xPercent: 0,
          yPercent: 0,
          scale: 0.58,
          transformOrigin: "left top",
          duration: 0.3,
          ease: "none",
        },
        0
      );

      // Phase 2: reveal the project content only after the title has moved.
      timeline
        .to(
          labelRef.current,
          { autoAlpha: 1, y: 0, duration: 0.1, ease: "none" },
          0.3
        )
        .to(
          track,
          { autoAlpha: 1, duration: 0.1, ease: "none" },
          0.3
        )
        // Phase 3: continue scrolling horizontally through the projects.
        .to(
          track,
          {
            x: () => -getTravelDistance(),
            duration: 0.6,
            ease: "none",
          },
          0.4
        );

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section className={styles.works} id="works" ref={sectionRef}>
      <div className={styles.horizontalStage}>
        <p className={styles.sectionLabel} ref={labelRef}>
          01 SELECTED WORKS
        </p>

        <h2 className={styles.openingTitle} ref={headingRef}>
          PROJECTS
        </h2>

        <div className={styles.horizontalViewport} ref={viewportRef}>
          <div className={styles.projectTrack} ref={trackRef}>
            {projects.map((project) => (
              <article className={styles.projectPanel} key={project.number}>
                <div className={styles.projectInfo}>
                  <span className={styles.projectNumber}>
                    {project.number} / 03
                  </span>

                  <h3>{project.name}</h3>

                  <p className={styles.projectDescription}>
                    {project.description}
                  </p>

                  <div className={styles.metaGroup}>
                    <span>ROLE</span>
                    <p>{project.role}</p>
                  </div>

                  <div className={styles.metaGroup}>
                    <span>STACK</span>
                    <p>{project.stack}</p>
                  </div>

                  <div className={styles.metaGroup}>
                    <span>TYPE</span>
                    <p>{project.type}</p>
                  </div>

                  <a className={styles.projectLink} href="#contact">
                    VIEW PROJECT <span aria-hidden="true">↗</span>
                  </a>
                </div>

                <div
                  className={`${styles.orbitVisual} ${styles[project.visual]}`}
                  role="img"
                  aria-label={`${project.name} visual placeholder`}
                >
                  <span className={styles.orbitRing} />
                  <span className={styles.orbitRing} />
                  <span className={styles.orbitRing} />
                  <span className={styles.orbitCore}>{project.symbol}</span>
                  <span className={styles.orbitDot} />
                  <span className={styles.placeholderNote}>
                    VISUAL PLACEHOLDER
                  </span>
                </div>

                <span className={styles.panelIndex}>
                  {project.number} — 03
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.scrollHint}>
          <span>SCROLL TO EXPLORE</span>
          <span className={styles.progressTrack}>
            <span className={styles.progressLine} />
          </span>
          <span>01 — 03</span>
        </div>
      </div>
    </section>
  );
}

export default SelectedWorks;
