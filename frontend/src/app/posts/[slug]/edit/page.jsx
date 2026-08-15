"use client";

import React, { useEffect, useState } from "react";
import PostComposer from "@/components/postComposer/PostComposer";
import { useParams } from "next/navigation";
import { useSession } from "@/context/AuthContext";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const EditPostPage = () => {
  const params = useParams();
  const slug = params?.slug;
  const { data: session, status } = useSession();

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/api/posts/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load post");
        return res.json();
      })
      .then((data) => {
        setPostData(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || status === "loading") {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
        Loading post details...
      </div>
    );
  }

  if (error || !postData) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "#ef4444" }}>
        Post not found or failed to load.
      </div>
    );
  }

  const isAuthor =
    session?.user?.email &&
    postData?.userEmail &&
    session.user.email.toLowerCase() === postData.userEmail.toLowerCase();

  if (!isAuthor) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "48px auto",
          padding: 32,
          textAlign: "center",
          background: "#18181b",
          border: "1px solid #ef4444",
          borderRadius: 16,
          color: "#f87171",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>⛔ Access Denied</h2>
        <p style={{ color: "#cbd5e1", marginBottom: 20 }}>
          Only the original author of this post (
          <strong>u/{postData.userEmail?.split("@")[0]}</strong>) has permission to edit it.
        </p>
        <Link
          href={`/posts/${slug}`}
          style={{
            display: "inline-block",
            padding: "8px 20px",
            background: "#38bdf8",
            color: "#0f172a",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Return to Article
        </Link>
      </div>
    );
  }

  return <PostComposer isEdit={true} initialPost={postData} />;
};

export default EditPostPage;
