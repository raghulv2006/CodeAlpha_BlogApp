import React from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";

const Featured = () => {
  return (
    <div className={styles.container}>
      <div className={styles.heroHeader}>
        <span className={styles.badge}>🚀 Welcome to BotBlogs</span>
        <h1 className={styles.title}>
          Where <span className={styles.highlight}>code</span>, stories, and ideas converge.
        </h1>
      </div>

      <div className={styles.postCard}>
        <div className={styles.imgContainer}>
          <Image src="/bb.jpeg" alt="Featured Post" fill className={styles.image} priority />
        </div>
        <div className={styles.textContainer}>
          <div className={styles.metaRow}>
            <span className={styles.tag}>r/featured</span>
            <span className={styles.date}>July 2026</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
