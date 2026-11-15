
import styles from "./Navbar.module.css";

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <a href="/" className={styles.logo}>
        ARTIZAANO®
      </a>

      <div className={styles.navLinks}>
        <a href="#works">
          <span className={styles.navNumber}>01</span>
          <span>PROJECTS</span>
        </a>

        <a href="#tools">
          <span className={styles.navNumber}>02</span>
          <span>TOOLS</span>
        </a>

        <a href="#certificates">
          <span className={styles.navNumber}>03</span>
          <span>CERTIFICATES</span>
        </a>

        <a href="#about">
          <span className={styles.navNumber}>04</span>
          <span>ABOUT</span>
        </a>

        <a href="#contact">
          <span className={styles.navNumber}>05</span>
          <span>CONTACT</span>
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
