const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a doctor name'],
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
  },
  experience: {
    type: Number,
    required: true,
    default: 5
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 120
  },
  fee: {
    type: Number,
    required: true,
    default: 100
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: '+1 (555) 000-0000'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'
  },
  bio: {
    type: String,
    default: 'Experienced medical specialist dedicated to delivering compassionate patient care.'
  },
  availableDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  availableSlots: {
    type: [String],
    default: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM']
  },
  holidays: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: 'Medical Center, Suite 402'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
