import CardList from "@/components/cardList/CardList";
import styles from "./blogPage.module.css";
import Menu from "@/components/Menu/Menu";

const BlogPage = ({ searchParams }) => {
  const page = parseInt(searchParams.page) || 1;
  const { cat } = searchParams;

  return (
    <div className={styles.container}>
      <div className={styles.categoryBanner}>
        <div className={styles.bannerBadge}>r/</div>
        <div className={styles.bannerInfo}>
          <h1 className={styles.title}>{cat || "community"}</h1>
          <p className={styles.subtitle}>Articles and discussions under the {cat} topic</p>
        </div>
      </div>
      <div className={styles.content}>
        <CardList page={page} cat={cat} />
        <Menu />
      </div>
    </div>
  );
};

export default BlogPage;
