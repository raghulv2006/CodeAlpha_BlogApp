import Link from "next/link";
import React from "react";
import styles from "./menuCategories.module.css";

const categories = [
  { slug: "style", name: "r/style", icon: "🎨" },
  { slug: "fashion", name: "r/fashion", icon: "👗" },
  { slug: "food", name: "r/food", icon: "🍔" },
  { slug: "travel", name: "r/travel", icon: "✈️" },
  { slug: "culture", name: "r/culture", icon: "🎭" },
  { slug: "coding", name: "r/coding", icon: "💻" },
];

const MenuCategories = () => {
  return (
    <div className={styles.categoryList}>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/blog?cat=${cat.slug}`}
          className={styles.categoryItem}
        >
          <span className={styles.icon}>{cat.icon}</span>
          <span className={styles.name}>{cat.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default MenuCategories;
