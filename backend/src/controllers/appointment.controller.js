const AppointmentService = require('../services/appointment.service');
const asyncHandler = require('../utils/async-handler');
const { HTTP_STATUS } = require('../constants');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = asyncHandler(async (req, res) => {
  const appointment = await AppointmentService.createAppointment(req.user, req.body);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: appointment,
  });
});

// @desc    Get appointments for logged-in user (patient or doctor)
// @route   GET /api/appointments
// @access  Private
exports.getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await AppointmentService.getUserAppointments(req.user, req.query.status);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await AppointmentService.getAppointmentById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: appointment,
  });
});

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await AppointmentService.updateAppointmentStatus(
    req.params.id,
    req.user,
    req.body.status,
    req.body.diagnosisNotes
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: appointment,
  });
});
