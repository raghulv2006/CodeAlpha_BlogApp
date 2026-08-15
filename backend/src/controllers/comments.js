const prisma = require('../utils/prisma');

const getComments = async (req, res) => {
  const { postSlug } = req.query;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        ...(postSlug && { postSlug }),
      },
      include: { user: true },
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

  if (!desc || !desc.trim()) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  if (desc.length > 10000) {
    return res.status(400).json({ message: 'Comment exceeds maximum allowed length' });
  }

  try {

    const comment = await prisma.comment.create({
      data: {
        desc,
        postSlug,
        userEmail: user.email,
      },
    });

    // Trigger Notification for Post Author
    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { userEmail: true, title: true },
    });

    if (post?.userEmail && post.userEmail.toLowerCase() !== user.email.toLowerCase()) {
      await prisma.notification.create({
        data: {
          recipientEmail: post.userEmail.toLowerCase(),
          senderEmail: user.email.toLowerCase(),
          senderName: user.name || user.email.split('@')[0],
          senderImage: user.image || null,
          type: 'COMMENT',
          message: `@${user.name?.replace(/\s+/g, '_').toLowerCase() || user.email.split('@')[0]} commented on your post "${post.title}"`,
          link: `/posts/${postSlug}`,
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
