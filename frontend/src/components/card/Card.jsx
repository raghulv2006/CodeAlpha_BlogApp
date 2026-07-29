"use client";

import Image from "next/image";
import styles from "./card.module.css";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import sanitizeHtml from "sanitize-html";

const Card = ({ item }) => {
  const [votes, setVotes] = useState(() => Math.floor(Math.random() * 40) + (item.views || 5));
  const [userVote, setUserVote] = useState(0); // 1 = up, -1 = down

  const handleVote = (direction) => {
    if (userVote === direction) {
      setUserVote(0);
      setVotes(votes - direction);
    } else {
      setVotes(votes - userVote + direction);
      setUserVote(direction);
    }
  };

  const formattedDate = item?.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) : "Recent";

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
    >
      {/* Reddit-style Upvote Sidebar */}
      <div className={styles.voteSidebar}>
        <button
          className={`${styles.voteBtn} ${userVote === 1 ? styles.upvoted : ""}`}
          onClick={() => handleVote(1)}
          title="Upvote"
        >
          <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
        </button>

        <span className={`${styles.voteCount} ${userVote === 1 ? styles.upvotedText : userVote === -1 ? styles.downvotedText : ""}`}>
          {votes}
        </span>

        <button
          className={`${styles.voteBtn} ${userVote === -1 ? styles.downvoted : ""}`}
          onClick={() => handleVote(-1)}
          title="Downvote"
        >
          <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 20l8-8h-5V4h-6v8H4z" />
          </svg>
        </button>
      </div>

      {/* Post Main Content */}
      <div className={styles.mainContent}>
        {/* Post Metadata Header */}
        <div className={styles.metaHeader}>
          <Link
            href={`/profile?email=${encodeURIComponent(item?.userEmail || "")}`}
            className={styles.metaHeader}
            style={{ textDecoration: "none" }}
          >
            {item?.user?.image ? (
              <img src={item.user.image} alt={item.user.name || "Author"} className={styles.authorAvatar} />
            ) : (
              <div className={styles.defaultAvatar}>
                {(item?.user?.name || item?.userEmail || "U")[0].toUpperCase()}
              </div>
            )}
            <span className={styles.authorName}>
              u/{item?.user?.name?.replace(/\s+/g, "").toLowerCase() || item?.userEmail?.split("@")[0] || "anonymous"}
            </span>
          </Link>
          <span className={styles.dotSeparator}>•</span>
          <span className={styles.postDate}>{formattedDate}</span>
          <span className={styles.categoryPill}>{item?.catSlug}</span>
        </div>

        {/* Post Title */}
        <Link href={`/posts/${item?.slug}`} className={styles.titleLink}>
          <h2 className={styles.title}>{item?.title}</h2>
        </Link>

        {/* Media Renderer (Image or Video) */}
        {item?.video ? (
          <div className={styles.mediaWrapper}>
            <video src={item.video} controls className={styles.videoPlayer} preload="metadata" />
          </div>
        ) : item?.img ? (
          <div className={styles.mediaWrapper}>
            <img src={item.img} alt={item.title} className={styles.postImage} />
          </div>
        ) : null}

        {/* Snippet Description */}
        <div
          className={styles.descSnippet}
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(
              item?.desc ? item.desc.substring(0, 160) + (item.desc.length > 160 ? "..." : "") : ""
            ),
          }}
        />

        {/* Footer Metrics & Actions */}
        <div className={styles.cardFooter}>
          <Link href={`/posts/${item?.slug}`} className={styles.actionPill}>
            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{item?.comments?.length || 0} Comments</span>
          </Link>

          <div className={styles.actionPill}>
            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{item?.views || 0} views</span>
          </div>

          <Link href={`/posts/${item?.slug}`} className={styles.readMoreBtn}>
            Read Article →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
