const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const CLOUD_SYNC_ENDPOINT = 'https://api.jsonbin.io/v3/b/66b8cb7be41b4d34e41ea558';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  token?: string;
  count?: number;
  holidays?: string[];
  notifications?: any[];
  unreadCount?: number;
}

// Full list of 6 certified specialist doctors for both local and Vercel cloud environments
const MOCK_DOCTORS = [
  {
    _id: "doc_1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    experience: 12,
    rating: 4.9,
    reviewsCount: 184,
    fee: 150,
    email: "doctor@medibook.com",
    phone: "+1 (555) 234-5678",
    location: "Heart & Vascular Pavilion, Suite 301",
    bio: "Board-certified cardiologist specializing in preventive cardiology, ECG diagnostics, and heart health management.",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
    holidays: []
  },
  {
    _id: "doc_2",
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    experience: 15,
    rating: 4.8,
    reviewsCount: 142,
    fee: 175,
    email: "michael.chen@medibook.com",
    phone: "+1 (555) 345-6789",
    location: "Neuroscience Center, Floor 5",
    bio: "Expert neurologist focused on headache disorders, movement disorders, and neuro-rehabilitation.",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableSlots: ["10:00 AM", "01:30 PM", "03:30 PM"],
    holidays: []
  },
  {
    _id: "doc_3",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    avatar: "https://images.unsplash.com/photo-1594824813571-24a698370597?q=80&w=400&auto=format&fit=crop",
    experience: 9,
    rating: 4.95,
    reviewsCount: 210,
    fee: 120,
    email: "emily.rodriguez@medibook.com",
    phone: "+1 (555) 456-7890",
    location: "Children's Health Clinic, Suite 102",
    bio: "Compassionate pediatrician dedicated to infant care, child health tracking, and adolescent wellness.",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableSlots: ["08:30 AM", "10:30 AM", "01:00 PM", "03:00 PM"],
    holidays: []
  },
  {
    _id: "doc_4",
    name: "Dr. James Wilson",
    specialty: "Dermatology",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop",
    experience: 11,
    rating: 4.7,
    reviewsCount: 98,
    fee: 140,
    email: "james.wilson@medibook.com",
    phone: "+1 (555) 567-8901",
    location: "Dermatology & Skin Center, Suite 205",
    bio: "Specialist in cosmetic and medical dermatology, skin cancer screenings, and laser therapies.",
    availableDays: ["Monday", "Wednesday", "Thursday"],
    availableSlots: ["09:30 AM", "11:30 AM", "02:30 PM", "04:30 PM"],
    holidays: []
  },
  {
    _id: "doc_5",
    name: "Dr. Priya Patel",
    specialty: "Orthopedics",
    avatar: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=400&auto=format&fit=crop",
    experience: 14,
    rating: 4.88,
    reviewsCount: 165,
    fee: 160,
    email: "priya.patel@medibook.com",
    phone: "+1 (555) 678-9012",
    location: "Orthopedic & Spine Institute, Wing B",
    bio: "Orthopedic surgeon specializing in sports injuries, joint replacements, and arthroscopic procedures.",
    availableDays: ["Tuesday", "Wednesday", "Friday"],
    availableSlots: ["09:00 AM", "11:00 AM", "02:00 PM"],
    holidays: []
  },
  {
    _id: "doc_6",
    name: "Dr. Robert Taylor",
    specialty: "General Medicine",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=400&auto=format&fit=crop",
    experience: 20,
    rating: 4.92,
    reviewsCount: 310,
    fee: 100,
    email: "robert.taylor@medibook.com",
    phone: "+1 (555) 789-0123",
    location: "Primary Care Wellness Hub, Suite 100",
    bio: "Primary care physician focusing on holistic family care, wellness checkups, and chronic disease management.",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableSlots: ["08:00 AM", "10:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"],
    holidays: []
  }
];

const MOCK_PATIENT_USER = {
  _id: "user_patient_demo",
  name: "John Doe",
  email: "patient@medibook.com",
  role: "patient",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
  phone: "+1 (555) 234-5678"
};

const MOCK_DOCTOR_USER = {
  _id: "user_doctor_demo",
  name: "Dr. Sarah Jenkins",
  email: "doctor@medibook.com",
  role: "doctor",
  avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
  phone: "+1 (555) 987-6543"
};

const INITIAL_DEMO_APPOINTMENTS = [
  {
    _id: "appt_101",
    doctorId: "doc_1",
    doctorName: "Dr. Sarah Jenkins",
    doctorSpecialty: "Cardiology",
    doctorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    patientName: "John Doe",
    patientEmail: "patient@medibook.com",
    user: {
      _id: "user_patient_demo",
      name: "John Doe",
      email: "patient@medibook.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
    },
    date: new Date().toISOString().split('T')[0],
    timeSlot: "10:30 AM",
    reason: "Routine Heart & Blood Pressure Checkup",
    type: "video",
    status: "confirmed",
    notes: "Patient reports mild fatigue after exercise. Prescribed ECG and BP log.",
    createdAt: new Date().toISOString()
  }
];

// Memory cache for active session
let inMemoryAppointments: any[] = [...INITIAL_DEMO_APPOINTMENTS];

function getStoredAppointments(): any[] {
  if (typeof window === 'undefined') return inMemoryAppointments;
  const stored = localStorage.getItem('medibook_appointments');
  if (!stored) {
    localStorage.setItem('medibook_appointments', JSON.stringify(inMemoryAppointments));
    return inMemoryAppointments;
  }
  try {
    const parsed = JSON.parse(stored);
    inMemoryAppointments = parsed;
    return parsed;
  } catch {
    return inMemoryAppointments;
  }
}

function saveStoredAppointments(appts: any[]) {
  inMemoryAppointments = appts;
  if (typeof window !== 'undefined') {
    localStorage.setItem('medibook_appointments', JSON.stringify(appts));
  }
}

function getStoredHolidays(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('medibook_doctor_holidays');
  return stored ? JSON.parse(stored) : [];
}

function saveStoredHolidays(holidays: string[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('medibook_doctor_holidays', JSON.stringify(holidays));
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('medibook_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Check if running on a live external domain (e.g. Vercel) while API_BASE_URL points to localhost
  const isBrowser = typeof window !== 'undefined';
  const isExternalVercelHost = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const isLocalhostApi = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');

  // If opening live Vercel URL on another device without custom backend URL, use direct instant zero-error Vercel fallback
  if (isExternalVercelHost && isLocalhostApi) {
    return handleVercelFallback<T>(endpoint, options);
  }

  // Set timeout controller for fast fallback on local network if backend port 5000 is unreachable
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed.');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    return handleVercelFallback<T>(endpoint, options);
  }
}

function handleVercelFallback<T = any>(endpoint: string, options: RequestInit): ApiResponse<T> {
  const method = options.method ? options.method.toUpperCase() : 'GET';
  const body = options.body ? JSON.parse(options.body as string) : {};
  const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('medibook_user') : null;
  const currentUser = savedUserStr ? JSON.parse(savedUserStr) : MOCK_PATIENT_USER;

  // Auth Login
  if (endpoint.includes('/auth/login')) {
    const isDoctorRole = body.role === 'doctor' || body.email?.includes('doctor');
    let user;
    if (body.email === 'doctor@medibook.com' || isDoctorRole) {
      user = MOCK_DOCTOR_USER;
    } else if (body.email === 'patient@medibook.com') {
      user = MOCK_PATIENT_USER;
    } else {
      const emailPrefix = body.email ? body.email.split('@')[0] : 'User';
      const formattedName = isDoctorRole ? `Dr. ${emailPrefix}` : emailPrefix;
      user = {
        _id: `user_${Date.now()}`,
        name: formattedName,
        email: body.email || 'patient@medibook.com',
        role: isDoctorRole ? 'doctor' : 'patient',
        avatar: isDoctorRole
          ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        phone: '+1 (555) 000-1122'
      };
    }

    return {
      success: true,
      message: 'Login successful',
      token: 'demo_jwt_token_medibook_vercel',
      user: user as any,
      data: user as any
    };
  }

  // Auth Register
  if (endpoint.includes('/auth/register')) {
    const isDoctor = body.role === 'doctor';
    const user = {
      _id: `user_${Date.now()}`,
      name: body.name || 'Demo User',
      email: body.email || 'user@medibook.com',
      role: body.role || 'patient',
      avatar: isDoctor
        ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
    };
    return {
      success: true,
      message: 'Registration successful',
      token: 'demo_jwt_token_medibook_vercel',
      user: user as any,
      data: user as any
    };
  }

  // Auth Me
  if (endpoint.includes('/auth/me')) {
    return {
      success: true,
      user: currentUser as any,
      data: currentUser as any
    };
  }

  // Doctors List - Returns ALL 6 certified specialist doctors plus holidays
  if (endpoint.includes('/doctors')) {
    const holidays = getStoredHolidays();
    const doctorsWithHolidays = MOCK_DOCTORS.map(doc => {
      if (doc._id === 'doc_1' || doc.email === 'doctor@medibook.com') {
        return { ...doc, holidays };
      }
      return doc;
    });
    return {
      success: true,
      count: doctorsWithHolidays.length,
      data: doctorsWithHolidays as any
    };
  }

  // Doctor Portal Endpoints
  if (endpoint.includes('/doctor-portal/stats')) {
    const allAppts = getStoredAppointments();
    const docHolidays = getStoredHolidays();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPatients = allAppts.filter(a => a.date === todayStr).length;
    const completedVisits = allAppts.filter(a => a.status === 'completed').length;
    const totalEarnings = allAppts.reduce((sum, a) => sum + (a.fee || 150), 0);

    return {
      success: true,
      data: {
        doctorInfo: {
          ...MOCK_DOCTOR_USER,
          specialty: 'Cardiology',
          holidays: docHolidays
        },
        metrics: {
          todayPatients,
          totalPatients: allAppts.length,
          completedVisits,
          totalEarnings
        }
      } as any
    };
  }

  if (endpoint.includes('/doctor-portal/appointments')) {
    const allAppts = getStoredAppointments();
    return {
      success: true,
      count: allAppts.length,
      data: allAppts as any
    };
  }

  if (endpoint.includes('/doctor-portal/appointment/')) {
    const apptId = endpoint.split('/doctor-portal/appointment/')[1];
    let allAppts = getStoredAppointments();
    const index = allAppts.findIndex(a => a._id === apptId);
    if (index !== -1) {
      if (body.status) allAppts[index].status = body.status;
      if (body.notes) allAppts[index].notes = body.notes;
      saveStoredAppointments(allAppts);
      return { success: true, data: allAppts[index] as any };
    }
  }

  if (endpoint.includes('/doctor-portal/holiday')) {
    let holidays = getStoredHolidays();
    if (method === 'POST') {
      if (body.date && !holidays.includes(body.date)) {
        holidays.push(body.date);
        saveStoredHolidays(holidays);
      }
    } else if (method === 'DELETE') {
      const targetDate = endpoint.split('/doctor-portal/holiday/')[1];
      holidays = holidays.filter(d => d !== targetDate);
      saveStoredHolidays(holidays);
    }
    return { success: true, holidays };
  }

  // Patient Appointments
  if (endpoint.includes('/appointments')) {
    let allAppts = getStoredAppointments();

    if (method === 'POST') {
      const doc = MOCK_DOCTORS.find(d => d._id === body.doctorId) || MOCK_DOCTORS[0];
      const newAppt = {
        _id: `appt_${Date.now()}`,
        doctorId: doc._id,
        doctorName: doc.name,
        doctorSpecialty: doc.specialty,
        doctorAvatar: doc.avatar,
        patientName: currentUser?.name || 'John Doe',
        patientEmail: currentUser?.email || 'patient@medibook.com',
        user: {
          _id: currentUser?._id || 'user_patient_demo',
          name: currentUser?.name || 'John Doe',
          email: currentUser?.email || 'patient@medibook.com',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
        },
        date: body.date || new Date().toISOString().split('T')[0],
        timeSlot: body.timeSlot || '10:00 AM',
        reason: body.reason || 'General Consultation',
        type: body.type || 'in-person',
        notes: body.notes || '',
        fee: doc.fee || 150,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      allAppts = [newAppt, ...allAppts];
      saveStoredAppointments(allAppts);

      return { success: true, data: newAppt as any };
    }

    if (method === 'PATCH' || method === 'PUT') {
      const apptId = endpoint.split('/appointments/')[1]?.split('/')[0];
      if (apptId) {
        allAppts = allAppts.map(a => {
          if (a._id === apptId) {
            return { ...a, status: body.status || a.status, notes: body.notes || a.notes };
          }
          return a;
        });
        saveStoredAppointments(allAppts);
      }
      return { success: true, data: allAppts as any };
    }

    // GET My appointments
    return { success: true, count: allAppts.length, data: allAppts as any };
  }

  // Payments
  if (endpoint.includes('/payments')) {
    const demoTxs = [
      {
        _id: "tx_101",
        transactionId: "TX_MB_98241",
        doctorName: "Dr. Sarah Jenkins",
        amount: 150,
        currency: "USD",
        gateway: "stripe",
        paymentMethod: "Visa Card (•••• 4242)",
        status: "completed",
        createdAt: new Date().toISOString()
      }
    ];
    return { success: true, count: demoTxs.length, data: demoTxs as any };
  }

  // Messages / Conversations
  if (endpoint.includes('/messages')) {
    return {
      success: true,
      data: [
        {
          roomId: "room_ai_assistant",
          partnerName: "MediBook AI Health Assistant",
          partnerSpecialty: "24/7 AI Medical Guide",
          lastMessage: "Hello! Ask me about symptoms or appointments.",
          appointmentDate: "Today",
          appointmentTime: "Online"
        }
      ] as any
    };
  }

  // Notifications
  if (endpoint.includes('/notifications')) {
    return {
      success: true,
      notifications: [
        {
          _id: "notif_1",
          title: "Appointment Confirmed",
          message: "Your consultation with Dr. Sarah Jenkins is scheduled for today at 10:30 AM.",
          type: "appointment_confirmed",
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ],
      unreadCount: 1
    };
  }

  return { success: true, data: [] as any };
}
