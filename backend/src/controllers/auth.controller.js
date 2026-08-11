const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/async-handler');
const { HTTP_STATUS } = require('../constants');

// Helper to format user payload
const formatUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { user, token } = await AuthService.registerUser(req.body);
  const formattedUser = formatUser(user);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    token,
    user: formattedUser,
    data: formattedUser
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { user, token } = await AuthService.loginUser(req.body);
  const formattedUser = formatUser(user);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    token,
    user: formattedUser,
    data: formattedUser
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const formattedUser = formatUser(req.user);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    user: formattedUser,
    data: formattedUser
  });
});

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await AuthService.updateUserProfile(req.user._id, req.body);
  const formattedUser = formatUser(updatedUser);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    user: formattedUser,
    data: formattedUser
  });
});
