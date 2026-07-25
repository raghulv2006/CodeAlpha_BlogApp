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
  const { desc, postSlug, userEmail } = req.body;

  if (!userEmail) {
    return res.status(401).json({ message: 'User email required!' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { email: userEmail, name: userEmail.split('@')[0] },
    });

    const comment = await prisma.comment.create({
      data: {
        desc,
        postSlug,
        userEmail: user.email,
      },
    });

    return res.status(200).json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};

module.exports = { getComments, createComment };
