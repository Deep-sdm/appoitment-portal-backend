const Doctor = require('../models/doctor.model');
const User = require('../models/user.model');

// Initial seed doctors data
const sampleDoctors = [
  {
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    experience: 12,
    rating: 4.9,
    reviewsCount: 184,
    fee: 150,
    email: "doctor@medibook.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    bio: "Board-certified cardiologist specializing in preventive cardiology and heart health management.",
    location: "Heart & Vascular Pavilion, Suite 301",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]
  },
  {
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    experience: 15,
    rating: 4.8,
    reviewsCount: 142,
    fee: 175,
    email: "michael.chen@medibook.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    bio: "Expert neurologist focused on headache disorders, movement disorders, and neuro-rehabilitation.",
    location: "Neuroscience Center, Floor 5",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableSlots: ["10:00 AM", "01:30 PM", "03:30 PM"]
  },
  {
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    experience: 9,
    rating: 4.95,
    reviewsCount: 210,
    fee: 120,
    email: "emily.rodriguez@medibook.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://images.unsplash.com/photo-1594824813571-24a698370597?q=80&w=400&auto=format&fit=crop",
    bio: "Compassionate pediatrician dedicated to infant, child, and adolescent wellness.",
    location: "Children's Health Clinic, Suite 102",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableSlots: ["08:30 AM", "10:30 AM", "01:00 PM", "03:00 PM"]
  },
  {
    name: "Dr. James Wilson",
    specialty: "Dermatology",
    experience: 11,
    rating: 4.7,
    reviewsCount: 98,
    fee: 140,
    email: "james.wilson@medibook.com",
    phone: "+1 (555) 567-8901",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop",
    bio: "Specialist in cosmetic and medical dermatology, skin cancer screenings, and laser therapies.",
    location: "Dermatology & Skin Center, Suite 205",
    availableDays: ["Monday", "Wednesday", "Thursday"],
    availableSlots: ["09:30 AM", "11:30 AM", "02:30 PM", "04:30 PM"]
  },
  {
    name: "Dr. Priya Patel",
    specialty: "Orthopedics",
    experience: 14,
    rating: 4.88,
    reviewsCount: 165,
    fee: 160,
    email: "priya.patel@medibook.com",
    phone: "+1 (555) 678-9012",
    avatar: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=400&auto=format&fit=crop",
    bio: "Orthopedic surgeon specializing in sports injuries, joint replacements, and arthroscopic procedures.",
    location: "Orthopedic & Spine Institute, Wing B",
    availableDays: ["Tuesday", "Wednesday", "Friday"],
    availableSlots: ["09:00 AM", "11:00 AM", "02:00 PM"]
  },
  {
    name: "Dr. Robert Taylor",
    specialty: "General Medicine",
    experience: 20,
    rating: 4.92,
    reviewsCount: 310,
    fee: 100,
    email: "robert.taylor@medibook.com",
    phone: "+1 (555) 789-0123",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=400&auto=format&fit=crop",
    bio: "Primary care physician focusing on holistic family care, wellness checkups, and chronic disease management.",
    location: "Primary Care Wellness Hub, Suite 100",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableSlots: ["08:00 AM", "10:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"]
  }
];

// Helper to seed doctors & demo user accounts if empty
exports.seedDoctorsIfEmpty = async () => {
  try {
    const count = await Doctor.countDocuments();
    if (count === 0) {
      await Doctor.insertMany(sampleDoctors);
      console.log('Seeded sample doctors to MongoDB database successfully.');
    }

    // Seed demo doctor user account if not existing
    const doctorUserExists = await User.findOne({ email: 'doctor@medibook.com' });
    if (!doctorUserExists) {
      await User.create({
        name: 'Dr. Sarah Jenkins',
        email: 'doctor@medibook.com',
        password: 'password123',
        role: 'doctor',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop'
      });
      console.log('Created demo doctor user account: doctor@medibook.com / password123');
    }

    // Seed demo patient user account if not existing
    const patientUserExists = await User.findOne({ email: 'patient@medibook.com' });
    if (!patientUserExists) {
      await User.create({
        name: 'John Doe',
        email: 'patient@medibook.com',
        password: 'password123',
        role: 'patient',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
      });
      console.log('Created demo patient user account: patient@medibook.com / password123');
    }
  } catch (error) {
    console.error('Error seeding doctors:', error.message);
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
  try {
    const { specialty, search } = req.query;
    let query = {};

    if (specialty && specialty !== 'All') {
      query.specialty = { $regex: specialty, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(query).sort({ rating: -1 });
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create doctor
// @route   POST /api/doctors
// @access  Private / Admin
exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
