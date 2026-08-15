"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "@/app/posts/[slug]/singlePage.module.css";

const SinglePostMedia = ({ slug, video, img, title }) => {
  if (!video && !img) return null;

  return (
    <motion.div
      className={styles.mediaContainer}
      layoutId={`post-media-${slug}`}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      {video ? (
        <video src={video} controls className={styles.videoPlayer} autoPlay={false} />
      ) : (
        <img src={img} alt={title} className={styles.heroImage} />
      )}
    </motion.div>
  );
};

export default SinglePostMedia;
