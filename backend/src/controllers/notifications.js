const prisma = require('../utils/prisma');

// Get User Notifications
const getNotifications = async (req, res) => {
  const user = req.user;

  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientEmail: user.email.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        recipientEmail: user.email.toLowerCase(),
        read: false,
      },
    });

    return res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark Notifications as Read
const markNotificationsRead = async (req, res) => {
  const { notificationId } = req.body;
  const user = req.user;

  // SECURITY FIX (H-03): Validate notificationId format if supplied
  if (notificationId !== undefined && (typeof notificationId !== 'string' || !notificationId.trim() || notificationId.trim().length > 100)) {
    return res.status(400).json({ message: 'Invalid notificationId' });
  }

  try {
    if (notificationId && notificationId.trim()) {
      await prisma.notification.updateMany({
        where: { id: notificationId.trim(), recipientEmail: user.email.toLowerCase() },
        data: { read: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { recipientEmail: user.email.toLowerCase(), read: false },
        data: { read: true },
      });
    }

    return res.status(200).json({ message: 'Notifications marked as read' });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    return res.status(500).json({ message: 'Failed to update notifications' });
  }
};

// Clear All Notifications
const clearNotifications = async (req, res) => {
  const user = req.user;

  try {
    await prisma.notification.deleteMany({
      where: { recipientEmail: user.email.toLowerCase() },
    });

    return res.status(200).json({ message: 'All notifications cleared' });
  } catch (err) {
    console.error('Error clearing notifications:', err);
    return res.status(500).json({ message: 'Failed to clear notifications' });
  }
};

module.exports = {
  getNotifications,
  markNotificationsRead,
  clearNotifications,
};
