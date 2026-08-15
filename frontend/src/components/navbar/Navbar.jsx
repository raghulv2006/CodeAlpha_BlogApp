"use client";

import React, { useState, useEffect } from "react";
import styles from "./navbar.module.css";
import Link from "next/link";
import AuthLinks from "../authLinks/AuthLinks";
import ThemeToggle from "../themeToggle/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searching, setSearching] = useState(false);

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

  // Live debounced User search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setUserResults(data.users || []);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className={`${styles.container} glass ${scrolled ? styles.scrolled : ""}`}>
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
          placeholder="Search creators by username, email, or tags..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
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
              {/* User Results Section */}
              {searchQuery.trim() && (
                <div style={{ marginBottom: 12 }}>
                  <div className={styles.dropdownHeader}>👥 Creators & Users</div>
                  {searching ? (
                    <div style={{ padding: "6px 12px", fontSize: "0.85rem", color: "var(--softTextColor)" }}>
                      Searching users...
                    </div>
                  ) : userResults.length > 0 ? (
                    <div className={styles.dropdownList}>
                      {userResults.map((u) => (
                        <Link
                          key={u.id || u.email}
                          href={`/profile?email=${encodeURIComponent(u.email)}`}
                          className={styles.userSearchItem}
                          onClick={() => setSearchFocused(false)}
                        >
                          {u.image ? (
                            <img src={u.image} alt={u.name || "User"} className={styles.userSearchAvatar} />
                          ) : (
                            <div className={styles.userSearchDefaultAvatar}>
                              {(u.name || u.email || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div className={styles.userSearchInfo}>
                            <span className={styles.userSearchName}>
                              @{u.name?.replace(/\s+/g, "_").toLowerCase() || u.email.split("@")[0]}
                            </span>
                            <span className={styles.userSearchEmail}>{u.email}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "6px 12px", fontSize: "0.85rem", color: "var(--softTextColor)" }}>
                      No matching user found
                    </div>
                  )}
                </div>
              )}

              {/* Popular Communities Section */}
              <div className={styles.dropdownHeader}>Popular Communities</div>
              <div className={styles.dropdownList}>
                <Link href="/blog?cat=coding" className={styles.dropdownItem} onClick={() => setSearchFocused(false)}>
                  💻 coding
                </Link>
                <Link href="/blog?cat=style" className={styles.dropdownItem} onClick={() => setSearchFocused(false)}>
                  🎨 style
                </Link>
                <Link href="/blog?cat=food" className={styles.dropdownItem} onClick={() => setSearchFocused(false)}>
                  🍔 food
                </Link>
                <Link href="/blog?tag=nextjs" className={styles.dropdownItem} onClick={() => setSearchFocused(false)}>
                  #nextjs
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Theme Toggle (Top Right on Mobile Screens < 1024px) */}
      <div className={styles.mobileThemeToggle}>
        <ThemeToggle />
      </div>

      <nav className={styles.links}>
        <AuthLinks />
      </nav>
    </header>
  );
};

export default Navbar;
