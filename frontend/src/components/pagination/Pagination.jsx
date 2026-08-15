"use client";

import React from "react";
import styles from "./pagination.module.css";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";

const Pagination = ({ page, hasPrev, hasNext }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <motion.button
        whileHover={{ scale: hasPrev ? 1.03 : 1 }}
        whileTap={{ scale: hasPrev ? 0.96 : 1 }}
        className={styles.button}
        disabled={!hasPrev}
        onClick={() => handlePageChange(page - 1)}
      >
        ← Previous Page
      </motion.button>
      <span className={styles.pageBadge}>Page {page}</span>
      <motion.button
        whileHover={{ scale: hasNext ? 1.03 : 1 }}
        whileTap={{ scale: hasNext ? 0.96 : 1 }}
        disabled={!hasNext}
        className={styles.button}
        onClick={() => handlePageChange(page + 1)}
      >
        Next Page →
      </motion.button>
    </div>
  );
};

export default Pagination;
