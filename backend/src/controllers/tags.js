const prisma = require('../utils/prisma');

const getTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      take: 20,
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
    });

    const formatted = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      postCount: tag._count.posts,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

module.exports = { getTags };
