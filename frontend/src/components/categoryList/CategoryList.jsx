"use client";

import React from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import styles from "./categoryList.module.css";
import Link from "next/link";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fallbackCategories = [
  { id: "1", slug: "style", title: "Style", img: "/style.png" },
  { id: "2", slug: "fashion", title: "Fashion", img: "/fashion.png" },
  { id: "3", slug: "food", title: "Food", img: "/food.png" },
  { id: "4", slug: "travel", title: "Travel", img: "/travel.png" },
  { id: "5", slug: "culture", title: "Culture", img: "/culture.png" },
  { id: "6", slug: "coding", title: "Coding", img: "/coding.png" },
];

const fetcher = (url) => fetch(url).then((res) => res.json());

const CategoryList = () => {
  const { data } = useSWR(`${API_URL}/api/categories`, fetcher, {
    fallbackData: fallbackCategories,
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const categories = Array.isArray(data) && data.length > 0 ? data : fallbackCategories;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Explore Communities</h2>
      <div className={styles.categories}>
        {categories.map((item, index) => (
          <motion.div
            key={item.id || item.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={`/blog?cat=${item.slug}`} className={styles.category}>
              {item.img && (
                <Image
                  src={item.img}
                  alt={item.title}
                  width={24}
                  height={24}
                  className={styles.image}
                />
              )}
              <span className={styles.categoryName}>r/{item.title.toLowerCase()}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
