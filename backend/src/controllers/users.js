const prisma = require('../utils/prisma');

// Get Profile details for a specific user email (Read-only, secure)
const getUserProfile = async (req, res) => {
  const { email, currentUserEmail } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'User email parameter is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        hasSeenWelcome: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Counts & Stats
    const postCount = await prisma.post.count({
      where: { userEmail: email },
    });

    const viewsAggregate = await prisma.post.aggregate({
      where: { userEmail: email },
      _sum: { views: true },
    });

    const followerCount = await prisma.follow.count({
      where: { followingId: user.id },
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: user.id },
    });

    let isFollowing = false;
    if (currentUserEmail && currentUserEmail !== email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: currentUserEmail },
        select: { id: true },
      });

      if (currentUser) {
        const followRecord = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: user.id,
            },
          },
        });
        isFollowing = !!followRecord;
      }
    }

    return res.status(200).json({
      user,
      stats: {
        postCount,
        totalViews: viewsAggregate._sum.views || 0,
        followerCount,
        followingCount,
      },
      isFollowing,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

// Update Profile
const updateUserProfile = async (req, res) => {
  const { name, bio, image } = req.body;
  // SECURITY: Use verified identity from auth middleware — NEVER trust req.body.email
  const email = req.user.email;

  if (name && typeof name !== 'string') {
    return res.status(400).json({ message: 'Invalid name value' });
  }

  if (name && name.length > 100) {
    return res.status(400).json({ message: 'Name exceeds 100 characters' });
  }

  if (bio && bio.length > 300) {
    return res.status(400).json({ message: 'Bio exceeds 300 characters' });
  }

  // Basic URL validation for image (if provided)
  if (image && typeof image === 'string' && image.length > 0) {
    try {
      const url = new URL(image);
      if (!['https:', 'http:'].includes(url.protocol)) {
        return res.status(400).json({ message: 'Image URL must use http or https' });
      }
    } catch {
      return res.status(400).json({ message: 'Invalid image URL' });
    }
  }

  try {
    const updatedUser = await prisma.user.upsert({
      where: { email },
      update: {
        ...(name && { name: name.trim() }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
      },
      create: {
        email,
        name: name ? name.trim() : email.split('@')[0],
        bio: bio || '',
        image: image || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating user profile:', err);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Toggle Follow/Unfollow
const toggleFollow = async (req, res) => {
  const { targetEmail } = req.body;
  const follower = req.user;

  if (!targetEmail) {
    return res.status(400).json({ message: 'Target user email is required' });
  }

  if (follower.email.toLowerCase() === targetEmail.toLowerCase()) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    const target = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!target) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: target.id,
        },
      },
    });

    let isFollowing = false;
    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: follower.id,
            followingId: target.id,
          },
        },
      });
      isFollowing = false;

      // Send UNFOLLOW notification to target user
      await prisma.notification.create({
        data: {
          recipientEmail: target.email.toLowerCase(),
          senderEmail: follower.email.toLowerCase(),
          senderName: follower.name || follower.email.split('@')[0],
          senderImage: follower.image || null,
          type: 'UNFOLLOW',
          message: `@${follower.name?.replace(/\s+/g, '_').toLowerCase() || follower.email.split('@')[0]} unfollowed you`,
          link: `/profile?email=${encodeURIComponent(follower.email)}`,
        },
      });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: follower.id,
          followingId: target.id,
        },
      });
      isFollowing = true;

      // Send FOLLOW notification to target user
      await prisma.notification.create({
        data: {
          recipientEmail: target.email.toLowerCase(),
          senderEmail: follower.email.toLowerCase(),
          senderName: follower.name || follower.email.split('@')[0],
          senderImage: follower.image || null,
          type: 'FOLLOW',
          message: `@${follower.name?.replace(/\s+/g, '_').toLowerCase() || follower.email.split('@')[0]} started following you`,
          link: `/profile?email=${encodeURIComponent(follower.email)}`,
        },
      });
    }

    const followerCount = await prisma.follow.count({
      where: { followingId: target.id },
    });

    return res.status(200).json({
      isFollowing,
      followerCount,
      message: isFollowing ? 'Followed user' : 'Unfollowed user',
    });
  } catch (err) {
    console.error('Error toggling follow status:', err);
    return res.status(500).json({ message: 'Failed to process follow request' });
  }
};

// Get Followers List
const getFollowers = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ followers: [] });
    }

    const records = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const followers = records.map((r) => r.follower);
    return res.status(200).json({ followers });
  } catch (err) {
    console.error('Error fetching followers:', err);
    return res.status(500).json({ message: 'Failed to fetch followers' });
  }
};

// Get Following List
const getFollowing = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ following: [] });
    }

    const records = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const following = records.map((r) => r.following);
    return res.status(200).json({ following });
  } catch (err) {
    console.error('Error fetching following list:', err);
    return res.status(500).json({ message: 'Failed to fetch following list' });
  }
};

// Dismiss Welcome Banner
const dismissWelcome = async (req, res) => {
  const user = req.user;

  try {
    await prisma.user.update({
      where: { email: user.email },
      data: { hasSeenWelcome: true },
    });

    return res.status(200).json({ success: true, hasSeenWelcome: true });
  } catch (err) {
    console.error('Error dismissing welcome:', err);
    return res.status(500).json({ message: 'Failed to dismiss welcome' });
  }
};

// Search Users by Name or Email
const searchUsers = async (req, res) => {
  const q = req.query.q || req.query.query || '';
  if (!q || !q.trim()) {
    return res.status(200).json({ users: [] });
  }

  const cleanQ = q.trim().toLowerCase().replace(/^@/, '');
  
  if (cleanQ.length < 2) {
    return res.status(200).json({ users: [] });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: cleanQ, mode: 'insensitive' } },
          { email: { contains: cleanQ, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        // SECURITY: email excluded from public search to prevent enumeration
        image: true,
        bio: true,
        _count: {
          select: {
            Post: true,
          },
        },
      },
      take: 10,
    });

    // Derive handle from name only (not email) for public display
    const safeUsers = users.map((u) => ({
      ...u,
      handle: u.name?.replace(/\s+/g, '_').toLowerCase() || 'user',
    }));

    return res.status(200).json({ users: safeUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ message: 'Failed to search users' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  dismissWelcome,
  searchUsers,
};
