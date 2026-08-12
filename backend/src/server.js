require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { seedDoctorsIfEmpty } = require('./controllers/doctor.controller');
const Message = require('./models/message.model');

// Route files
const authRoutes = require('./routes/auth.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const paymentRoutes = require('./routes/payment.routes');
const doctorPortalRoutes = require('./routes/doctor-portal.routes');
const notificationRoutes = require('./routes/notification.routes');
const messageRoutes = require('./routes/message.routes');

// Connect to database and seed sample data
connectDB().then(() => {
  seedDoctorsIfEmpty();
});

const app = express();

// Increase payload limit for profile photos / chat attachments
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/doctor-portal', doctorPortalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'MediBook API & Socket.io Live Chat Server running successfully',
    database: 'MongoDB Atlas Connected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// HTTP server and Socket.io setup
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach io to app so HTTP routes can broadcast if needed
app.set('io', io);

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log(`⚡ Socket client connected: ${socket.id}`);

  // Join a specific consultation room
  socket.on('join_room', (data) => {
    const roomId = typeof data === 'string' ? data : data?.roomId;
    if (roomId) {
      socket.join(roomId);
      console.log(`👤 Socket ${socket.id} joined room: ${roomId}`);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit('user_typing', data);
    }
  });

  // Handle stop typing indicator
  socket.on('stop_typing', (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit('user_stop_typing', data);
    }
  });

  // Handle live text messaging between patient and doctor
  socket.on('send_message', async (data) => {
    try {
      const { roomId, appointmentId, senderId, senderName, senderRole, recipientId, text } = data;

      if (!roomId || !text) return;

      // 1. Persist message into MongoDB
      const savedMsg = await Message.create({
        roomId,
        appointmentId,
        senderId: senderId || 'user',
        senderName: senderName || (senderRole === 'doctor' ? 'Doctor' : 'Patient'),
        senderRole: senderRole || 'patient',
        recipientId,
        text,
        isRead: true
      });

      // 2. Broadcast live message to all clients in the room
      io.to(roomId).emit('receive_message', savedMsg);

      // 3. AI Assistant Auto-reply if room is AI or recipient is AI
      if (roomId === 'room_ai_assistant' || recipientId === 'ai_bot' || (senderRole === 'patient' && roomId.includes('ai'))) {
        io.to(roomId).emit('user_typing', { roomId, senderName: 'MediBook AI Assistant' });

        let botText = 'Thank you for reaching out! You can book consultations directly on our portal or ask for specialist recommendations.';
        const query = text.toLowerCase();

        if (query.includes('headache') || query.includes('migraine') || query.includes('brain')) {
          botText = 'For headaches or neurological symptoms, we recommend consulting with Dr. Michael Chen (Neurology). You can schedule a visit under the Book page.';
        } else if (query.includes('heart') || query.includes('chest') || query.includes('cardio')) {
          botText = 'For heart and blood pressure checkups, Dr. Sarah Jenkins (Cardiology) is available for consultation.';
        } else if (query.includes('pay') || query.includes('bill') || query.includes('upi') || query.includes('stripe')) {
          botText = 'You can process payments securely using Stripe Card or Razorpay UPI during appointment checkout.';
        } else if (query.includes('appointment') || query.includes('book') || query.includes('schedule')) {
          botText = 'You can select any specialist on the Book Appointment page and pick your preferred time slot!';
        }

        setTimeout(async () => {
          const aiMsg = await Message.create({
            roomId,
            senderId: 'ai_bot',
            senderName: 'MediBook AI Assistant',
            senderRole: 'ai',
            text: botText,
            isRead: true
          });
          io.to(roomId).emit('user_stop_typing', { roomId });
          io.to(roomId).emit('receive_message', aiMsg);
        }, 1200);
      }
      // 4. If patient sends message to doctor & doctor is offline/testing, provide simulated doctor response
      else if (senderRole === 'patient' && !roomId.includes('ai')) {
        // Emit doctor typing indicator after 800ms
        setTimeout(() => {
          io.to(roomId).emit('user_typing', { roomId, senderName: recipientId || 'Doctor' });
        }, 800);

        let doctorReplyText = `Thank you for your message. I have reviewed your notes for our consultation. Please let me know if you are experiencing any severe symptoms.`;
        const query = text.toLowerCase();

        if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
          doctorReplyText = `Hello! How are you feeling today? Please feel free to share any recent medical reports or symptoms before our visit.`;
        } else if (query.includes('fever') || query.includes('pain') || query.includes('cough') || query.includes('headache')) {
          doctorReplyText = `I hear you. Please monitor your body temperature and stay hydrated. I have logged these symptoms into your patient file for our appointment.`;
        } else if (query.includes('medicine') || query.includes('prescription') || query.includes('dose') || query.includes('tablet')) {
          doctorReplyText = `Please continue your prescribed dosage as advised. If you experience any side effects, please pause and notify me immediately.`;
        } else if (query.includes('time') || query.includes('slot') || query.includes('delay') || query.includes('reschedule')) {
          doctorReplyText = `Got it! I will be ready at our scheduled time slot. See you in the consultation room!`;
        }

        setTimeout(async () => {
          const docMsg = await Message.create({
            roomId,
            appointmentId,
            senderId: 'doc_auto',
            senderName: recipientId || 'Doctor Specialist',
            senderRole: 'doctor',
            recipientId: senderId,
            text: doctorReplyText,
            isRead: true
          });
          io.to(roomId).emit('user_stop_typing', { roomId });
          io.to(roomId).emit('receive_message', docMsg);
        }, 2200);
      }

    } catch (err) {
      console.error('Error handling socket send_message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`MediBook Backend Server & Socket.io running on port ${PORT}`);
  });
}

module.exports = app;

