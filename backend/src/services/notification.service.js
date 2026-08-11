const Notification = require('../models/notification.model');
const AppError = require('../utils/app-error');
const { HTTP_STATUS } = require('../constants');

class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification({ recipient, sender, title, message, type, link }) {
    if (!recipient || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender: sender || null,
      title,
      message,
      type: type || 'system',
      link: link || '/appointments',
    });

    return notification;
  }

  /**
   * Get all notifications for a specific user
   */
  static async getUserNotifications(userId) {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return { notifications, unreadCount };
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications for a user as read
   */
  static async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    return { success: true };
  }
}

module.exports = NotificationService;
