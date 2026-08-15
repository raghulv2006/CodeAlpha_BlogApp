import CardList from "@/components/cardList/CardList";
import styles from "./blogPage.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getInitialPosts(page, cat, tag) {
  try {
    const res = await fetch(
      `${API_URL}/api/posts?page=${page}&cat=${cat || ""}&tag=${tag || ""}&sort=hot`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

const BlogPage = async ({ searchParams }) => {
  const page = parseInt(searchParams?.page) || 1;
  const cat = searchParams?.cat || "";
  const tag = searchParams?.tag || "";

  const initialPosts = await getInitialPosts(page, cat, tag);

  return (
    <div className={styles.container}>
      <div className={styles.categoryBanner}>
        <div className={styles.bannerBadge}>{tag ? "#" : "🏷️"}</div>
        <div className={styles.bannerInfo}>
          <h1 className={styles.title}>
            {tag ? `#${tag}` : cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : "All Communities"}
          </h1>
          <p className={styles.subtitle}>
            Articles and discussions under {tag ? `#${tag}` : cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : "all communities"}
          </p>
        </div>
      </div>
      <div className={styles.content}>
        <CardList page={page} cat={cat} tag={tag} initialData={initialPosts} />
      </div>
    </div>
  );
};

export default BlogPage;
