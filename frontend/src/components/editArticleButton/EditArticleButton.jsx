"use client";

import Link from "next/link";
import { useSession } from "@/context/AuthContext";

const EditArticleButton = ({ slug, userEmail }) => {
  const { data: session } = useSession();

  const isAuthor =
    session?.user?.email &&
    userEmail &&
    session.user.email.toLowerCase() === userEmail.toLowerCase();

  if (!isAuthor) return null;

  return (
    <Link
      href={`/posts/${slug}/edit`}
      style={{
        marginLeft: "auto",
        textDecoration: "none",
        fontSize: "0.85rem",
        color: "#38bdf8",
        background: "rgba(56,189,248,0.1)",
        padding: "4px 12px",
        borderRadius: 16,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      ✏️ Edit Article
    </Link>
  );
};

export default EditArticleButton;
