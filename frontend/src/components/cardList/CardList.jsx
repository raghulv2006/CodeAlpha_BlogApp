"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./cardList.module.css";
import Pagination from "../pagination/Pagination";
import Card from "../card/Card";
import SkeletonCard from "../skeleton/SkeletonCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fetcher = (url) => fetch(url).then((res) => res.json());

const CardList = ({ page = 1, cat = "" }) => {
  const [activeSort, setActiveSort] = useState("hot");

  const { data, isLoading } = useSWR(
    `${API_URL}/api/posts?page=${page}&cat=${cat || ""}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds client-side deduplication / caching
    }
  );

  const posts = data?.posts || [];
  const count = data?.count || 0;
  const POST_PER_PAGE = 10;

  const hasPrev = POST_PER_PAGE * (page - 1) > 0;
  const hasNext = POST_PER_PAGE * (page - 1) + POST_PER_PAGE < count;

  return (
    <div className={styles.container}>
      <div className={styles.headerFeed}>
        <h1 className={styles.title}>
          {cat ? `r/${cat}` : "Popular Feed"}
        </h1>
        <div className={styles.sortBadges}>
          <span
            className={`${styles.sortBadge} ${activeSort === "hot" ? styles.activeSort : ""}`}
            onClick={() => setActiveSort("hot")}
          >
            🔥 Hot
          </span>
          <span
            className={`${styles.sortBadge} ${activeSort === "new" ? styles.activeSort : ""}`}
            onClick={() => setActiveSort("new")}
          >
            ✨ New
          </span>
          <span
            className={`${styles.sortBadge} ${activeSort === "top" ? styles.activeSort : ""}`}
            onClick={() => setActiveSort("top")}
          >
            📈 Top
          </span>
        </div>
      </div>

      <div className={styles.posts}>
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : posts && posts.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {posts.map((item, index) => (
              <motion.div
                key={item.id || item.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.25, 1, 0.5, 1],
                }}
              >
                <Card item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className={styles.emptyFeed}>
            <p>No posts found in this community yet.</p>
          </div>
        )}
      </div>
      <Pagination page={page} hasPrev={hasPrev} hasNext={hasNext} />
    </div>
  );
};

export default CardList;
