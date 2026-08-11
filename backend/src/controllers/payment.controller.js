const Payment = require('../models/payment.model');
const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');

// @desc    Create payment intent / order ID
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { doctorId, gateway = 'stripe', currency = 'USD' } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const amount = doctor.fee || 100;
    const orderId = `${gateway.toLowerCase()}_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    res.status(200).json({
      success: true,
      data: {
        orderId,
        amount,
        currency: gateway === 'razorpay' ? 'INR' : currency,
        gateway,
        doctorName: doctor.name,
        clientSecret: `sec_${gateway}_${Date.now()}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify and record successful payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyAndRecordPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      doctorId,
      gateway,
      transactionId,
      amount,
      currency,
      paymentMethod
    } = req.body;

    if (!appointmentId || !doctorId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appointmentId, doctorId, and transactionId'
      });
    }

    const doctor = await Doctor.findById(doctorId);

    const payment = await Payment.create({
      user: req.user._id,
      appointment: appointmentId,
      doctor: doctorId,
      doctorName: doctor ? doctor.name : 'Specialist Doctor',
      amount: amount || (doctor ? doctor.fee : 100),
      currency: currency || (gateway === 'razorpay' ? 'INR' : 'USD'),
      gateway: gateway || 'stripe',
      paymentMethod: paymentMethod || 'Card',
      transactionId,
      status: 'paid'
    });

    // Update appointment status if needed
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'confirmed'
    });

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history for user
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('doctor', 'name specialty avatar')
      .populate('appointment', 'date timeSlot reason type')
      .sort({ createdAt: -1 });

    const totalSpent = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalSpent,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
