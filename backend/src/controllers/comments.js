const prisma = require('../utils/prisma');

const getComments = async (req, res) => {
  const { postSlug } = req.query;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        ...(postSlug && typeof postSlug === 'string' && { postSlug: postSlug.trim() }),
      },
      include: {
        // SECURITY FIX (H-01): Minimal public user fields
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      take: 100, // SECURITY FIX (H-01): Bound max comments per fetch to prevent payload exhaustion
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};

const createComment = async (req, res) => {
  const { desc, postSlug } = req.body;
  const user = req.user;

  // SECURITY FIX (C-02): Validate postSlug parameter
  if (!postSlug || typeof postSlug !== 'string' || !postSlug.trim() || postSlug.trim().length > 300) {
    return res.status(400).json({ message: 'Valid postSlug is required (max 300 characters)' });
  }

  if (!desc || typeof desc !== 'string' || !desc.trim()) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  if (desc.length > 10000) {
    return res.status(400).json({ message: 'Comment exceeds maximum allowed length' });
  }

  try {
    // SECURITY FIX (C-02): Verify post actually exists to avoid orphaned comments and FK crashes
    const post = await prisma.post.findUnique({
      where: { slug: postSlug.trim() },
      select: { userEmail: true, title: true },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found. Cannot comment on non-existent post.' });
    }

    const comment = await prisma.comment.create({
      data: {
        desc: desc.trim(),
        postSlug: postSlug.trim(),
        userEmail: user.email,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Trigger Notification for Post Author if commenter is not post author
    if (post.userEmail && post.userEmail.toLowerCase() !== user.email.toLowerCase()) {
      await prisma.notification.create({
        data: {
          recipientEmail: post.userEmail.toLowerCase(),
          senderEmail: user.email.toLowerCase(),
          senderName: user.name || user.email.split('@')[0],
          senderImage: user.image || null,
          type: 'COMMENT',
          message: `@${user.name?.replace(/\s+/g, '_').toLowerCase() || user.email.split('@')[0]} commented on your post "${post.title}"`,
          link: `/posts/${postSlug.trim()}`,
        },
      });
    }

    return res.status(200).json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};

module.exports = { getComments, createComment };
