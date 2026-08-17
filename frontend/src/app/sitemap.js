const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://botblogs.app';

export default async function sitemap() {
  const staticRoutes = [
    {
      url: `${CLIENT_URL}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${CLIENT_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${CLIENT_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let postRoutes = [];
  try {
    const res = await fetch(`${API_URL}/api/posts?page=1`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const posts = data?.posts || [];
      postRoutes = posts.map((post) => ({
        url: `${CLIENT_URL}/posts/${post.slug}`,
        lastModified: post.createdAt ? new Date(post.createdAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('Failed to fetch posts for sitemap:', e.message);
  }

  let categoryRoutes = [];
  try {
    const res = await fetch(`${API_URL}/api/categories`, { next: { revalidate: 86400 } });
    if (res.ok) {
      const categories = await res.json();
      if (Array.isArray(categories)) {
        categoryRoutes = categories.map((cat) => ({
          url: `${CLIENT_URL}/blog?cat=${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        }));
      }
    }
  } catch (e) {
    console.error('Failed to fetch categories for sitemap:', e.message);
  }

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
