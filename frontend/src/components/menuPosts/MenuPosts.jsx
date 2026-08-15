"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import useSWR from "swr";
import styles from "./menuPosts.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const fetcher = (url) => fetch(url).then((res) => res.json());

const fallbackPosts = [
  {
    slug: "mastering-nextjs-14-architecture",
    catSlug: "coding",
    title: "Mastering Next.js 14 App Router & Prisma Architecture",
    userEmail: "raghul@botblogs.dev",
    createdAt: new Date().toISOString(),
    img: "/p1.jpeg",
  },
  {
    slug: "future-of-web-development-2026",
    catSlug: "style",
    title: "The Future of Web Development & Modern UI Trends",
    userEmail: "creator@botblogs.dev",
    createdAt: new Date().toISOString(),
    img: "/culture.png",
  },
];

const MenuPosts = ({ withImage }) => {
  const { data } = useSWR(`${API_URL}/api/posts?sort=top&page=1`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const posts = data?.posts && data.posts.length > 0 ? data.posts.slice(0, 3) : fallbackPosts;

  return (
    <div className={styles.items}>
      {posts.map((item, idx) => {
        const formattedDate = item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "Recent";
        const authorName = item.user?.name || item.userEmail?.split("@")[0] || "author";

        return (
          <Link href={`/posts/${item.slug}`} key={item.id || idx} className={styles.item}>
            {withImage && (item.img || item.video) && (
              <div className={styles.imageContainer}>
                {item.img ? (
                  <img src={item.img} alt={item.title} className={styles.image} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#1e293b", borderRadius: 8 }} />
                )}
              </div>
            )}
            <div className={styles.textContainer}>
              <span className={styles.categoryPill}>{item.catSlug || item.cat}</span>
              <h3 className={styles.postTitle}>{item.title}</h3>
              <div className={styles.detail}>
                <span className={styles.username}>u/{authorName}</span>
                <span className={styles.date}>• {formattedDate}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default MenuPosts;
