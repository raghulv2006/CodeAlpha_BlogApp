"use client";

import React, { useEffect, useState } from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const Featured = () => {
  const { status, data: session } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const emailKey = `hasSeenWelcome_${session.user.email}`;
      const localSeen = localStorage.getItem(emailKey);

      if (!localSeen) {
        fetch(`${API_URL}/api/users/profile?email=${encodeURIComponent(session.user.email)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.user?.hasSeenWelcome) {
              localStorage.setItem(emailKey, "true");
              setVisible(false);
            } else {
              setVisible(true);
            }
          })
          .catch(() => setVisible(true));
      } else {
        setVisible(false);
      }
    } else {
      setVisible(false);
    }
  }, [status, session?.user?.email]);

  const handleDismiss = async () => {
    setVisible(false);
    if (session?.user?.email) {
      localStorage.setItem(`hasSeenWelcome_${session.user.email}`, "true");
      try {
        await fetch(`${API_URL}/api/users/dismiss-welcome`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
      } catch (err) {
        console.error("Failed to dismiss welcome on backend:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.container}
          initial={{ opacity: 0, scale: 0.96, height: 0 }}
          animate={{ opacity: 1, scale: 1, height: "auto" }}
          exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          style={{ position: "relative" }}
        >
          <button className={styles.dismissBtn} onClick={handleDismiss} title="Dismiss welcome banner">
            ✕
          </button>
          <div className={styles.heroHeader}>
            <span className={styles.badge}>🚀 Welcome to BotBlogs, {session?.user?.name || "Creator"}!</span>
            <h1 className={styles.title}>
              Where <span className={styles.highlight}>code</span>, stories, and communities converge.
            </h1>
          </div>

          <div className={`${styles.postCard} glass`}>
            <div className={styles.imgContainer}>
              <Image src="/bb.jpeg" alt="Featured Post" fill className={styles.image} priority />
            </div>
            <div className={styles.textContainer}>
              <div className={styles.metaRow}>
                <span className={styles.tag}>Featured</span>
                <span className={styles.date}>BotBlogs 2.0</span>
              </div>
              <h2 className={styles.postTitle}>
                A space where words evolve and community-driven ideas unfold.
              </h2>
              <p className={styles.postDesc}>
                BotBlogs combines modern architecture with developer-first tools. Share your tech journeys, design insights, and creative stories with a global community.
              </p>
              <div className={styles.btnRow}>
                <Link href="/write" className={styles.primaryBtn}>
                  Start Writing →
                </Link>
                <button onClick={handleDismiss} className={styles.dismissBtnText}>
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Featured;
