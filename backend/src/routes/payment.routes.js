const express = require('express');
const {
  createPaymentIntent,
  verifyAndRecordPayment,
  getPaymentHistory
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // Require JWT authentication

router.post('/create-intent', createPaymentIntent);
router.post('/verify', verifyAndRecordPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
