const prisma = require('../utils/prisma');

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

const getCategories = async (req, res) => {
  try {
    // Ensure default categories exist in database
    await Promise.all(
      DEFAULT_CATEGORIES.map((cat) =>
        prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: { slug: cat.slug, title: cat.title },
        })
      )
    );

    const categories = await prisma.category.findMany({
      orderBy: { title: 'asc' },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

const createCategory = async (req, res) => {
  const { title, slug, img } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Category title is required' });
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

    return res.status(200).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Failed to create category' });
  }
};

module.exports = { getCategories, createCategory };

