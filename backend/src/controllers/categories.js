const prisma = require('../utils/prisma');
const { appCache } = require('../utils/cache');

const DEFAULT_CATEGORIES = [
  { slug: 'style', title: 'Style' },
  { slug: 'fashion', title: 'Fashion' },
  { slug: 'food', title: 'Food' },
  { slug: 'travel', title: 'Travel' },
  { slug: 'culture', title: 'Culture' },
  { slug: 'coding', title: 'Coding' },
  { slug: 'technology', title: 'Technology' },
  { slug: 'gaming', title: 'Gaming' },
  { slug: 'entertainment', title: 'Entertainment' },
  { slug: 'news', title: 'News' },
];

const CATEGORIES_CACHE_KEY = 'categories:all';

const invalidateCategoriesCache = () => {
  appCache.del(CATEGORIES_CACHE_KEY);
};

const getCategories = async (req, res) => {
  const cached = appCache.get(CATEGORIES_CACHE_KEY);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    let categories = await prisma.category.findMany({
      orderBy: { title: 'asc' },
    });

    if (categories.length === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({ slug: cat.slug, title: cat.title })),
        skipDuplicates: true,
      });
      categories = await prisma.category.findMany({ orderBy: { title: 'asc' } });
    }

    appCache.set(CATEGORIES_CACHE_KEY, categories, 60000);
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

const createCategory = async (req, res) => {
  const { title, slug, img } = req.body;

  if (!title || typeof title !== 'string' || !title.trim() || title.trim().length > 50) {
    return res.status(400).json({ message: 'Category title is required (max 50 characters)' });
  }

  const categorySlug = (slug || title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!categorySlug) {
    return res.status(400).json({ message: 'Invalid category title/slug' });
  }

  try {
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {
        title: title.trim(),
        ...(img && { img }),
      },
      create: {
        slug: categorySlug,
        title: title.trim(),
        img: img || null,
      },
    });

    // Invalidate categories cache so fresh list is immediately returned to all clients
    invalidateCategoriesCache();

    return res.status(200).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Failed to create category' });
  }
};

module.exports = { getCategories, createCategory, invalidateCategoriesCache };

