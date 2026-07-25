import React from "react";
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

const getData = async () => {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return fallbackCategories;
    }

    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : fallbackCategories;
  } catch (error) {
    return fallbackCategories;
  }
};

const CategoryList = async () => {
  const categories = await getData();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Explore Communities</h2>
      <div className={styles.categories}>
        {categories.map((item) => (
          <Link
            href={`/blog?cat=${item.slug}`}
            className={styles.category}
            key={item.id || item._id || item.slug}
          >
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
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
