"use client";

import Image from "next/image";
import styles from "./themeToggle.module.css";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { motion } from "framer-motion";

const ThemeToggle = () => {
  const { toggle, theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div
      className={styles.container}
      onClick={toggle}
      title="Toggle Dark / Light Theme"
      style={
        isDark
          ? { backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.15)" }
          : { backgroundColor: "#e2e8f0", border: "1px solid rgba(0,0,0,0.1)" }
      }
    >
      <Image src="/moon.png" alt="dark mode" width={14} height={14} />
      <motion.div
        className={styles.ball}
        animate={{ x: isDark ? 0 : 22 }}
        transition={{ type: "spring", stiffness: 380, damping: 25 }}
        style={{ background: "var(--accent-green)" }}
      />
      <Image src="/sun.png" alt="light mode" width={14} height={14} />
    </div>
  );
};

export default ThemeToggle;
