const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorSpecialty: {
    type: String,
    default: 'General Physician'
  },
  doctorAvatar: {
    type: String,
    default: ''
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  date: {
    type: String, // e.g. "2026-08-15"
    required: [true, 'Please provide an appointment date']
  },
  timeSlot: {
    type: String, // e.g. "10:30 AM"
    required: [true, 'Please select a time slot']
  },
  reason: {
    type: String,
    required: [true, 'Please enter consultation reason']
  },
  type: {
    type: String,
    enum: ['in-person', 'video'],
    default: 'in-person'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
