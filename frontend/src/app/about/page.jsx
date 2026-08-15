import React from "react";
import Link from "next/link";
import styles from "./about.module.css";

export const metadata = {
  title: "About Us - BotBlogs Platform",
  description: "Learn about BotBlogs — a full-stack, open-source blogging platform for creators and developers.",
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <div className={styles.heroCard}>
        <div className={styles.heroBadge}>b/</div>
        <h1 className={styles.title}>About BotBlogs</h1>
        <p className={styles.subtitle}>
          BotBlogs is a full-stack, open-source blogging platform designed for creators, developers, and writers to express ideas, publish rich media, and engage with a thriving community.
        </p>
      </div>

      {/* Mission & Overview */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>
          <span>💡</span> Our Mission & Platform
        </h2>
        <p className={styles.description}>
          Built with Next.js, Express, Prisma, and Cloudinary, BotBlogs bridges the gap between traditional long-form publishing and modern social feed interactions. Featuring 4:3 ratio media streams, infinite scrolling, real-time voting, user profiles, and keyboard shortcuts, BotBlogs gives creators a state-of-the-art home on the web.
        </p>
      </div>

      {/* Navigation, Categories & Social Links */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>
          <span>🗺️</span> Platform Sitemap & Links
        </h2>

        <div className={styles.grid3}>
          {/* Navigation */}
          <div>
            <div className={styles.linkGroupTitle}>Navigation</div>
            <div className={styles.linkList}>
              <Link href="/" className={styles.aboutLink}>
                🏠 Homepage
              </Link>
              <Link href="/blog" className={styles.aboutLink}>
                🧭 Communities
              </Link>
              <Link href="/write" className={styles.aboutLink}>
                ✏️ Create Post
              </Link>
              <Link href="/profile" className={styles.aboutLink}>
                👤 Profile
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className={styles.linkGroupTitle}>Categories</div>
            <div className={styles.linkList}>
              <Link href="/blog?cat=coding" className={styles.aboutLink}>
                💻 Coding
              </Link>
              <Link href="/blog?cat=style" className={styles.aboutLink}>
                🎨 Style
              </Link>
              <Link href="/blog?cat=food" className={styles.aboutLink}>
                🍔 Food
              </Link>
              <Link href="/blog?cat=travel" className={styles.aboutLink}>
                ✈️ Travel
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <div className={styles.linkGroupTitle}>Social & Connect</div>
            <div className={styles.socialRow} style={{ flexDirection: "column" }}>
              <a
                href="https://github.com/raghulv2006/BLOG--Management-"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.aboutLink}
              >
                🐙 GitHub Repository
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.aboutLink}
              >
                🐦 X (Twitter)
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.aboutLink}
              >
                📸 Instagram
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Social Directories Cards Grid (Matching reference design) */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>
          <span>🌐</span> Social Directories
        </h2>

        <div className={styles.socialDirectoriesGrid}>
          {/* LinkedIn Card */}
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.directoryCard} ${styles.linkedinCard}`}
          >
            <span>LinkedIn</span>
            <svg className={styles.directoryIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </a>

          {/* GitHub Card */}
          <a
            href="https://github.com/raghulv2006/BLOG--Management-"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.directoryCard} ${styles.githubCard}`}
          >
            <span>GitHub</span>
            <svg className={styles.directoryIcon} fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Twitter / X Card */}
          <a
            href="https://x.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.directoryCard} ${styles.xCard}`}
          >
            <span>Twitter / X</span>
            <svg className={styles.directoryIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Instagram Card */}
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.directoryCard} ${styles.instagramCard}`}
          >
            <span>Instagram</span>
            <svg className={styles.directoryIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* WhatsApp Card */}
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.directoryCard} ${styles.whatsappCard}`}
          >
            <span>WhatsApp</span>
            <svg className={styles.directoryIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>

          {/* Email Direct Card */}
          <a
            href="mailto:contact@botblogs.dev"
            className={`${styles.directoryCard} ${styles.emailCard}`}
          >
            <span>Email Direct</span>
            <svg className={styles.directoryIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </a>

          {/* Reddit Card */}
          <a
            href="https://reddit.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.directoryCard} ${styles.redditCard}`}
          >
            <span>Reddit</span>
            <svg className={styles.directoryIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .464c.603.602 1.583.903 2.697.903 1.115 0 2.095-.301 2.698-.903a.328.328 0 0 0-.464-.464c-.477.476-1.282.715-2.234.715-.952 0-1.757-.239-2.234-.715a.325.325 0 0 0-.231-.094z" />
            </svg>
          </a>

          {/* Facebook Card */}
          <a
            href="https://facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.directoryCard} ${styles.facebookCard}`}
          >
            <span>Facebook</span>
            <svg className={styles.directoryIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className={styles.copyrightFooter}>
        <p>© 2026 BotBlogs Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
