const prisma = require('../utils/prisma');

const getPosts = async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const cat = req.query.cat;
  const userEmail = req.query.userEmail;

  const POST_PER_PAGE = 10;

  const query = {
    take: POST_PER_PAGE,
    skip: POST_PER_PAGE * (page - 1),
    where: {
      ...(cat && { catSlug: cat }),
      ...(userEmail && { userEmail: userEmail }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      cat: true,
      comments: true,
    },
  };

  try {
    const [posts, count] = await prisma.$transaction([
      prisma.post.findMany(query),
      prisma.post.count({ where: query.where }),
    ]);
    return res.status(200).json({ posts, count });
  } catch (err) {
    console.error('Error getting posts:', err);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};

const getPostBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const post = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      include: { user: true, comments: { include: { user: true } } },
    });

    return res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    return res.status(500).json({ message: 'Post not found!' });
  }
};

const createPost = async (req, res) => {
  const { title, desc, img, video, mediaType, slug, catSlug, userEmail } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!userEmail) {
    return res.status(401).json({ message: 'User email required!' });
  }

  try {
    // Ensure user exists in Prisma DB if created via OAuth
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { email: userEmail, name: userEmail.split('@')[0] },
    });

    // Ensure category exists
    await prisma.category.upsert({
      where: { slug: catSlug || 'style' },
      update: {},
      create: { slug: catSlug || 'style', title: catSlug || 'style' },
    });

    const post = await prisma.post.create({
      data: {
        title,
        desc: desc || '',
        img: img || null,
        video: video || null,
        mediaType: mediaType || null,
        slug: slug || `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        catSlug: catSlug || 'style',
        userEmail: user.email,
      },
    });

    return res.status(200).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    return res.status(500).json({ message: 'Failed to create post' });
  }
};

module.exports = { getPosts, getPostBySlug, createPost };
