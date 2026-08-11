const NotificationService = require('../services/notification.service');
const asyncHandler = require('../utils/async-handler');
const { HTTP_STATUS } = require('../constants');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const result = await NotificationService.getUserNotifications(req.user._id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result.notifications,
    unreadCount: result.unreadCount,
  });
});

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await NotificationService.markAllAsRead(req.user._id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'All notifications marked as read',
  });
});
