"use client";

import Image from "next/image";
import styles from "./writePage.module.css";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.bubble.css";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Dynamic import for ReactQuill to support Next.js SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const WritePage = () => {
  const { status, data: session } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [media, setMedia] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [catSlug, setCatSlug] = useState("style");

  useEffect(() => {
    const upload = async () => {
      if (!file) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.mediaType === "video") {
            setVideoUrl(data.url);
            setMediaType("video");
          } else {
            setMedia(data.url);
            setMediaType("image");
          }
        } else {
          console.error("Upload failed");
        }
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
      }
    };

    file && upload();
  }, [file]);

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async () => {
    if (!title) {
      alert("Please enter a title for your post");
      return;
    }

    const userEmail = session?.user?.email || "anonymous@botblogs.dev";

    const res = await fetch(`${API_URL}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        desc: value,
        img: media || null,
        video: videoUrl || null,
        mediaType: mediaType || null,
        slug: slugify(title) + "-" + Date.now().toString().slice(-4),
        catSlug: catSlug || "style",
        userEmail,
      }),
    });

    if (res.status === 200) {
      const data = await res.json();
      router.push(`/posts/${data.slug}`);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Title"
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        className={styles.select}
        value={catSlug}
        onChange={(e) => setCatSlug(e.target.value)}
      >
        <option value="style">style</option>
        <option value="fashion">fashion</option>
        <option value="food">food</option>
        <option value="culture">culture</option>
        <option value="travel">travel</option>
        <option value="coding">coding</option>
      </select>

      <div className={styles.editor}>
        <button className={styles.button} onClick={() => setOpen(!open)}>
          <Image src="/plus.png" alt="Add" width={16} height={16} />
        </button>
        {open && (
          <div className={styles.add}>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: "none" }}
            />
            <button className={styles.addButton}>
              <label htmlFor="image" style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Image src="/image.png" alt="Upload Image" width={16} height={16} />
              </label>
            </button>
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: "none" }}
            />
            <button className={styles.addButton}>
              <label htmlFor="video" style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Image src="/video.png" alt="Upload Video" width={16} height={16} />
              </label>
            </button>
          </div>
        )}
        {uploading && <div className={styles.uploadingBadge}>Uploading to Cloudinary...</div>}
        {media && (
          <div className={styles.previewContainer}>
            <img src={media} alt="Preview" className={styles.mediaPreview} />
          </div>
        )}
        {videoUrl && (
          <div className={styles.previewContainer}>
            <video src={videoUrl} controls className={styles.mediaPreview} />
          </div>
        )}
        <ReactQuill
          className={styles.textArea}
          theme="bubble"
          value={value}
          onChange={setValue}
          placeholder="Tell your story..."
        />
      </div>
      <button className={styles.publish} onClick={handleSubmit} disabled={uploading}>
        {uploading ? "Uploading Media..." : "Publish Post"}
      </button>
    </div>
  );
};

export default WritePage;
