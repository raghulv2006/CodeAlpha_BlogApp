"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KeyboardShortcuts() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Guard against typing inside input, textarea, contentEditable or select elements
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Help Modal Toggle ('?' or 'Shift+/')
      if (e.key === "?" || (e.shiftKey && key === "/")) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      const cards = document.querySelectorAll("[data-post-card='true']");
      if (!cards || cards.length === 0) return;

      // 'J' -> Next Card
      if (key === "j") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const nextIndex = Math.min(prev + 1, cards.length - 1);
          cards.forEach((c) => c.removeAttribute("data-focused"));
          if (cards[nextIndex]) {
            cards[nextIndex].setAttribute("data-focused", "true");
            cards[nextIndex].scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return nextIndex;
        });
      }

      // 'K' -> Previous Card
      if (key === "k") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const prevIndex = Math.max(prev - 1, 0);
          cards.forEach((c) => c.removeAttribute("data-focused"));
          if (cards[prevIndex]) {
            cards[prevIndex].setAttribute("data-focused", "true");
            cards[prevIndex].scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return prevIndex;
        });
      }

      // 'L' -> Like / Upvote Focused Card
      if (key === "l") {
        e.preventDefault();
        const activeCard = document.querySelector("[data-post-card='true'][data-focused='true']");
        if (activeCard) {
          const voteBtn = activeCard.querySelector("[data-vote-up='true']");
          if (voteBtn) voteBtn.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isHelpOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setIsHelpOpen(false)}
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
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                color: "var(--textColor)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>⌨️ Keyboard Shortcuts</h3>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  style={{ background: "none", border: "none", color: "var(--softTextColor)", fontSize: 20, cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>Move to next post</span>
                  <kbd style={{ background: "var(--softBg)", border: "1px solid var(--border-color)", padding: "2px 10px", borderRadius: 6, fontWeight: 700 }}>J</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>Move to previous post</span>
                  <kbd style={{ background: "var(--softBg)", border: "1px solid var(--border-color)", padding: "2px 10px", borderRadius: 6, fontWeight: 700 }}>K</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>Upvote / Like focused post</span>
                  <kbd style={{ background: "var(--softBg)", border: "1px solid var(--border-color)", padding: "2px 10px", borderRadius: 6, fontWeight: 700 }}>L</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>Toggle shortcuts help</span>
                  <kbd style={{ background: "var(--softBg)", border: "1px solid var(--border-color)", padding: "2px 10px", borderRadius: 6, fontWeight: 700 }}>?</kbd>
                </div>
              </div>

              <p style={{ marginTop: 20, fontSize: 12, color: "var(--softTextColor)", textAlign: "center", margin: "20px 0 0 0" }}>
                Press <kbd style={{ background: "var(--softBg)", padding: "2px 6px", borderRadius: 4 }}>?</kbd> anytime to open this menu
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
