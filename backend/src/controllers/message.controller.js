const Message = require('../models/message.model');
const Appointment = require('../models/appointment.model');

// Get message history for a specific chat room
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(100);
    return res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error('Error fetching room messages:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get conversations for the logged in patient/doctor based on booked appointments
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let appointments = [];
    if (userRole === 'doctor') {
      // Find appointments where doctor email/user matches or doctor model matches
      appointments = await Appointment.find({ status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });
    } else {
      appointments = await Appointment.find({ user: userId, status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });
    }

    // Build chat conversation list from real booked appointments
    const conversationsMap = new Map();

    for (const appt of appointments) {
      const roomId = `room_${appt._id}`;
      const partnerName = userRole === 'doctor' ? appt.patientName : appt.doctorName;
      const partnerSpecialty = userRole === 'doctor' ? 'Patient' : (appt.doctorSpecialty || 'Specialist');
      const partnerAvatar = userRole === 'doctor' ? '' : appt.doctorAvatar;

      // Get last message in room if any
      const lastMsg = await Message.findOne({ roomId }).sort({ createdAt: -1 });

      conversationsMap.set(roomId, {
        roomId,
        appointmentId: appt._id,
        doctorName: appt.doctorName,
        doctorSpecialty: appt.doctorSpecialty,
        doctorAvatar: appt.doctorAvatar,
        patientName: appt.patientName,
        partnerName,
        partnerSpecialty,
        partnerAvatar,
        appointmentDate: appt.date,
        appointmentTime: appt.timeSlot,
        appointmentStatus: appt.status,
        lastMessage: lastMsg ? lastMsg.text : `Booked for ${appt.date} at ${appt.timeSlot}`,
        time: lastMsg ? lastMsg.createdAt : appt.createdAt,
        isBot: false
      });
    }

    const conversations = Array.from(conversationsMap.values());

    return res.json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send message via REST API
exports.sendMessage = async (req, res) => {
  try {
    const { roomId, appointmentId, text, recipientId } = req.body;
    const senderId = req.user.id;
    const senderName = req.user.name;
    const senderRole = req.user.role;

    if (!roomId || !text) {
      return res.status(400).json({ success: false, message: 'Room ID and message text required' });
    }

    const newMsg = await Message.create({
      roomId,
      appointmentId,
      senderId,
      senderName,
      senderRole,
      recipientId,
      text
    });

    // Broadcast via global Socket.io if attached to app
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('receive_message', newMsg);
    }

    return res.status(201).json({ success: true, data: newMsg });
  } catch (error) {
    console.error('Error sending message via HTTP:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
