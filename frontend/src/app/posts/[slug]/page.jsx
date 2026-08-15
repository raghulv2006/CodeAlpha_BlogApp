import styles from "./singlePage.module.css";
import Image from "next/image";
import Link from "next/link";
import Comments from "@/components/comments/Comments";
import SinglePostMedia from "@/components/singlePostMedia/SinglePostMedia";
import EditArticleButton from "@/components/editArticleButton/EditArticleButton";
import BookmarkArticleButton from "@/components/bookmarkArticleButton/BookmarkArticleButton";
import sanitizeHtml from "sanitize-html";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getData = async (slug) => {
  try {
    const res = await fetch(`${API_URL}/api/posts/${slug}`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    return null;
  }
};

const SinglePage = async ({ params }) => {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  const data = await getData(slug);

  if (!data) {
    return (
      <div className={styles.notFoundContainer}>
        <h1>Article Not Found</h1>
        <p>The post you are looking for does not exist or has been removed.</p>
        <Link href="/" style={{ color: "#38bdf8", textDecoration: "none", marginTop: 16, display: "inline-block" }}>
          ← Return to Home
        </Link>
      </div>
    );
  }

  const formattedDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.metaBadgeRow}>
          <Link href={`/blog?cat=${data?.catSlug}`} className={styles.categoryBadge} style={{ textDecoration: "none" }}>
            {data?.catSlug ? data.catSlug.charAt(0).toUpperCase() + data.catSlug.slice(1) : ""}
          </Link>
          <span className={styles.viewBadge}>👁️ {data?.views || 1} views</span>
          <span className={styles.viewBadge}>▲ {data?.netVotes || 0} votes</span>
          <EditArticleButton slug={slug} userEmail={data?.userEmail} />
        </div>
        <h1 className={styles.title}>{data?.title}</h1>

        <div className={styles.authorRow}>
          <Link href={`/profile?email=${encodeURIComponent(data?.userEmail || "")}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
            {data?.user?.image ? (
              <div className={styles.avatarWrapper}>
                <img src={data.user.image} alt={data.user.name || "User"} className={styles.avatar} />
              </div>
            ) : (
              <div className={styles.defaultAvatar}>
                {(data?.user?.name || data?.userEmail || "U")[0].toUpperCase()}
              </div>
            )}
            <div className={styles.authorDetails}>
              <span className={styles.username}>
                @{data?.user?.name?.replace(/\s+/g, "_").toLowerCase() || data?.userEmail?.split("@")[0] || "user"}
              </span>
              <span className={styles.date}>{formattedDate}</span>
            </div>
          </Link>
        </div>

        {/* Tags */}
        {data?.tags && data.tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {data.tags.map((t) => (
              <Link
                key={t.id || t.name}
                href={`/blog?tag=${t.name}`}
                style={{ textDecoration: "none", fontSize: "0.85rem", color: "#38bdf8", background: "rgba(56, 189, 248, 0.12)", padding: "4px 12px", borderRadius: 16 }}
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Main Media Attachment (Image or Video) with Shared Morph Transition */}
      <SinglePostMedia slug={slug} video={data?.video} img={data?.img} title={data?.title} />

      <div className={styles.contentLayout}>
        <main className={styles.mainArticle}>
          <article
            className={styles.articleBody}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(data?.desc || "", {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "video", "source", "iframe", "h1", "h2", "u", "s"]),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ["src", "alt", "width", "height"],
                  video: ["src", "controls", "width", "height", "autoplay", "muted", "loop"],
                  source: ["src", "type"],
                  iframe: ["src", "width", "height", "allowfullscreen"],
                },
                allowedSchemes: ["https", "http", "mailto"],
                allowedSchemesByTag: {
                  img: ["https", "http", "data"],
                  iframe: ["https"], // Only allow https iframes to prevent javascript: and data: URIs
                  a: ["https", "http", "mailto"],
                },
              }),
            }}
          />

          {/* Bookmark Option Banner above Discussion and Comments */}
          <BookmarkArticleButton slug={slug} initialBookmarked={data?.isBookmarked} />

          <section className={styles.commentsSection}>
            <Comments postSlug={slug} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default SinglePage;
