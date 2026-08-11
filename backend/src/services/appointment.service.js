const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const User = require('../models/user.model');
const NotificationService = require('./notification.service');
const AppError = require('../utils/app-error');
const { HTTP_STATUS, APPOINTMENT_STATUS } = require('../constants');

class AppointmentService {
  /**
   * Create a new appointment after verifying doctor availability & holidays
   */
  static async createAppointment(user, { doctorId, date, timeSlot, reason, type, notes }) {
    if (!doctorId || !date || !timeSlot || !reason) {
      throw new AppError('Please provide doctorId, date, timeSlot, and reason', HTTP_STATUS.BAD_REQUEST);
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new AppError('Selected doctor not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if doctor is on holiday on the selected date
    if (doctor.holidays && doctor.holidays.includes(date)) {
      throw new AppError(`${doctor.name} is on holiday on ${date}. Please select another consultation date.`, HTTP_STATUS.BAD_REQUEST);
    }

    const appointment = await Appointment.create({
      user: user._id,
      doctor: doctor._id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorAvatar: doctor.avatar,
      patientName: user.name,
      patientEmail: user.email,
      date,
      timeSlot,
      reason,
      type: type || 'in-person',
      notes: notes || '',
      status: APPOINTMENT_STATUS.CONFIRMED,
    });

    // Notify Doctor User if account exists
    try {
      const doctorUser = await User.findOne({ email: doctor.email });
      if (doctorUser) {
        await NotificationService.createNotification({
          recipient: doctorUser._id,
          sender: user._id,
          title: 'New Appointment Booking',
          message: `${user.name} has scheduled a ${type || 'consultation'} for ${date} at ${timeSlot}.`,
          type: 'appointment_booked',
          link: '/appointments'
        });
      }
    } catch (err) {
      console.error('Error creating doctor notification:', err.message);
    }

    return appointment;
  }

  /**
   * Retrieve appointments for a specific user (handles Patient and Doctor roles)
   */
  static async getUserAppointments(userObj, statusFilter) {
    const userId = userObj._id || userObj;
    let query = {};

    if (userObj.role === 'doctor') {
      const docProfile = await Doctor.findOne({ email: userObj.email });
      if (docProfile) {
        query = {
          $or: [{ doctor: docProfile._id }, { user: userId }]
        };
      } else {
        query = { user: userId };
      }
    } else {
      query = { user: userId };
    }

    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }

    return await Appointment.find(query)
      .populate('doctor', 'name specialty avatar location fee phone email')
      .sort({ createdAt: -1 });
  }

  /**
   * Get single appointment details
   */
  static async getAppointmentById(apptId, userId, userRole) {
    const appointment = await Appointment.findById(apptId)
      .populate('doctor')
      .populate('user', 'name email');

    if (!appointment) {
      throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
    }

    if (appointment.user._id.toString() !== userId.toString() && userRole !== 'admin' && userRole !== 'doctor') {
      throw new AppError('Not authorized to view this appointment', HTTP_STATUS.FORBIDDEN);
    }

    return appointment;
  }

  /**
   * Update appointment status (Doctor Accept / Reject / Complete) and notify Patient
   */
  static async updateAppointmentStatus(apptId, currentUser, newStatus, diagnosisNotes) {
    const appointment = await Appointment.findById(apptId);
    if (!appointment) {
      throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
    }

    appointment.status = newStatus;
    if (diagnosisNotes) {
      appointment.diagnosisNotes = diagnosisNotes;
    }
    await appointment.save();

    // Trigger Notification to Patient
    try {
      let notifTitle = 'Appointment Update';
      let notifMsg = `Your appointment status has been updated to ${newStatus}.`;
      let notifType = 'system';

      if (newStatus === APPOINTMENT_STATUS.CONFIRMED) {
        notifTitle = 'Appointment Accepted ✅';
        notifMsg = `${appointment.doctorName} has accepted & confirmed your appointment for ${appointment.date} at ${appointment.timeSlot}.`;
        notifType = 'appointment_confirmed';
      } else if (newStatus === APPOINTMENT_STATUS.CANCELLED) {
        notifTitle = 'Appointment Cancelled ❌';
        notifMsg = `${appointment.doctorName} rejected/cancelled your appointment scheduled for ${appointment.date}.`;
        notifType = 'appointment_cancelled';
      } else if (newStatus === APPOINTMENT_STATUS.COMPLETED) {
        notifTitle = 'Appointment Completed 🩺';
        notifMsg = `${appointment.doctorName} has completed your consultation visit on ${appointment.date}.`;
        notifType = 'appointment_completed';
      }

      await NotificationService.createNotification({
        recipient: appointment.user,
        sender: currentUser._id,
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        link: '/appointments'
      });
    } catch (err) {
      console.error('Error creating patient notification:', err.message);
    }

    return appointment;
  }
}

module.exports = AppointmentService;
