
import { useRef } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";

import Navbar from "../../components/Navbar/Navbar";
import { useGSAP, gsap } from "../../animations/gsap";
import { useStickerPeel } from "../../animations/useStickerPeel";
import { useStickerHolo } from "../../animations/useStickerHolo";

import styles from "./Hero.module.css";
import stickerLogo from "../../assets/images/sticker-logo.png";

const letters = "ARTIZAANO".split("");

const maskUrl = `url("${stickerLogo}")`;

const maskStyle: CSSProperties = {
  WebkitMaskImage: maskUrl,
  maskImage: maskUrl,
};

function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  // Sticker interactions
  const peel = useStickerPeel({
    rest: 0.07,
    peeled: 0.71,
  });

  const holo = useStickerHolo({
    tilt: 15,
    idleShine: 0.7,
    hoverShine: 0.62,
  });

  // Cursor-following background light
  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    gsap.to(event.currentTarget, {
      "--light-x": `${x}%`,
      "--light-y": `${y}%`,
      "--light-opacity": 0.55,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  // Return the light to its resting position
  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    gsap.to(event.currentTarget, {
      "--light-x": "70%",
      "--light-y": "45%",
      "--light-opacity": 0.2,
      duration: 1.2,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  // Typography animation
  useGSAP(
    () => {
      const timeline = gsap.timeline();

      // Reveal each letter in sequence
      timeline.fromTo(
        `.${styles.letter}`,
        {
          y: 80,
          opacity: 0,
          rotateX: -60,
          filter: "blur(8px)",
        },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: 0.09,
          ease: "power4.out",
        }
      );

      // Short glitch effect
      timeline
        .to(`.${styles.wordmark}`, {
          x: -3,
          skewX: -8,
          textShadow: "3px 0 #6D35F2, -3px 0 #C8FF32",
          duration: 0.06,
          repeat: 2,
          yoyo: true,
          ease: "none",
        })
        .to(`.${styles.wordmark}`, {
          x: 0,
          skewX: 0,
          textShadow: "none",
          duration: 0.15,
          ease: "power2.out",
        });
    },
    { scope: heroRef }
  );

  return (
    <section
      className={styles.hero}
      ref={heroRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Navbar />

      {/* INTRO */}
      <div className={styles.intro}>
        <p>FIONA MARIE MARTIZANO</p>
        <span>WEB DEVELOPMENT / UI-UX / VISUAL DESIGN</span>
      </div>

      {/* MAIN HERO CONTENT */}
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.wordmark} aria-label="ARTIZAANO">
            {letters.map((letter, index) => (
              <span
                className={styles.letter}
                key={`${letter}-${index}`}
                aria-hidden="true"
              >
                {letter}
              </span>
            ))}
          </h1>

          <p className={styles.description}>
            I design and build digital experiences shaped by
            interaction, identity, visual experimentation,
            and storytelling.
          </p>
        </div>

        {/* HOLOGRAPHIC PEELING STICKER */}
        <div className={styles.sticker}>
          <div
            className={styles.peel}
            {...peel.handlers}
            {...holo.handlers}
          >
            <div
              className={styles.tilt}
              ref={holo.tiltRef}
            >
              <div
                className={styles.face}
                ref={peel.baseRef}
              >
                <img
                  className={styles.stickerBase}
                  src={stickerLogo}
                  alt="Artizaano smiley sticker"
                  onLoad={peel.render}
                  draggable={false}
                />

                <div
                  className={styles.foil}
                  style={maskStyle}
                  aria-hidden="true"
                />

                <div
                  className={styles.glare}
                  style={maskStyle}
                  aria-hidden="true"
                />
              </div>

              <div
                className={styles.flap}
                ref={peel.flapRef}
                aria-hidden="true"
              >
                <img
                  ref={peel.flapImgRef}
                  src={stickerLogo}
                  alt=""
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <span>BASED IN CAVITE, PH</span>

        <span className={styles.availability}>
          <i aria-hidden="true" />
          AVAILABLE FOR INTERNSHIP
        </span>
      </div>
    </section>
  );
}

export default Hero;
