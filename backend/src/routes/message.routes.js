const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getRoomMessages,
  getUserConversations,
  sendMessage
} = require('../controllers/message.controller');

router.get('/conversations/my', protect, getUserConversations);
router.get('/room/:roomId', protect, getRoomMessages);
router.post('/send', protect, sendMessage);

module.exports = router;
