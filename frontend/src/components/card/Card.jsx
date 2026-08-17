"use client";

import Image from "next/image";
import styles from "./card.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sanitizeHtml from "sanitize-html";
import { useSession } from "@/context/AuthContext";
import DeleteArticleButton from "../deleteArticleButton/DeleteArticleButton";
import BookmarkArticleButton from "../bookmarkArticleButton/BookmarkArticleButton";
import { authFetch } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const Card = ({ item, showDelete = false }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [votes, setVotes] = useState(item?.netVotes ?? (item?.views ? Math.min(item.views, 12) : 0));
  const [userVote, setUserVote] = useState(item?.currentUserVote ?? 0); // 1 = up, -1 = down
  const [isBookmarked, setIsBookmarked] = useState(item?.isBookmarked ?? false);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (item?.netVotes !== undefined) setVotes(item.netVotes);
    if (item?.currentUserVote !== undefined) setUserVote(item.currentUserVote);
    if (item?.isBookmarked !== undefined) setIsBookmarked(item.isBookmarked);
  }, [item?.netVotes, item?.currentUserVote, item?.isBookmarked]);

  const handleCardClick = (e) => {
    // If user clicked inside an interactive button, link or video player, do not intercept
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest("input") ||
      e.target.closest("video")
    ) {
      return;
    }
    if (item?.slug) {
      router.push(`/posts/${item.slug}`);
    }
  };

  const handleVote = async (direction) => {
    if (!session?.user?.email) {
      alert("Please log in to vote on posts!");
      return;
    }

    const newDirection = userVote === direction ? 0 : direction;
    const voteDiff = newDirection - userVote;

    // Optimistic UI update
    setUserVote(newDirection);
    setVotes((prev) => prev + voteDiff);

    try {
      const res = await authFetch(`${API_URL}/api/posts/${item.slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session.user.email,
          value: newDirection,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVotes(data.netVotes);
        setUserVote(data.currentUserVote);
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const handleToggleBookmark = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!session?.user?.email) {
      alert("Please log in to bookmark posts!");
      return;
    }

    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);

    try {
      const res = await authFetch(`${API_URL}/api/posts/${item.slug}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session.user.email }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const formattedDate = item?.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) : "Recent";

  const isAuthor =
    session?.user?.email &&
    item?.userEmail &&
    session.user.email.toLowerCase() === item.userEmail.toLowerCase();

  return (
    <motion.div
      className={styles.container}
      data-post-card="true"
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3, scale: 1.005 }}
    >
      {/* Reddit-style Upvote Sidebar */}
      <div className={styles.voteSidebar}>
        <motion.button
          whileTap={{ scale: 0.8 }}
          className={`${styles.voteBtn} ${userVote === 1 ? styles.upvoted : ""}`}
          onClick={() => handleVote(1)}
          data-vote-up="true"
          title="Upvote"
        >
          <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
        </motion.button>

        <motion.span
          key={votes}
          initial={{ scale: 1.25, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`${styles.voteCount} ${userVote === 1 ? styles.upvotedText : userVote === -1 ? styles.downvotedText : ""}`}
        >
          {votes}
        </motion.span>

        <motion.button
          whileTap={{ scale: 0.8 }}
          className={`${styles.voteBtn} ${userVote === -1 ? styles.downvoted : ""}`}
          onClick={() => handleVote(-1)}
          title="Downvote"
        >
          <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 20l8-8h-5V4h-6v8H4z" />
          </svg>
        </motion.button>
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
            {item?.user?.image && !avatarError ? (
              <img
                src={item.user.image}
                alt={item.user.name || "Author"}
                className={styles.authorAvatar}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className={styles.defaultAvatar}>
                {(item?.user?.name || item?.userEmail || "U")[0].toUpperCase()}
              </div>
            )}
            <span className={styles.authorName}>
              @{item?.user?.name?.replace(/\s+/g, "_").toLowerCase() || item?.userEmail?.split("@")[0] || "user"}
            </span>
          </Link>
          <span className={styles.dotSeparator}>•</span>
          <span className={styles.postDate}>{formattedDate}</span>
          <Link href={`/blog?cat=${item?.catSlug}`} className={styles.categoryPill}>
            {item?.catSlug ? item.catSlug.charAt(0).toUpperCase() + item.catSlug.slice(1) : ""}
          </Link>
          {isAuthor && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <Link href={`/posts/${item?.slug}/edit`} className={styles.editPill} style={{ textDecoration: "none", fontSize: "0.75rem", opacity: 0.8 }}>
                ✏️ Edit
              </Link>
              {showDelete && <DeleteArticleButton slug={item?.slug} authorEmail={item?.userEmail} />}
            </div>
          )}
        </div>

        {/* Post Title */}
        <Link href={`/posts/${item?.slug}`} className={styles.titleLink}>
          <h2 className={styles.title}>{item?.title}</h2>
        </Link>

        {/* Media Renderer with Image Hover Overlay for Bookmarking */}
        {item?.video ? (
          <motion.div className={styles.mediaWrapper} layoutId={`post-media-${item.slug}`}>
            <video src={item.video} controls className={styles.videoPlayer} preload="metadata" />
            <div className={styles.mediaHoverOverlay}>
              <Link href={`/posts/${item?.slug}`} className={styles.mediaHoverLink}>
                <div className={styles.mediaHoverMetrics}>
                  <span>▲ {votes}</span>
                  <span>💬 {item?.comments?.length || 0}</span>
                </div>
              </Link>
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleToggleBookmark}
                className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarkedActive : ""}`}
              >
                {isBookmarked ? "🔖 Bookmarked" : "🏷️ Bookmark"}
              </motion.button>
            </div>
          </motion.div>
        ) : item?.img && !imgError ? (
          <motion.div className={styles.mediaWrapper} layoutId={`post-media-${item.slug}`}>
            <Link href={`/posts/${item?.slug}`} style={{ textDecoration: "none", display: "block", width: "100%", height: "100%" }}>
              <img
                src={item.img}
                alt={item.title}
                className={styles.postImage}
                onError={() => setImgError(true)}
              />
            </Link>
            <div className={styles.mediaHoverOverlay}>
              <Link href={`/posts/${item?.slug}`} className={styles.mediaHoverLink}>
                <div className={styles.mediaHoverMetrics}>
                  <span>▲ {votes}</span>
                  <span>💬 {item?.comments?.length || 0}</span>
                </div>
              </Link>
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleToggleBookmark}
                className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarkedActive : ""}`}
              >
                {isBookmarked ? "🔖 Bookmarked" : "🏷️ Bookmark"}
              </motion.button>
            </div>
          </motion.div>
        ) : null}

        {/* Snippet Description */}
        <Link href={`/posts/${item?.slug}`} style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>
          <div
            className={styles.descSnippet}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                item?.desc ? item.desc.substring(0, 160) + (item.desc.length > 160 ? "..." : "") : ""
              ),
            }}
          />
        </Link>

        {/* Tags / Hashtags */}
        {item?.tags && item.tags.length > 0 && (
          <div className={styles.tagChipsRow} style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0" }}>
            {item.tags.map((t, idx) => (
              <motion.div
                key={t.id || t.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Link
                  href={`/blog?tag=${t.name}`}
                  className="glass-lite"
                  style={{ textDecoration: "none", fontSize: "0.75rem", color: "#38bdf8", padding: "3px 10px", borderRadius: 12, display: "inline-block", transition: "all 0.15s ease" }}
                >
                  #{t.name}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

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

          <motion.div whileHover={{ scale: 1.05, x: 2 }} whileTap={{ scale: 0.95 }} style={{ marginLeft: "auto" }}>
            <Link href={`/posts/${item?.slug}`} className={styles.readMoreBtn}>
              Read Article →
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
