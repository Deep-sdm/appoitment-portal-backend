const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// Fallback demo mock data for Vercel deployment when backend API server is unreachable
const MOCK_DOCTORS = [
  {
    _id: "doc_1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    experience: 12,
    rating: 4.9,
    reviewsCount: 48,
    fee: 150,
    location: "Metro Heart Institute, New York",
    bio: "Board-certified cardiologist specializing in cardiovascular wellness, ECG diagnostics, and heart disease prevention.",
    availableSlots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"],
    holidays: []
  },
  {
    _id: "doc_2",
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    experience: 9,
    rating: 4.8,
    reviewsCount: 36,
    fee: 180,
    location: "Neuroscience Medical Center, Boston",
    bio: "Neurologist expert in migraine therapy, brain health, memory disorder management, and neuro-rehabilitation.",
    availableSlots: ["11:00 AM", "01:30 PM", "03:00 PM", "05:00 PM"],
    holidays: []
  },
  {
    _id: "doc_3",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d293f77?q=80&w=400&auto=format&fit=crop",
    experience: 14,
    rating: 4.95,
    reviewsCount: 64,
    fee: 120,
    location: "Children's Health Pavilion, Chicago",
    bio: "Dedicated pediatrician focused on infant health care, growth tracking, and preventative child wellness.",
    availableSlots: ["09:30 AM", "11:30 AM", "02:30 PM", "04:00 PM"],
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

  // Set timeout controller for fast fallback on live Vercel deployments if backend unreachable
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // If backend is unreachable (e.g. Vercel deployment without custom backend URL), use smooth mock fallback
    if (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      error.message?.includes('fetch') ||
      error.message?.includes('Failed') ||
      error.message?.includes('unreachable')
    ) {
      console.warn(`[Vercel Demo Mode] Live backend unreachable for ${endpoint}. Serving fallback data.`);
      return handleVercelFallback<T>(endpoint, options);
    }

    throw error;
  }
}

function handleVercelFallback<T = any>(endpoint: string, options: RequestInit): ApiResponse<T> {
  const method = options.method ? options.method.toUpperCase() : 'GET';
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth Login
  if (endpoint.includes('/auth/login')) {
    const isDoctor = body.role === 'doctor' || body.email?.includes('doctor');
    const user = isDoctor ? MOCK_DOCTOR_USER : MOCK_PATIENT_USER;
    return {
      success: true,
      message: 'Login successful (Vercel Live Demo)',
      token: 'demo_jwt_token_medibook_vercel',
      user: user as any,
      data: user as any
    };
  }

  // Auth Register
  if (endpoint.includes('/auth/register')) {
    const user = {
      _id: `user_${Date.now()}`,
      name: body.name || 'Demo User',
      email: body.email || 'user@medibook.com',
      role: body.role || 'patient',
      avatar: ''
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
    const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('medibook_user') : null;
    const user = savedUserStr ? JSON.parse(savedUserStr) : MOCK_PATIENT_USER;
    return {
      success: true,
      user: user as any,
      data: user as any
    };
  }

  // Doctors list
  if (endpoint.includes('/doctors')) {
    return {
      success: true,
      count: MOCK_DOCTORS.length,
      data: MOCK_DOCTORS as any
    };
  }

  // Appointments
  if (endpoint.includes('/appointments')) {
    if (method === 'POST') {
      const doc = MOCK_DOCTORS.find(d => d._id === body.doctorId) || MOCK_DOCTORS[0];
      const newAppt = {
        _id: `appt_${Date.now()}`,
        doctorName: doc.name,
        doctorSpecialty: doc.specialty,
        doctorAvatar: doc.avatar,
        patientName: 'John Doe',
        date: body.date || new Date().toISOString().split('T')[0],
        timeSlot: body.timeSlot || '10:00 AM',
        reason: body.reason || 'General Consultation',
        type: body.type || 'in-person',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      return { success: true, data: newAppt as any };
    }

    // GET My appointments
    const demoAppts = [
      {
        _id: "appt_101",
        doctorName: "Dr. Sarah Jenkins",
        doctorSpecialty: "Cardiology",
        doctorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
        patientName: "John Doe",
        date: "2026-08-15",
        timeSlot: "10:30 AM",
        reason: "Routine Heart & Blood Pressure Checkup",
        type: "video",
        status: "confirmed",
        createdAt: new Date().toISOString()
      }
    ];
    return { success: true, count: demoAppts.length, data: demoAppts as any };
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
          message: "Your consultation with Dr. Sarah Jenkins is scheduled for Aug 15 at 10:30 AM.",
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
