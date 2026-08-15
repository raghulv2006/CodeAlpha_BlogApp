import Link from "next/link";
import styles from "./homepage.module.css";
import Featured from "@/components/featured/Featured";
import CategoryList from "@/components/categoryList/CategoryList";
import CardList from "@/components/cardList/CardList";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getInitialData(page, cat, tag) {
  try {
    const [postsRes, catRes] = await Promise.all([
      fetch(`${API_URL}/api/posts?page=${page}&cat=${cat || ""}&tag=${tag || ""}&sort=hot`, {
        next: { revalidate: 30 },
      }),
      fetch(`${API_URL}/api/categories`, {
        next: { revalidate: 60 },
      }),
    ]);

    const initialPosts = postsRes.ok ? await postsRes.json() : null;
    const initialCategories = catRes.ok ? await catRes.json() : null;

    return { initialPosts, initialCategories };
  } catch (err) {
    console.error("Error prefetching homepage data:", err);
    return { initialPosts: null, initialCategories: null };
  }
}

export default async function Home({ searchParams }) {
  const page = parseInt(searchParams?.page) || 1;
  const cat = searchParams?.cat || "";
  const tag = searchParams?.tag || "";

  const { initialPosts, initialCategories } = await getInitialData(page, cat, tag);

  return (
    <div className={styles.container}>
      <Featured />
      <CategoryList initialCategories={initialCategories} />
      <div className={styles.content}>
        <CardList page={page} cat={cat} tag={tag} initialData={initialPosts} />
      </div>
    </div>
  );
}
