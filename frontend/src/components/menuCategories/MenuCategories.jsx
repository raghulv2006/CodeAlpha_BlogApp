"use client";

import Link from "next/link";
import React from "react";
import styles from "./menuCategories.module.css";
import { motion } from "framer-motion";

const categories = [
  { slug: "style", name: "Style", icon: "🎨" },
  { slug: "fashion", name: "Fashion", icon: "👗" },
  { slug: "food", name: "Food", icon: "🍔" },
  { slug: "travel", name: "Travel", icon: "✈️" },
  { slug: "culture", name: "Culture", icon: "🎭" },
  { slug: "coding", name: "Coding", icon: "💻" },
];

const MenuCategories = () => {
  return (
    <div className={styles.categoryList}>
      {categories.map((cat, idx) => (
        <motion.div
          key={cat.slug}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href={`/blog?cat=${cat.slug}`}
            className={`${styles.categoryItem} glass-lite`}
          >
            <span className={styles.icon}>{cat.icon}</span>
            <span className={styles.name}>{cat.name}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default MenuCategories;
