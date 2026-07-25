import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./menuPosts.module.css";

const sampleTrending = [
  {
    slug: "mastering-nextjs-13-app-router",
    cat: "coding",
    title: "Mastering Next.js 13 App Router & Prisma Architecture",
    author: "u/raghul",
    date: "Jul 24",
    img: "/p1.jpeg",
  },
  {
    slug: "future-of-web-development-2026",
    cat: "style",
    title: "The Future of Web Development & Dark Mode UI Trends",
    author: "u/niraj",
    date: "Jul 22",
    img: "/culture.png",
  },
  {
    slug: "best-developer-coffee-spots",
    cat: "food",
    title: "Top Coffee Roasters for Night Owls & Developers",
    author: "u/preveen",
    date: "Jul 20",
    img: "/food.png",
  },
];

const MenuPosts = ({ withImage }) => {
  return (
    <div className={styles.items}>
      {sampleTrending.map((item, idx) => (
        <Link href="/" key={idx} className={styles.item}>
          {withImage && (
            <div className={styles.imageContainer}>
              <Image src={item.img} alt="" fill className={styles.image} />
            </div>
          )}
          <div className={styles.textContainer}>
            <span className={styles.categoryPill}>{item.cat}</span>
            <h3 className={styles.postTitle}>{item.title}</h3>
            <div className={styles.detail}>
              <span className={styles.username}>{item.author}</span>
              <span className={styles.date}>• {item.date}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MenuPosts;
