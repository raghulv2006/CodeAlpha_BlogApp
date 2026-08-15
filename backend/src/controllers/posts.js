const prisma = require('../utils/prisma');

// TTL-aware view throttle — tracks ip+slug with a timestamp
// Prevents the same IP from inflating views more than once per hour per post
const viewedPosts = new Map();
const VIEW_THROTTLE_MS = 60 * 60 * 1000; // 1 hour

// Prune expired entries every 30 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of viewedPosts.entries()) {
    if (now - ts > VIEW_THROTTLE_MS) viewedPosts.delete(key);
  }
}, 30 * 60 * 1000);

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
  const page = Math.min(Math.max(parseInt(req.query.page || '1'), 1), 1000);
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
        select: {
          id: true,
          createdAt: true,
          slug: true,
          title: true,
          desc: true,
          img: true,
          video: true,
          mediaType: true,
          views: true,
          catSlug: true,
          user: {
            select: {
              name: true,
              image: true,
              email: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
          votes: {
            select: {
              value: true,
              userId: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
          bookmarks: userEmail
            ? {
                where: {
                  userEmail: userEmail.toLowerCase(),
                },
                select: {
                  id: true,
                },
              }
            : false,
        },
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    // Compute net votes, vote state and bookmark status efficiently
    const posts = rawPosts.map((post) => {
      const netVotes = post.votes ? post.votes.reduce((acc, v) => acc + v.value, 0) : 0;
      let currentUserVote = 0;
      if (userEmail && post.votes) {
        const userVoteRecord = post.votes.find(
          (v) => v.userId === userEmail || (v.user && v.user.email === userEmail)
        );
        if (userVoteRecord) currentUserVote = userVoteRecord.value;
      }
      const isBookmarked = post.bookmarks && post.bookmarks.length > 0;
      const commentCount = post._count?.comments || 0;

      const { votes, _count, ...rest } = post;
      return {
        ...rest,
        netVotes,
        currentUserVote,
        isBookmarked,
        commentCount,
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
    const viewKey = `${req.ip}-${slug}`;
    let post;

    const lastViewed = viewedPosts.get(viewKey);
    const shouldCountView = !lastViewed || (Date.now() - lastViewed > VIEW_THROTTLE_MS);

    if (shouldCountView) {
      viewedPosts.set(viewKey, Date.now());
      post = await prisma.post.update({
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
    } else {
      post = await prisma.post.findUnique({
        where: { slug },
        include: {
          user: true,
          cat: true,
          tags: true,
          votes: true,
          comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        },
      });
    }

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
  const { title, desc, img, video, mediaType, slug, catSlug, tags } = req.body;
  const user = req.user; // Set by auth middleware

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (title.length > 300) {
    return res.status(400).json({ message: 'Title exceeds 300 characters' });
  }

  if (desc && desc.length > 100000) {
    return res.status(400).json({ message: 'Content exceeds maximum allowed length' });
  }

  if (tags && tags.length > 20) {
    return res.status(400).json({ message: 'Maximum 20 tags allowed' });
  }

  try {
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
  const { title, desc, img, video, mediaType, catSlug, tags } = req.body;
  const user = req.user;

  if (title && title.length > 300) {
    return res.status(400).json({ message: 'Title exceeds 300 characters' });
  }

  if (desc && desc.length > 100000) {
    return res.status(400).json({ message: 'Content exceeds maximum allowed length' });
  }

  if (tags && tags.length > 20) {
    return res.status(400).json({ message: 'Maximum 20 tags allowed' });
  }

  try {
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (existingPost.userEmail.toLowerCase() !== user.email.toLowerCase()) {
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
  const { value } = req.body; // value: 1 (up), -1 (down), 0 (remove)
  const user = req.user;

  try {

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

// Delete Post with User Authorization Check
const deletePost = async (req, res) => {
  const { slug } = req.params;
  const user = req.user;

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, slug: true, userEmail: true },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Access Control Guard: Only post author can delete
    if (post.userEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this post" });
    }

    // Delete post
    await prisma.post.delete({
      where: { id: post.id },
    });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

module.exports = { getPosts, getPostBySlug, createPost, updatePost, votePost, deletePost };

