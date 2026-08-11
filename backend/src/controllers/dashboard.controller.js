const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');

// @desc    Get dashboard metrics & summary
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments({ user: userId });
    const upcomingAppointments = await Appointment.countDocuments({
      user: userId,
      status: { $in: ['confirmed', 'pending'] }
    });
    const completedAppointments = await Appointment.countDocuments({
      user: userId,
      status: 'completed'
    });
    const cancelledAppointments = await Appointment.countDocuments({
      user: userId,
      status: 'cancelled'
    });

    // Recent upcoming appointments for user
    const recentAppointments = await Appointment.find({ user: userId })
      .populate('doctor', 'name specialty avatar rating location')
      .sort({ createdAt: -1 })
      .limit(5);

    // Doctor specialties count
    const specialtyDistribution = await Doctor.aggregate([
      { $group: { _id: "$specialty", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalDoctors,
          totalAppointments,
          upcomingAppointments,
          completedAppointments,
          cancelledAppointments
        },
        recentAppointments,
        specialtyDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
