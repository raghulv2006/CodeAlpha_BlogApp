"use client";

import React from "react";
import styles from "./navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import AuthLinks from "../authLinks/AuthLinks";
import ThemeToggle from "../themeToggle/ThemeToggle";

const Navbar = () => {
  return (
    <header className={styles.container}>
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
          placeholder="Search BotBlogs..."
          className={styles.searchInput}
          readOnly
        />
      </div>

      <nav className={styles.links}>
        <ThemeToggle />
        <Link href="/" className={styles.link}>
          Home
        </Link>
        <AuthLinks />
      </nav>
    </header>
  );
};

export default Navbar;
