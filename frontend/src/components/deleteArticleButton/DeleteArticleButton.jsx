"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DeleteArticleButton({ slug, authorEmail }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor =
    session?.user?.email &&
    authorEmail &&
    session.user.email.toLowerCase() === authorEmail.toLowerCase();

  if (!isAuthor) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session.user.email }),
      });

      if (res.ok) {
        alert("Article deleted successfully.");
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete article");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("An error occurred while deleting the post.");
    } finally {
      setDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: "rgba(239, 68, 68, 0.12)",
          color: "#ef4444",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          padding: "6px 14px",
          borderRadius: "9999px",
          fontSize: "0.8rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.2s ease",
        }}
        title="Delete this article"
      >
        <span>🗑️ Delete Article</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: 16,
                padding: 24,
                width: "100%",
                maxWidth: 420,
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                color: "var(--textColor)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 700, color: "#ef4444" }}>
                🗑️ Confirm Article Deletion
              </h3>
              <p style={{ fontSize: 14, color: "var(--softTextColor)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                Are you sure you want to permanently delete this article? This action cannot be undone.
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={deleting}
                  style={{
                    background: "var(--softBg)",
                    border: "1px solid var(--border-color)",
                    color: "var(--textColor)",
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    background: "#ef4444",
                    border: "none",
                    color: "#ffffff",
                    padding: "8px 18px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Article"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
