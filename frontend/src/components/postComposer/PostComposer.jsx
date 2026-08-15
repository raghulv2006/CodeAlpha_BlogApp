"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./postComposer.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/AuthContext";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const fetcher = (url) => fetch(url).then((res) => res.json());

const PostComposer = ({ isEdit = false, initialPost = null }) => {
  const { status, data: session } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title || "");
  const [desc, setDesc] = useState(initialPost?.desc || "");
  const [media, setMedia] = useState(initialPost?.img || "");
  const [videoUrl, setVideoUrl] = useState(initialPost?.video || "");
  const [mediaType, setMediaType] = useState(initialPost?.mediaType || "");
  const [catSlug, setCatSlug] = useState(initialPost?.catSlug || "style");
  const [tags, setTags] = useState(
    initialPost?.tags ? initialPost.tags.map((t) => t.name) : []
  );

  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // New Category Creation Inline State
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  const fileInputRef = useRef(null);

  // Default system communities
  const defaultCommunities = React.useMemo(
    () => [
      { slug: "coding", title: "Coding", isDefault: true },
      { slug: "technology", title: "Technology", isDefault: true },
      { slug: "gaming", title: "Gaming", isDefault: true },
      { slug: "style", title: "Style", isDefault: true },
      { slug: "fashion", title: "Fashion", isDefault: true },
      { slug: "food", title: "Food", isDefault: true },
      { slug: "travel", title: "Travel", isDefault: true },
      { slug: "culture", title: "Culture", isDefault: true },
      { slug: "entertainment", title: "Entertainment", isDefault: true },
      { slug: "news", title: "News", isDefault: true },
    ],
    []
  );

  // Fetch categories dynamically from database
  const { data: categoriesData, mutate: mutateCategories } = useSWR(
    `${API_URL}/api/categories`,
    fetcher
  );

  // Merge default & user-created communities (eliminating duplicates)
  const categories = React.useMemo(() => {
    const map = new Map();
    defaultCommunities.forEach((c) => map.set(c.slug, c));
    if (Array.isArray(categoriesData)) {
      categoriesData.forEach((c) => {
        const isDefault = defaultCommunities.some((d) => d.slug === c.slug);
        map.set(c.slug, {
          id: c.id,
          slug: c.slug,
          title: c.title || c.slug,
          isDefault,
        });
      });
    }
    return Array.from(map.values());
  }, [categoriesData, defaultCommunities]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Upload file logic with XHR to track progress
  const uploadFile = (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/api/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploadProgress(100);
      if (xhr.status === 200) {
        try {
          const resData = JSON.parse(xhr.responseText);
          if (resData.mediaType === "video") {
            setVideoUrl(resData.url);
            setMedia("");
            setMediaType("video");
          } else {
            setMedia(resData.url);
            setVideoUrl("");
            setMediaType("image");
          }
        } catch (e) {
          alert("Error parsing media response.");
        }
      } else {
        alert("Failed to upload file.");
      }
      setTimeout(() => setUploading(false), 300);
    };

    xhr.onerror = () => {
      alert("Error uploading media file.");
      setUploading(false);
    };

    xhr.send(formData);
  };

  // Drag and Drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  // Hashtag Chip Logic
  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      const cleaned = tagInput.replace(/^#/, "").toLowerCase().trim();
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Create new Category inline
  const handleCreateCategory = async () => {
    if (!newCatTitle.trim()) return;
    setCreatingCat(true);

    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newCatTitle }),
      });

      if (res.ok) {
        const created = await res.json();
        setCatSlug(created.slug);
        setNewCatTitle("");
        setShowNewCatInput(false);
        mutateCategories();
      } else {
        alert("Failed to create community.");
      }
    } catch (err) {
      console.error("Failed to create category:", err);
    } finally {
      setCreatingCat(false);
    }
  };

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title for your post");
      return;
    }

    setSubmitting(true);
    const userEmail = session?.user?.email || "anonymous@botblogs.dev";

    try {
      const endpoint = isEdit
        ? `${API_URL}/api/posts/${initialPost.slug}`
        : `${API_URL}/api/posts`;
      const method = isEdit ? "PUT" : "POST";

      const bodyData = {
        title,
        desc,
        img: media || null,
        video: videoUrl || null,
        mediaType: mediaType || null,
        catSlug: catSlug || "style",
        userEmail,
        tags,
      };

      if (!isEdit) {
        bodyData.slug = slugify(title) + "-" + Date.now().toString().slice(-4);
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        const postData = await res.json();
        router.push(`/posts/${postData.slug}`);
      } else {
        alert(`Failed to ${isEdit ? "update" : "create"} post.`);
      }
    } catch (err) {
      console.error("Submit post error:", err);
      alert("An error occurred while saving post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className={`${styles.container} glass`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEdit ? "✏️ Edit Post" : "📸 Create New Post"}
        </h1>
        <p className={styles.subtitle}>
          {isEdit
            ? "Modify your article title, media, text, or community"
            : "Share media, stories, and code with the BotBlogs community"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        {/* Step 1 & 2: Media Upload & Inline Preview with Motion Slide */}
        <AnimatePresence mode="wait">
          {!media && !videoUrl ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                className={styles.hiddenInput}
                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
              />
              <div className={styles.uploadIcon}>📁</div>
              <div className={styles.uploadTitle}>
                Drag & drop photo or video here, or click to browse
              </div>
              <div className={styles.uploadSub}>
                Supports PNG, JPG, GIF, MP4, WebM (Cloudinary integration)
              </div>

              {uploading && (
                <div className={styles.progressContainer}>
                  <div className={styles.progressBarBg}>
                    <motion.div
                      className={styles.progressBarFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    />
                  </div>
                  <div className={styles.progressText}>
                    Uploading media... {uploadProgress}%
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="previewCard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={styles.previewCard}
            >
              <button
                type="button"
                className={styles.removeMediaBtn}
                onClick={() => {
                  setMedia("");
                  setVideoUrl("");
                  setMediaType("");
                }}
              >
                ✕ Replace Media
              </button>
              {mediaType === "video" || videoUrl ? (
                <video src={videoUrl} controls className={styles.previewMedia} />
              ) : (
                <img src={media} alt="Preview" className={styles.previewMedia} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title Input */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Post Title</label>
          <input
            type="text"
            placeholder="An interesting title..."
            className={styles.textInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Caption / Description Body */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Caption & Body Content</label>
          <textarea
            placeholder="Write your story, caption, or thoughts here... (HTML or plain text supported, write #hashtags inline)"
            className={`${styles.textInput} ${styles.textarea}`}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        {/* Community & Hashtag Chips Row */}
        <div className={styles.metaRow}>
          {/* Community Picker */}
          <div className={styles.inputGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className={styles.label}>Community / Category</label>
              <button
                type="button"
                className={styles.smallBtn}
                onClick={() => setShowNewCatInput(!showNewCatInput)}
              >
                + New Community
              </button>
            </div>

            {showNewCatInput ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.newCatBox}
              >
                <input
                  type="text"
                  placeholder="e.g. dev-tools"
                  className={styles.textInput}
                  value={newCatTitle}
                  onChange={(e) => setNewCatTitle(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className={styles.smallBtn}
                  onClick={handleCreateCategory}
                  disabled={creatingCat}
                >
                  {creatingCat ? "Creating..." : "Save"}
                </button>
              </motion.div>
            ) : (
              <>
                <select
                  className={styles.select}
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                >
                  {categories.map((c) => {
                    const formattedTitle = (c.title || c.slug).charAt(0).toUpperCase() + (c.title || c.slug).slice(1);
                    return (
                      <option key={c.id || c.slug} value={c.slug}>
                        {formattedTitle} {c.isDefault ? "(Default)" : "👤 (User Created)"}
                      </option>
                    );
                  })}
                </select>

                <div className={styles.communitySection}>
                  <span className={styles.communityLabel}>
                    Select or browse communities:
                  </span>
                  <div className={styles.communityPillsRow}>
                    {categories.map((c) => {
                      const isActive = catSlug === c.slug;
                      const formattedTitle = (c.title || c.slug).charAt(0).toUpperCase() + (c.title || c.slug).slice(1);
                      return (
                        <button
                          key={c.id || c.slug}
                          type="button"
                          className={`${styles.communityPill} ${
                            isActive ? styles.communityPillActive : ""
                          }`}
                          onClick={() => setCatSlug(c.slug)}
                        >
                          <span>{formattedTitle}</span>
                          {!c.isDefault && (
                            <span className={styles.userCreatedTag}>User</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Hashtag Chips Input */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Hashtags</label>
            <div className={styles.tagContainer}>
              <AnimatePresence>
                {tags.map((t) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className={styles.tagChip}
                  >
                    #{t}
                    <span className={styles.chipRemove} onClick={() => removeTag(t)}>
                      ✕
                    </span>
                  </motion.span>
                ))}
              </AnimatePresence>
              <input
                type="text"
                placeholder="Type tag & press enter..."
                className={styles.tagInput}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className={styles.submitBtn}
          disabled={submitting || uploading}
        >
          {submitting
            ? "Publishing..."
            : isEdit
            ? "Update Post →"
            : "Publish Post →"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default PostComposer;
