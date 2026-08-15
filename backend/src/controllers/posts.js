const prisma = require('../utils/prisma');

// Helper to parse tags array or extract hashtags from text
const extractAndUpsertTags = async (tagsArray = [], descText = '') => {
  const extractedHashtags = (descText.match(/#[\w-]+/g) || []).map((t) =>
    t.replace(/^#/, '').toLowerCase().trim()
  );

  const normalizedTags = Array.from(
    new Set(
      [...(tagsArray || []), ...extractedHashtags]
        .map((t) => typeof t === 'string' && t.replace(/^#/, '').toLowerCase().trim())
        .filter(Boolean)
    )
  );

  if (normalizedTags.length === 0) return [];

  const tagRecords = await Promise.all(
    normalizedTags.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  return tagRecords.map((t) => ({ id: t.id }));
};

const getPosts = async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const cat = req.query.cat;
  const tag = req.query.tag;
  const userEmail = req.query.userEmail;
  const sort = req.query.sort || 'new'; // 'new', 'top', 'hot'

  const POST_PER_PAGE = 10;

  const whereClause = {
    ...(cat && { catSlug: cat }),
    ...(userEmail && { userEmail: userEmail }),
    ...(tag && {
      tags: {
        some: {
          name: tag.toLowerCase(),
        },
      },
    }),
  };

  let orderBy = { createdAt: 'desc' };
  if (sort === 'top') {
    orderBy = { views: 'desc' };
  }

  try {
    const [rawPosts, count] = await prisma.$transaction([
      prisma.post.findMany({
        take: POST_PER_PAGE,
        skip: POST_PER_PAGE * (page - 1),
        where: whereClause,
        orderBy,
        include: {
          user: true,
          cat: true,
          tags: true,
          votes: true,
          bookmarks: true,
          comments: {
            select: { id: true },
          },
        },
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    // Compute net votes, vote state and bookmark status
    const posts = rawPosts.map((post) => {
      const netVotes = post.votes ? post.votes.reduce((acc, v) => acc + v.value, 0) : 0;
      let currentUserVote = 0;
      if (userEmail && post.votes) {
        const userVoteRecord = post.votes.find((v) => v.userId === userEmail || (v.user && v.user.email === userEmail));
        if (userVoteRecord) currentUserVote = userVoteRecord.value;
      }
      let isBookmarked = false;
      if (userEmail && post.bookmarks) {
        isBookmarked = post.bookmarks.some((b) => b.userEmail?.toLowerCase() === userEmail.toLowerCase());
      }
      return {
        ...post,
        netVotes,
        currentUserVote,
        isBookmarked,
      };
    });

    return res.status(200).json({ posts, count });
  } catch (err) {
    console.error('Error getting posts:', err);
    return res.status(500).json({ message: 'Something went wrong!' });
  }
};

const getPostBySlug = async (req, res) => {
  const { slug } = req.params;
  const { userEmail } = req.query;

  try {
    const post = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      include: {
        user: true,
        cat: true,
        tags: true,
        votes: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    const netVotes = post.votes.reduce((acc, v) => acc + v.value, 0);
    let currentUserVote = 0;
    if (userEmail) {
      const userVoteRecord = post.votes.find((v) => v.userId === userEmail || (v.user && v.user.email === userEmail));
      if (userVoteRecord) currentUserVote = userVoteRecord.value;
    }

    return res.status(200).json({
      ...post,
      netVotes,
      currentUserVote,
    });
  } catch (err) {
    console.error('Error fetching post:', err);
    return res.status(500).json({ message: 'Post not found!' });
  }
};

const createPost = async (req, res) => {
  const { title, desc, img, video, mediaType, slug, catSlug, userEmail, userImage, tags } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!userEmail) {
    return res.status(401).json({ message: 'User email required!' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        ...(userImage && { image: userImage }),
      },
      create: { email: userEmail, name: userEmail.split('@')[0], image: userImage || null },
    });

    const categorySlug = catSlug || 'style';
    await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: { slug: categorySlug, title: categorySlug },
    });

    const connectedTags = await extractAndUpsertTags(tags, desc || '');

    const generatedSlug =
      slug || `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const post = await prisma.post.create({
      data: {
        title,
        desc: desc || '',
        img: img || null,
        video: video || null,
        mediaType: mediaType || null,
        slug: generatedSlug,
        catSlug: categorySlug,
        userEmail: user.email,
        tags: {
          connect: connectedTags,
        },
      },
      include: {
        tags: true,
        user: true,
        cat: true,
      },
    });

    return res.status(200).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    return res.status(500).json({ message: 'Failed to create post' });
  }
};

const updatePost = async (req, res) => {
  const { slug } = req.params;
  const { title, desc, img, video, mediaType, catSlug, userEmail, tags } = req.body;

  if (!userEmail) {
    return res.status(401).json({ message: 'User email required to edit post' });
  }

  try {
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (existingPost.userEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(403).json({ message: 'Unauthorized to edit this post' });
    }

    if (catSlug) {
      await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: { slug: catSlug, title: catSlug },
      });
    }

    const connectedTags = await extractAndUpsertTags(tags, desc || '');

    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        ...(title && { title }),
        ...(desc !== undefined && { desc }),
        ...(img !== undefined && { img }),
        ...(video !== undefined && { video }),
        ...(mediaType !== undefined && { mediaType }),
        ...(catSlug && { catSlug }),
        tags: {
          set: [],
          connect: connectedTags,
        },
      },
      include: {
        user: true,
        cat: true,
        tags: true,
      },
    });

    return res.status(200).json(updatedPost);
  } catch (err) {
    console.error('Error updating post:', err);
    return res.status(500).json({ message: 'Failed to update post' });
  }
};

const votePost = async (req, res) => {
  const { slug } = req.params;
  const { userEmail, value } = req.body; // value: 1 (up), -1 (down), 0 (remove)

  if (!userEmail) {
    return res.status(401).json({ message: 'User email required for voting' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { email: userEmail, name: userEmail.split('@')[0] },
    });

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    });

    if (value === 0 || (existingVote && existingVote.value === value)) {
      // Remove vote if same value or explicitly 0
      if (existingVote) {
        await prisma.vote.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId: post.id,
            },
          },
        });
      }
    } else {
      // Upsert vote
      await prisma.vote.upsert({
        where: {
          userId_postId: {
            userId: user.id,
            postId: post.id,
          },
        },
        update: { value },
        create: {
          userId: user.id,
          postId: post.id,
          value,
        },
      });
    }

    // Get fresh total votes
    const votes = await prisma.vote.findMany({
      where: { postId: post.id },
    });

    const netVotes = votes.reduce((acc, v) => acc + v.value, 0);

    const userVoteRecord = votes.find((v) => v.userId === user.id);
    const currentUserVote = userVoteRecord ? userVoteRecord.value : 0;

    return res.status(200).json({ netVotes, currentUserVote });
  } catch (err) {
    console.error('Error processing vote:', err);
    return res.status(500).json({ message: 'Failed to process vote' });
  }
};

module.exports = { getPosts, getPostBySlug, createPost, updatePost, votePost };

