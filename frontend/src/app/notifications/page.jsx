"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "@/utils/api";
import useSWR from "swr";
import Link from "next/link";
import { useSession } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./notifications.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const fetcher = (url) => authFetch(url).then((res) => (res.ok ? res.json() : null));

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "Recently";
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return "Just now";
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
  if (diffInSec < 604800) return `${Math.floor(diffInSec / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function NotificationsPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState("all"); // 'all', 'follows', 'comments'
  const [loadingAction, setLoadingAction] = useState(false);

  const userEmail = session?.user?.email;

  const { data, mutate } = useSWR(
    userEmail ? `${API_URL}/api/notifications?email=${encodeURIComponent(userEmail)}` : null,
    fetcher,
    {
      refreshInterval: 15000, // Poll every 15 seconds
      revalidateOnFocus: true,
    }
  );

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "follows") return n.type === "FOLLOW" || n.type === "UNFOLLOW";
    if (filter === "comments") return n.type === "COMMENT";
    return true;
  });

  const handleMarkAllRead = async () => {
    if (!userEmail) return;
    setLoadingAction(true);
    try {
      await authFetch(`${API_URL}/api/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      mutate();
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleClearAll = async () => {
    if (!userEmail || !confirm("Are you sure you want to clear all notifications?")) return;
    setLoadingAction(true);
    try {
      await authFetch(`${API_URL}/api/notifications/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      mutate();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSingleRead = async (id) => {
    if (!userEmail) return;
    try {
      await authFetch(`${API_URL}/api/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, notificationId: id }),
      });
      mutate();
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.headerTitleRow}>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>🔔 Notifications</h1>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount} new</span>
            )}
          </div>

          <div className={styles.actionBtnGroup}>
            {unreadCount > 0 && (
              <button
                className={styles.secondaryBtn}
                onClick={handleMarkAllRead}
                disabled={loadingAction}
              >
                ✓ Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                className={styles.secondaryBtn}
                onClick={handleClearAll}
                disabled={loadingAction}
              >
                🗑️ Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.tabBtn} ${filter === "all" ? styles.activeTab : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </button>
          <button
            className={`${styles.tabBtn} ${filter === "follows" ? styles.activeTab : ""}`}
            onClick={() => setFilter("follows")}
          >
            Follows & Network
          </button>
          <button
            className={`${styles.tabBtn} ${filter === "comments" ? styles.activeTab : ""}`}
            onClick={() => setFilter("comments")}
          >
            Comments
          </button>
        </div>
      </div>

      {/* Notification List */}
      {filteredNotifications.length > 0 ? (
        <div className={styles.notificationList}>
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`${styles.notificationCard} ${!n.read ? styles.unreadCard : ""}`}
              onClick={() => !n.read && handleSingleRead(n.id)}
            >
              <div className={styles.cardLeft}>
                <div className={styles.avatarWrapper}>
                  {n.senderImage ? (
                    <img src={n.senderImage} alt={n.senderName || "User"} className={styles.avatar} />
                  ) : (
                    <div className={styles.defaultAvatar}>
                      {(n.senderName || n.senderEmail || "U")[0].toUpperCase()}
                    </div>
                  )}

                  {/* Type Badge */}
                  {n.type === "FOLLOW" && (
                    <span className={`${styles.typeBadge} ${styles.followBadge}`}>👤</span>
                  )}
                  {n.type === "UNFOLLOW" && (
                    <span className={`${styles.typeBadge} ${styles.unfollowBadge}`}>👤</span>
                  )}
                  {n.type === "COMMENT" && (
                    <span className={`${styles.typeBadge} ${styles.commentBadge}`}>💬</span>
                  )}
                </div>

                <div className={styles.cardDetails}>
                  <span className={styles.messageText}>{n.message}</span>
                  <span className={styles.timestamp}>{formatRelativeTime(n.createdAt)}</span>
                </div>
              </div>

              <div className={styles.cardRight}>
                {!n.read && <div className={styles.unreadDot} title="Unread notification" />}
                {n.link && (
                  <Link href={n.link} className={styles.actionLink}>
                    View →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyCard}>
          <span className={styles.emptyIcon}>🔔</span>
          <h2 className={styles.emptyTitle}>No Notifications Yet</h2>
          <p className={styles.emptySubtitle}>
            When creators follow you, unfollow you, or comment on your articles, they will appear here!
          </p>
        </div>
      )}
    </div>
  );
}
