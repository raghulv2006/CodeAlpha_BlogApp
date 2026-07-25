import React from "react";
import styles from "./cardList.module.css";
import Pagination from "../pagination/Pagination";
import Card from "../card/Card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getData = async (page, cat) => {
  try {
    const res = await fetch(
      `${API_URL}/api/posts?page=${page}&cat=${cat || ""}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { posts: [], count: 0 };
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], count: 0 };
  }
};

const CardList = async ({ page, cat }) => {
  const { posts, count } = await getData(page, cat);

  const POST_PER_PAGE = 4;

  const hasPrev = POST_PER_PAGE * (page - 1) > 0;
  const hasNext = POST_PER_PAGE * (page - 1) + POST_PER_PAGE < count;

  return (
    <div className={styles.container}>
      <div className={styles.headerFeed}>
        <h1 className={styles.title}>
          {cat ? `r/${cat}` : "Popular Feed"}
        </h1>
        <div className={styles.sortBadges}>
          <span className={`${styles.sortBadge} ${styles.activeSort}`}>🔥 Hot</span>
          <span className={styles.sortBadge}>✨ New</span>
          <span className={styles.sortBadge}>📈 Top</span>
        </div>
      </div>

      <div className={styles.posts}>
        {posts && posts.length > 0 ? (
          posts.map((item) => (
            <Card item={item} key={item.id || item._id} />
          ))
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
