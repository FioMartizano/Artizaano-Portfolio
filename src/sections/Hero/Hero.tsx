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

  // Intro: reveal the wordmark on load
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

  // Scroll: ARTIZAANO exits from the center outward,
  // then the sticker slaps on in its place.
  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;

      const q = gsap.utils.selector(hero);
      const mm = gsap.matchMedia();

      // Reduced motion skips all of this; the CSS shows a static layout instead.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const wordmark = q(`.${styles.wordmark}`);
        const letterEls = q(`.${styles.letter}`);
        const description = q(`.${styles.description}`);
        const sticker = q(`.${styles.sticker}`);
        const peelEl = q(`.${styles.peel}`);
        const cue = q(`.${styles.cue}`);
        const hint = q(`.${styles.hint}`);

        // Start state: sticker hidden and not clickable until it lands.
        gsap.set(sticker, { autoAlpha: 0, scale: 0.5, rotate: -16, y: 60 });
        gsap.set(peelEl, { pointerEvents: "none" });
        gsap.set(hint, { autoAlpha: 0, y: 10 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=170%",
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl
          // 1. "SCROLL" cue fades out
          .to(cue, { autoAlpha: 0, duration: 0.15, ease: "none" }, 0)

          // 2. Letters lift off, starting from the middle letter
          .fromTo(
            letterEls,
            { y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" },
            {
              y: -140,
              opacity: 0,
              rotateX: 70,
              filter: "blur(10px)",
              duration: 0.45,
              ease: "power2.in",
              stagger: { each: 0.04, from: "center" },
              immediateRender: false,
            },
            0.1
          )

          // 3. Description drifts up and fades
          .fromTo(
            description,
            { autoAlpha: 1, y: 0 },
            {
              autoAlpha: 0,
              y: -30,
              duration: 0.35,
              ease: "none",
              immediateRender: false,
            },
            0.1
          )

          // 4. Glitch beat as the wordmark breaks apart
          .to(
            wordmark,
            {
              x: -4,
              skewX: -10,
              textShadow: "4px 0 #6D35F2, -4px 0 #C8FF32",
              duration: 0.05,
              repeat: 3,
              yoyo: true,
              ease: "none",
            },
            0.35
          )

          // 5. Sticker slaps on at the center
          .fromTo(
            sticker,
            { autoAlpha: 0, scale: 0.5, rotate: -16, y: 60 },
            {
              autoAlpha: 1,
              scale: 1,
              rotate: 0,
              y: 0,
              duration: 0.6,
              ease: "back.out(1.7)",
              immediateRender: false,
            },
            0.45
          )

          // 6. Once it has landed, it can be hovered and peeled
          .set(peelEl, { pointerEvents: "auto" }, 1)
          .to(hint, { autoAlpha: 1, y: 0, duration: 0.2, ease: "none" }, 1.05)

          // 7. Hold, so there is time to play with the sticker before unpinning
          .to({}, { duration: 0.75 });
      });

      return () => mm.revert();
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

      {/* CENTERED WORDMARK + DESCRIPTION */}
      <div className={styles.heroContent}>
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

      {/* HOLOGRAPHIC PEELING STICKER (revealed on scroll) */}
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
                className={styles.pearl}
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

      {/* SCROLL CUE, THEN PEEL HINT */}
      <div className={styles.cue}>
        SCROLL <span className={styles.cueArrow} aria-hidden="true">↓</span>
      </div>
      <div className={styles.hint}>HOVER OR TAP TO PEEL</div>

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