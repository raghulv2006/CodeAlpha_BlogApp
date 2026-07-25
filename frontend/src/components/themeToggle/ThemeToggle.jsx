"use client";

import Image from "next/image";
import styles from "./themeToggle.module.css";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { toggle, theme } = useContext(ThemeContext);

  return (
    <div
      className={styles.container}
      onClick={toggle}
      title="Theme mode"
    >
      <Image src="/moon.png" alt="dark mode" width={14} height={14} />
      <div
        className={styles.ball}
        style={
          theme === "dark"
            ? { left: 2, background: "var(--accent-green)" }
            : { right: 2, background: "var(--accent-green)" }
        }
      ></div>
      <Image src="/sun.png" alt="light mode" width={14} height={14} />
    </div>
  );
};

export default ThemeToggle;
