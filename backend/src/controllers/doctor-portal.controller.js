const DoctorPortalService = require('../services/doctor-portal.service');
const asyncHandler = require('../utils/async-handler');
const { HTTP_STATUS } = require('../constants');

// @desc    Get dashboard metrics for doctor portal
// @route   GET /api/doctor-portal/stats
// @access  Private (Doctor)
exports.getDoctorDashboardStats = asyncHandler(async (req, res) => {
  const stats = await DoctorPortalService.getDashboardStats(req.user);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: stats,
  });
});

// @desc    Get appointments list for doctor
// @route   GET /api/doctor-portal/appointments
// @access  Private (Doctor)
exports.getDoctorAppointments = asyncHandler(async (req, res) => {
  const appointments = await DoctorPortalService.getDoctorAppointments(req.user);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    Update patient visit status and diagnosis notes
// @route   PATCH /api/doctor-portal/appointment/:id
// @access  Private (Doctor)
exports.updateAppointmentDetails = asyncHandler(async (req, res) => {
  const Appointment = require('../models/appointment.model');
  const { status, notes } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Appointment not found' });
  }

  if (status) appointment.status = status;
  if (notes) appointment.notes = notes;

  await appointment.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: appointment,
  });
});

// @desc    Add holiday / unavailable date for doctor
// @route   POST /api/doctor-portal/holiday
// @access  Private (Doctor)
exports.addDoctorHoliday = asyncHandler(async (req, res) => {
  const holidays = await DoctorPortalService.addDoctorHoliday(req.user, req.body.date);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Marked ${req.body.date} as Doctor Holiday`,
    holidays,
  });
});

// @desc    Remove holiday date for doctor
// @route   DELETE /api/doctor-portal/holiday/:date
// @access  Private (Doctor)
exports.removeDoctorHoliday = asyncHandler(async (req, res) => {
  const holidays = await DoctorPortalService.removeDoctorHoliday(req.user, req.params.date);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Removed holiday for ${req.params.date}`,
    holidays,
  });
});
