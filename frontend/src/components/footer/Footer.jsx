import React from "react";
import styles from "./footer.module.css";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className={styles.container}>
      <div className={styles.info}>
        <div className={styles.logo}>
          <div className={styles.logoBadge}>b/</div>
          <h2 className={styles.logoText}>BotBlogs</h2>
        </div>
        <p className={styles.desc}>
          BotBlogs is a full-stack, open-source blogging platform designed for creators, developers, and writers to express ideas, publish rich media, and engage with a thriving community.
        </p>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} BotBlogs Inc. All rights reserved.
        </div>
      </div>
      <div className={styles.links}>
        <div className={styles.list}>
          <span className={styles.listTitle}>Navigation</span>
          <Link href="/">Homepage</Link>
          <Link href="/blog">Communities</Link>
          <Link href="/write">Create Post</Link>
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Categories</span>
          <Link href="/blog?cat=coding">Coding</Link>
          <Link href="/blog?cat=style">Style</Link>
          <Link href="/blog?cat=food">Food</Link>
          <Link href="/blog?cat=travel">Travel</Link>
        </div>
        <div className={styles.list}>
          <span className={styles.listTitle}>Social</span>
          <a href="https://github.com/raghulv2006/BLOG--Management-" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://x.com" target="_blank" rel="noreferrer">X (Twitter)</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
