const prisma = require('../utils/prisma');
const { appCache } = require('../utils/cache');

// Toggle Bookmark for a Post
const toggleBookmark = async (req, res) => {
  const { slug } = req.params;
  const user = req.user;

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userEmail_postId: {
          userEmail: user.email.toLowerCase(),
          postId: post.id,
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.deleteMany({
        where: {
          userEmail: user.email.toLowerCase(),
          postId: post.id,
        },
      });
      return res.status(200).json({ isBookmarked: false, message: 'Bookmark removed' });
    } else {
      await prisma.bookmark.create({
        data: {
          userEmail: user.email.toLowerCase(),
          postId: post.id,
        },
      });
      return res.status(200).json({ isBookmarked: true, message: 'Post bookmarked successfully' });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return res.status(500).json({ message: 'Failed to update bookmark state' });
  }
};

// Fetch User's Bookmarks
const getUserBookmarks = async (req, res) => {
  const user = req.user;

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userEmail: user.email.toLowerCase() },
      include: {
        post: {
          include: {
            user: { select: { name: true, image: true, email: true } },
            tags: true,
            comments: { select: { id: true } },
            votes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const posts = bookmarks.map((b) => ({
      ...b.post,
      isBookmarked: true,
      netVotes: b.post.votes ? b.post.votes.reduce((acc, v) => acc + v.value, 0) : 0,
    }));

    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return res.status(500).json({ message: 'Failed to fetch bookmarks' });
  }
};

// Fetch Trending Hashtags
const getTrendingHashtags = async (req, res) => {
  const cacheKey = 'tags:trending';
  const cached = appCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({ tags: cached });
  }

  try {
    const tags = await prisma.tag.findMany({
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
      take: 8,
    });

    appCache.set(cacheKey, tags, 60000); // 60s TTL
    return res.status(200).json({ tags });
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    return res.status(500).json({ message: 'Failed to fetch trending tags' });
  }
};

// Fetch Suggested Accounts
const getSuggestedUsers = async (req, res) => {
  const { userEmail } = req.query;
  const cacheKey = `users:suggested:${userEmail ? userEmail.toLowerCase() : 'all'}`;
  const cached = appCache.get(cacheKey);
  if (cached) {
    return res.status(200).json({ users: cached });
  }

  try {
    let users = await prisma.user.findMany({
      where: {
        ...(userEmail && { NOT: { email: userEmail.toLowerCase() } }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        _count: {
          select: { followedBy: true },
        },
      },
      take: 5,
    });

    appCache.set(cacheKey, users, 60000); // 60s TTL
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return res.status(500).json({ message: 'Failed to fetch suggested users' });
  }
};

module.exports = {
  toggleBookmark,
  getUserBookmarks,
  getTrendingHashtags,
  getSuggestedUsers,
};
