const prisma = require('../utils/prisma');

// Get Profile details for a specific user email
const getUserProfile = async (req, res) => {
  const { email, currentUserEmail, image } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'User email parameter is required' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email },
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
      // Create user if not exists yet
      user = await prisma.user.upsert({
        where: { email },
        update: {
          ...(image && { image }),
        },
        create: {
          email,
          name: email.split('@')[0],
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
    } else if (image && (!user.image || user.image !== image)) {
      // Auto-sync image if provided and changed
      user = await prisma.user.update({
        where: { email },
        data: { image },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          createdAt: true,
        },
      });
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
  const { email, name, bio, image } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const updatedUser = await prisma.user.upsert({
      where: { email },
      update: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
      },
      create: {
        email,
        name: name || email.split('@')[0],
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
  const { followerEmail, targetEmail } = req.body;

  if (!followerEmail || !targetEmail) {
    return res.status(400).json({ message: 'Follower and target user emails are required' });
  }

  if (followerEmail === targetEmail) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    const follower = await prisma.user.upsert({
      where: { email: followerEmail },
      update: {},
      create: { email: followerEmail, name: followerEmail.split('@')[0] },
    });

    const target = await prisma.user.upsert({
      where: { email: targetEmail },
      update: {},
      create: { email: targetEmail, name: targetEmail.split('@')[0] },
    });

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
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: follower.id,
          followingId: target.id,
        },
      });
      isFollowing = true;
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
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }

  try {
    await prisma.user.upsert({
      where: { email },
      update: { hasSeenWelcome: true },
      create: { email, name: email.split('@')[0], hasSeenWelcome: true },
    });

    return res.status(200).json({ success: true, hasSeenWelcome: true });
  } catch (err) {
    console.error('Error dismissing welcome:', err);
    return res.status(500).json({ message: 'Failed to dismiss welcome' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  dismissWelcome,
};
