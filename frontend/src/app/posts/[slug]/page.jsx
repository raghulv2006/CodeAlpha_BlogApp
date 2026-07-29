import Menu from "@/components/Menu/Menu";
import styles from "./singlePage.module.css";
import Image from "next/image";
import Comments from "@/components/comments/Comments";
import sanitizeHtml from "sanitize-html";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getData = async (slug) => {
  try {
    const res = await fetch(`${API_URL}/api/posts/${slug}`, {
      cache: "no-store",
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
  const { slug } = params;
  const data = await getData(slug);

  if (!data) {
    return (
      <div className={styles.notFoundContainer}>
        <h1>Article Not Found</h1>
        <p>The post you are looking for does not exist or has been removed.</p>
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
          <span className={styles.categoryBadge}>r/{data?.catSlug}</span>
          <span className={styles.viewBadge}>👁️ {data?.views || 1} views</span>
        </div>
        <h1 className={styles.title}>{data?.title}</h1>

        <div className={styles.authorRow}>
          {data?.user?.image ? (
            <div className={styles.avatarWrapper}>
              <Image src={data.user.image} alt={data.user.name || "User"} fill className={styles.avatar} />
            </div>
          ) : (
            <div className={styles.defaultAvatar}>
              {(data?.user?.name || "U")[0].toUpperCase()}
            </div>
          )}
          <div className={styles.authorDetails}>
            <span className={styles.username}>
              u/{data?.user?.name?.replace(/\s+/g, "").toLowerCase() || "anonymous"}
            </span>
            <span className={styles.date}>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Main Media Attachment (Image or Video) */}
      {data?.video ? (
        <div className={styles.mediaContainer}>
          <video src={data.video} controls className={styles.videoPlayer} autoPlay={false} />
        </div>
      ) : data?.img ? (
        <div className={styles.mediaContainer}>
          <Image src={data.img} alt={data.title} fill className={styles.heroImage} priority />
        </div>
      ) : null}

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
              }),
            }}
          />

          <section className={styles.commentsSection}>
            <Comments postSlug={slug} />
          </section>
        </main>
        <Menu />
      </div>
    </div>
  );
};

export default SinglePage;
