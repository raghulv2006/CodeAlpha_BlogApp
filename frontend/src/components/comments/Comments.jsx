"use client";

import Link from "next/link";
import styles from "./comments.module.css";
import Image from "next/image";
import useSWR from "swr";
import { useSession } from "@/context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fetcher = async (url) => {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Failed to fetch comments");
    throw error;
  }

  return data;
};

const Comments = ({ postSlug }) => {
  const { status, data: session } = useSession();

  const { data, mutate, isLoading } = useSWR(
    `${API_URL}/api/comments?postSlug=${postSlug}`,
    fetcher
  );

  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!desc.trim()) return;
    setSubmitting(true);
    const userEmail = session?.user?.email || "anonymous@botblogs.dev";
    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desc, postSlug, userEmail }),
      });

      if (res.ok) {
        setDesc("");
        mutate();
      }
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>💬 Discussion & Comments ({data?.length || 0})</h2>

      {status === "authenticated" ? (
        <div className={styles.writeBox}>
          <textarea
            placeholder="What are your thoughts on this article?"
            className={styles.input}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
          />
          <div className={styles.buttonRow}>
            <button
              className={styles.button}
              onClick={handleSubmit}
              disabled={submitting || !desc.trim()}
            >
              {submitting ? "Posting..." : "Comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.loginPrompt}>
          <Link href="/login" className={styles.loginLink}>
            Log in or sign up to join the discussion
          </Link>
        </div>
      )}

      <div className={styles.commentsList}>
        {isLoading ? (
          <div className={styles.loadingComments}>Loading comments...</div>
        ) : data && data.length > 0 ? (
          <AnimatePresence>
            {data.map((item) => (
              <motion.div
                className={styles.commentCard}
                key={item.id || item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.userHeader}>
                  {item?.user?.image ? (
                    <div className={styles.avatarWrapper}>
                      <Image src={item.user.image} alt={item.user.name || "User"} fill className={styles.avatar} />
                    </div>
                  ) : (
                    <div className={styles.defaultAvatar}>
                      {(item?.user?.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className={styles.userInfo}>
                    <span className={styles.username}>
                      u/{item?.user?.name?.replace(/\s+/g, "").toLowerCase() || "user"}
                    </span>
                    <span className={styles.date}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                </div>
                <p className={styles.commentBody}>{item.desc}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className={styles.noComments}>No comments yet. Be the first to start the discussion!</div>
        )}
      </div>
    </div>
  );
};

export default Comments;
