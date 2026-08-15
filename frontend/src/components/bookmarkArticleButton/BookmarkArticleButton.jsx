"use client";

import React, { useState } from "react";
import { useSession } from "@/context/AuthContext";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function BookmarkArticleButton({ slug, initialBookmarked = false }) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggleBookmark = async () => {
    if (!session?.user?.email) {
      alert("Please log in to bookmark articles!");
      return;
    }

    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/posts/${slug}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session.user.email }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (err) {
      console.error("Failed to bookmark post:", err);
      setIsBookmarked(!newBookmarked); // rollback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        margin: "28px 0 16px 0",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: "20px" }}>🔖</span>
        <div>
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--textColor)" }}>
            {isBookmarked ? "Post Saved to Your Bookmarks" : "Save this Article"}
          </h4>
          <span style={{ fontSize: "13px", color: "var(--softTextColor)" }}>
            {isBookmarked ? "Access this post anytime from your Profile > Saved tab" : "Bookmark this post to read or reference later in your Profile"}
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleBookmark}
        disabled={loading}
        style={{
          background: isBookmarked ? "var(--accent-green)" : "var(--softBg)",
          color: isBookmarked ? "#ffffff" : "var(--textColor)",
          border: "1px solid " + (isBookmarked ? "var(--accent-green)" : "var(--border-color)"),
          padding: "10px 20px",
          borderRadius: "9999px",
          fontWeight: 700,
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "all 0.2s ease",
          boxShadow: isBookmarked ? "0 4px 14px var(--accent-green-glow)" : "none",
        }}
      >
        <span>{isBookmarked ? "✓ Bookmarked" : "+ Bookmark Article"}</span>
      </motion.button>
    </div>
  );
}
