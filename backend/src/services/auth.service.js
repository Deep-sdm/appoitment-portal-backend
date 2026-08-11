const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const AppError = require('../utils/app-error');
const { HTTP_STATUS } = require('../constants');

class AuthService {
  /**
   * Register a new user (Patient or Doctor)
   * If registering as a Doctor, also provisions a Doctor catalog profile.
   */
  static async registerUser({ name, email, password, role, specialty, fee, experience, bio }) {
    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      throw new AppError('User already exists with this email', HTTP_STATUS.BAD_REQUEST);
    }

    const userRole = role || 'patient';
    const formattedName = userRole === 'doctor' && !name.toLowerCase().startsWith('dr.') ? `Dr. ${name}` : name;

    const user = await User.create({
      name: formattedName,
      email: cleanEmail,
      password,
      role: userRole,
    });

    // If registering as a doctor, automatically create the Doctor catalog profile
    if (userRole === 'doctor') {
      const existingDoctor = await Doctor.findOne({ email: cleanEmail });
      if (!existingDoctor) {
        await Doctor.create({
          name: formattedName,
          email: cleanEmail,
          specialty: specialty || 'General Medicine',
          fee: Number(fee) || 120,
          experience: Number(experience) || 5,
          bio: bio || 'Board-certified medical specialist committed to clinical excellence and patient care.',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM']
        });
        console.log(`Created doctor catalog entry for ${formattedName}`);
      }
    }

    const token = user.getSignedJwtToken();
    return { user, token };
  }

  /**
   * Authenticate user with email and password
   * Automatically provisions new user accounts if email is not found yet for frictionless demo/dev onboarding.
   */
  static async loginUser({ email, password, role }) {
    if (!email || !password) {
      throw new AppError('Please provide email and password', HTTP_STATUS.BAD_REQUEST);
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail }).select('+password');

    // Frictionless Auto-Registration: Create user if not registered yet
    if (!user) {
      const emailPrefix = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
      const rawName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      const isDoctorRole = cleanEmail.includes('doctor') || role === 'doctor';
      const userRole = isDoctorRole ? 'doctor' : (role || 'patient');
      const formattedName = isDoctorRole && !rawName.startsWith('Dr.') ? `Dr. ${rawName}` : rawName;

      user = await User.create({
        name: formattedName,
        email: cleanEmail,
        password: password,
        role: userRole,
      });

      if (userRole === 'doctor') {
        const existingDoctor = await Doctor.findOne({ email: cleanEmail });
        if (!existingDoctor) {
          await Doctor.create({
            name: formattedName,
            email: cleanEmail,
            specialty: 'General Medicine',
            fee: 120,
            experience: 8,
            bio: 'Board-certified medical physician focusing on patient wellness and treatment.',
            avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM']
          });
        }
      }

      console.log(`Auto-registered new ${userRole} user: ${cleanEmail}`);
    } else {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new AppError('Invalid password for this account.', HTTP_STATUS.UNAUTHORIZED);
      }
    }

    const token = user.getSignedJwtToken();
    return { user, token };
  }

  /**
   * Update user profile information
   */
  static async updateUserProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.email) user.email = updateData.email;
    if (updateData.avatar) user.avatar = updateData.avatar;
    if (updateData.phone) user.phone = updateData.phone;

    await user.save();
    return user;
  }
}

module.exports = AuthService;
