"use client";

import React, { useState, useEffect } from "react";
import styles from "./navbar.module.css";
import Link from "next/link";
import AuthLinks from "../authLinks/AuthLinks";
import ThemeToggle from "../themeToggle/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.container} glass ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.leftSection}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoBadge}>
            <span>b/</span>
          </div>
          <span className={styles.logoText}>BotBlogs</span>
        </Link>
      </div>

      <div className={styles.searchBar}>
        <svg
          className={styles.searchIcon}
          width="18"
          height="18"
          style={{ width: "18px", height: "18px", minWidth: "18px", minHeight: "18px", maxWidth: "18px", maxHeight: "18px" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search BotBlogs communities & tags..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
        />

        <AnimatePresence>
          {searchFocused && (
            <motion.div
              className={`${styles.searchResults} glass`}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className={styles.dropdownHeader}>Popular Communities</div>
              <div className={styles.dropdownList}>
                <Link href="/blog?cat=coding" className={styles.dropdownItem}>
                  💻 coding
                </Link>
                <Link href="/blog?cat=style" className={styles.dropdownItem}>
                  🎨 style
                </Link>
                <Link href="/blog?cat=food" className={styles.dropdownItem}>
                  🍔 food
                </Link>
                <Link href="/blog?tag=nextjs" className={styles.dropdownItem}>
                  #nextjs
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className={styles.links}>
        <AuthLinks />
      </nav>
    </header>
  );
};

export default Navbar;
