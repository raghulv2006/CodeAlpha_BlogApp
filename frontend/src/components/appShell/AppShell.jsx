"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/context/AuthContext";
import useSWR from "swr";
import Image from "next/image";
import ThemeToggle from "@/components/themeToggle/ThemeToggle";
import KeyboardShortcuts from "@/components/keyboardShortcuts/KeyboardShortcuts";
import homeIcon from "@/Assets/home.png";
import exploreIcon from "@/Assets/explore.png";
import addIcon from "@/Assets/add.png";
import userIcon from "@/Assets/user.png";
import aboutIcon from "@/Assets/about.png";
import styles from "./appShell.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const fetcher = (url) => fetch(url).then((res) => (res.ok ? res.json() : null));
const authFetcher = (url) => {
  // Dynamically import to avoid SSR issues
  return import("@/utils/api").then(({ authFetch }) =>
    authFetch(url).then((res) => (res.ok ? res.json() : null))
  );
};

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Trending Tags & Suggested Users SWR with deduplication caching
  const { data: tagData } = useSWR(`${API_URL}/api/tags/trending`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    revalidateIfStale: false,
  });
  const { data: suggestedData } = useSWR(
    session?.user?.email ? `${API_URL}/api/users/suggested?userEmail=${encodeURIComponent(session.user.email)}` : `${API_URL}/api/users/suggested`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      revalidateIfStale: false,
    }
  );

  // Unread Notifications Count (uses authFetcher since this route requires authentication)
  const { data: notifData } = useSWR(
    session?.user?.email ? `${API_URL}/api/notifications?email=${encodeURIComponent(session.user.email)}` : null,
    authFetcher,
    { refreshInterval: 15000 }
  );

  const unreadNotifCount = notifData?.unreadCount || 0;

  const navItems = [
    { label: "Home", href: "/", icon: homeIcon },
    { label: "Explore", href: "/blog", icon: exploreIcon },
    { label: "Alerts", href: "/notifications", isNotification: true, badge: unreadNotifCount },
    { label: "Create", href: "/write", icon: addIcon },
    { label: "Profile", href: "/profile", icon: userIcon },
    { label: "About", href: "/about", icon: aboutIcon },
  ];

  // Exclude shell layout on login route
  if (pathname === "/login") {
    return <>{children}</>;
  }

  const isPostPage = pathname.startsWith("/posts/");

  return (
    <div className={styles.shellContainer}>
      {/* Keyboard Shortcuts Provider & Help Modal */}
      <KeyboardShortcuts />

      {/* Left Sidebar Navigation (Desktop >= 1024px) */}
      <aside className={styles.leftSidebar}>
        <div>
          <Link href="/" className={styles.brandHeader}>
            <img src="/bb.png" alt="BotBlogs Logo" className={styles.brandLogoImg} />
            <span className={styles.brandText}>BotBlogs</span>
          </Link>

          <nav className={styles.navGroup}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.activeNavItem : ""}`}
                >
                  <span className={styles.navIcon} style={{ position: "relative" }}>
                    {item.isNotification ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-green)" }}>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    ) : (
                      <Image src={item.icon} alt={item.label} width={22} height={22} className={styles.sidebarPngIcon} />
                    )}
                    {item.badge > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -6,
                          background: "var(--accent-green)",
                          color: "#000000",
                          fontSize: 10,
                          fontWeight: 800,
                          borderRadius: "50%",
                          width: 16,
                          height: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 0 6px var(--accent-green-glow)",
                        }}
                      >
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <span className={styles.sidebarFooterLabel}>Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Layout Area (Center Content + Right Sidebar Flex Alignment) */}
      <div className={styles.mainLayoutWrapper}>
        {/* Center Feed Column */}
        <main className={styles.centerContent}>{children}</main>

        {/* Right Utility Sidebar (Desktop >= 1024px) */}
        <aside className={styles.rightSidebar}>
          {/* User Summary Widget */}
          {session?.user && (
            <div className={styles.widgetCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div className={styles.userSuggestFallback} style={{ width: 44, height: 44, fontSize: 18 }}>
                    {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <span className={styles.userSuggestName}>{session.user.name || session.user.email}</span>
                  <span className={styles.userSuggestHandle}>@{session.user.name?.replace(/\s+/g, "_").toLowerCase() || session.user.email?.split("@")[0]}</span>
                </div>
              </div>
              <Link href="/profile" style={{ fontSize: "0.82rem", color: "var(--accent-green)", fontWeight: 700, textDecoration: "none", marginTop: 4 }}>
                View Profile →
              </Link>
            </div>
          )}

          {/* Trending Hashtags */}
          <div className={styles.widgetCard}>
            <h3 className={styles.widgetTitle}>
              <span>🔥</span> Trending Hashtags
            </h3>
            <div className={styles.tagChipRow}>
              {tagData?.tags && tagData.tags.length > 0 ? (
                tagData.tags.map((t) => (
                  <Link key={t.id || t.name} href={`/blog?tag=${t.name}`} className={styles.tagPill}>
                    #{t.name}
                  </Link>
                ))
              ) : (
                <span style={{ fontSize: "0.85rem", color: "var(--softTextColor)" }}>#Coding #Tech #Gaming</span>
              )}
            </div>
          </div>

          {/* Suggested Accounts */}
          {!isPostPage && suggestedData?.users && suggestedData.users.length > 0 && (
            <div className={styles.widgetCard}>
              <h3 className={styles.widgetTitle}>
                <span>👥</span> Suggested Accounts
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {suggestedData.users.map((u) => (
                  <div key={u.id || u.email} className={styles.userSuggestRow}>
                    <Link
                      href={u.email ? `/profile?email=${encodeURIComponent(u.email)}` : `/profile?id=${encodeURIComponent(u.id)}`}
                      className={styles.userSuggestLeft}
                      style={{ textDecoration: "none" }}
                    >
                      {u.image ? (
                        <img src={u.image} alt={u.name || "User"} className={styles.userSuggestAvatar} />
                      ) : (
                        <div className={styles.userSuggestFallback}>{(u.name || u.email || "U")[0].toUpperCase()}</div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        <span className={styles.userSuggestName}>{u.name || u.email}</span>
                        <span className={styles.userSuggestHandle}>@{u.name?.replace(/\s+/g, "_").toLowerCase() || u.email?.split("@")[0]}</span>
                      </div>
                    </Link>
                    <Link
                      href={u.email ? `/profile?email=${encodeURIComponent(u.email)}` : `/profile?id=${encodeURIComponent(u.id)}`}
                      style={{ fontSize: "0.75rem", color: "var(--accent-green)", background: "var(--softBg)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: 12, textDecoration: "none", fontWeight: 600 }}
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <nav className={styles.mobileBottomBar}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavItem} ${isActive ? styles.mobileActiveNavItem : ""}`}
            >
              <span className={styles.mobileNavIcon} style={{ position: "relative" }}>
                {item.isNotification ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-green)" }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                ) : (
                  <Image src={item.icon} alt={item.label} width={20} height={20} className={styles.sidebarPngIcon} />
                )}
                {item.badge > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -6,
                      background: "var(--accent-green)",
                      color: "#000000",
                      fontSize: 9,
                      fontWeight: 800,
                      borderRadius: "50%",
                      width: 14,
                      height: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 6px var(--accent-green-glow)",
                    }}
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
