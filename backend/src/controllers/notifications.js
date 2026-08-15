const prisma = require('../utils/prisma');

// Get User Notifications
const getNotifications = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientEmail: email.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        recipientEmail: email.toLowerCase(),
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
  const { email, notificationId } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, recipientEmail: email.toLowerCase() },
        data: { read: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { recipientEmail: email.toLowerCase(), read: false },
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
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    await prisma.notification.deleteMany({
      where: { recipientEmail: email.toLowerCase() },
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
