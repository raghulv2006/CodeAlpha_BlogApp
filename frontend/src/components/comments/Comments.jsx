"use client";

import Link from "next/link";
import styles from "./comments.module.css";
import Image from "next/image";
import useSWR from "swr";
import { useSession } from "@/context/AuthContext";
import { useState } from "react";
import { auth } from "@/utils/firebase";
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
  const [justSubmitted, setJustSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!desc.trim()) return;
    if (!session?.user?.email) return;
    
    setSubmitting(true);
    
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ desc, postSlug }),
      });

      if (res.ok) {
        setDesc("");
        setJustSubmitted(true);
        mutate();
        setTimeout(() => setJustSubmitted(false), 2000);
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={styles.button}
              onClick={handleSubmit}
              disabled={submitting || !desc.trim()}
            >
              {submitting ? "Posting..." : justSubmitted ? "Posted ✓" : "Comment"}
            </motion.button>
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
                  <Link
                    href={item?.userEmail ? `/profile?email=${encodeURIComponent(item.userEmail)}` : '#'}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    {item?.user?.image ? (
                      <div className={styles.avatarWrapper}>
                        <img
                          src={item.user.image}
                          alt={item.user.name || "User"}
                          className={styles.avatar}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                    ) : (
                      <div className={styles.defaultAvatar}>
                        {(item?.user?.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className={styles.userInfo}>
                      <span className={styles.username}>
                        @{item?.user?.name?.replace(/\s+/g, "_").toLowerCase() || item?.userEmail?.split("@")[0] || "user"}
                      </span>
                      <span className={styles.date}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Just now"}
                      </span>
                    </div>
                  </Link>
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
