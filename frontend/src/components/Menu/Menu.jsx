"use client";

import React, { useState } from "react";
import styles from "./menu.module.css";
import MenuPosts from "../menuPosts/MenuPosts";
import MenuCategories from "../menuCategories/MenuCategories";
import { motion, AnimatePresence } from "framer-motion";

const Menu = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={styles.container}>
      <div className={styles.stickyWrapper}>
        <div className={styles.sidebarHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.communityIcon}>🌐</span>
            <h2 className={styles.mainTitle}>BotBlogs Hub</h2>
          </div>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? "▲" : "▼"}
          </button>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className={styles.contentBody}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>🔥 Trending Discussions</h3>
                <MenuPosts withImage={false} />
              </div>

              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>🏷️ Popular Communities</h3>
                <MenuCategories />
              </div>

              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>⭐ Editor&apos;s Choice</h3>
                <MenuPosts withImage={true} />
              </div>

              <div className={styles.communityInfoCard}>
                <h4 className={styles.infoTitle}>About BotBlogs</h4>
                <p className={styles.infoDesc}>
                  Welcome to BotBlogs — a developer-focused, community-driven blogging platform. Share stories, explore technology, and engage in discussions.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default Menu;
