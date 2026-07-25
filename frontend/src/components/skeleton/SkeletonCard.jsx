import React from "react";
import styles from "./skeleton.module.css";

const SkeletonCard = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.voteSkeleton}></div>
      <div className={styles.contentSkeleton}>
        <div className={styles.headerSkeleton}>
          <div className={styles.avatarSkeleton}></div>
          <div className={styles.lineShort}></div>
        </div>
        <div className={styles.titleSkeleton}></div>
        <div className={styles.textSkeleton}></div>
        <div className={styles.mediaSkeleton}></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
