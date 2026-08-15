const prisma = require('../utils/prisma');

// Toggle Bookmark for a Post
const toggleBookmark = async (req, res) => {
  const { slug } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(401).json({ message: 'User email is required' });
  }

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
          userEmail: userEmail.toLowerCase(),
          postId: post.id,
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return res.status(200).json({ isBookmarked: false, message: 'Bookmark removed' });
    } else {
      await prisma.bookmark.create({
        data: {
          userEmail: userEmail.toLowerCase(),
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
  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userEmail: userEmail.toLowerCase() },
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

    return res.status(200).json({ tags });
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    return res.status(500).json({ message: 'Failed to fetch trending tags' });
  }
};

// Fetch Suggested Accounts
const getSuggestedUsers = async (req, res) => {
  const { userEmail } = req.query;

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
