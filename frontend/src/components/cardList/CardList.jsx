"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./cardList.module.css";
import Card from "../card/Card";
import SkeletonCard from "../skeleton/SkeletonCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fetcher = (url) => fetch(url).then((res) => res.json());

const sortOptions = [
  { id: "hot", label: "🔥 Hot" },
  { id: "new", label: "✨ New" },
  { id: "top", label: "📈 Top" },
];

const CardList = ({ page = 1, cat = "", tag = "", initialData = null }) => {
  const [activeSort, setActiveSort] = useState("hot");
  const [currentPage, setCurrentPage] = useState(page);
  const [accumulatedPosts, setAccumulatedPosts] = useState(initialData?.posts || []);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const observerTarget = React.useRef(null);

  // Sync initial page load or prop changes
  React.useEffect(() => {
    setCurrentPage(page);
    if (initialData?.posts) {
      setAccumulatedPosts(initialData.posts);
    }
  }, [page, cat, tag, initialData]);

  // Initial load up to page N if direct URL has ?page=N
  React.useEffect(() => {
    if (page > 1) {
      let isMounted = true;
      setFetchingMore(true);
      const fetchPages = async () => {
        try {
          const pagePromises = [];
          for (let p = 1; p <= page; p++) {
            pagePromises.push(
              fetch(`${API_URL}/api/posts?page=${p}&cat=${cat || ""}&tag=${tag || ""}&sort=${activeSort}`).then((res) =>
                res.ok ? res.json() : null
              )
            );
          }
          const results = await Promise.all(pagePromises);
          if (!isMounted) return;
          let allPosts = [];
          results.forEach((resData) => {
            if (resData?.posts) allPosts.push(...resData.posts);
          });
          if (allPosts.length > 0) {
            const uniqueMap = new Map();
            allPosts.forEach((item) => uniqueMap.set(item.id || item.slug, item));
            setAccumulatedPosts(Array.from(uniqueMap.values()));
          }
        } catch (e) {
          console.error("Error prefetching pages:", e);
        } finally {
          if (isMounted) setFetchingMore(false);
        }
      };
      fetchPages();
      return () => {
        isMounted = false;
      };
    }
  }, [page, cat, tag, activeSort]);

  // Infinite Scroll Fetch Next Page
  const loadNextPage = React.useCallback(async () => {
    if (fetchingMore || !hasMore) return;
    setFetchingMore(true);

    const nextPage = currentPage + 1;
    try {
      const res = await fetch(`${API_URL}/api/posts?page=${nextPage}&cat=${cat || ""}&tag=${tag || ""}&sort=${activeSort}`);
      if (res.ok) {
        const resData = await res.json();
        const newPosts = resData?.posts || [];
        const count = resData?.count || 0;

        if (newPosts.length === 0 || nextPage * 10 >= count) {
          setHasMore(false);
        }

        if (newPosts.length > 0) {
          setAccumulatedPosts((prev) => {
            const uniqueMap = new Map();
            [...prev, ...newPosts].forEach((item) => uniqueMap.set(item.id || item.slug, item));
            return Array.from(uniqueMap.values());
          });
          setCurrentPage(nextPage);

          // Update URL query param ?page=N without polluting browser history
          if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set("page", nextPage.toString());
            const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
            window.history.replaceState(null, "", newUrl);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load next page:", err);
    } finally {
      setFetchingMore(false);
    }
  }, [currentPage, fetchingMore, hasMore, cat, tag, activeSort]);

  // IntersectionObserver for infinite scroll sentinel
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !fetchingMore) {
          loadNextPage();
        }
      },
      { threshold: 0.2 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadNextPage, hasMore, fetchingMore]);

  const displayPosts = accumulatedPosts.length > 0 ? accumulatedPosts : initialData?.posts || [];

  return (
    <div className={styles.container}>
      <div className={styles.headerFeed}>
        <h1 className={styles.title}>
          {tag ? `#${tag}` : cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : "Popular Feed"}
        </h1>
        <div className={styles.sortBadges}>
          {sortOptions.map((option) => (
            <button
              key={option.id}
              className={`${styles.sortBadge} ${activeSort === option.id ? styles.activeSort : ""}`}
              onClick={() => {
                setActiveSort(option.id);
                setCurrentPage(1);
                setAccumulatedPosts([]);
                setHasMore(true);
              }}
              style={{ position: "relative" }}
            >
              {activeSort === option.id && (
                <motion.div
                  layoutId="activeSortPill"
                  className={styles.activePillBg}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.posts}>
        {displayPosts && displayPosts.length > 0 ? (
          <div className={styles.postsList}>
            {displayPosts.map((item, index) => (
              <motion.div
                key={item.id || item.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(index * 0.02, 0.1),
                }}
              >
                <Card item={item} />
              </motion.div>
            ))}
          </div>
        ) : !fetchingMore ? (
          <div className={styles.emptyFeed}>
            <p>No posts found in this feed yet.</p>
          </div>
        ) : null}

        {fetchingMore && (
          <div style={{ marginTop: 16 }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Intersection Observer Sentinel Anchor */}
        <div ref={observerTarget} style={{ height: 20, margin: "16px 0" }} />
      </div>
    </div>
  );
};

export default CardList;
