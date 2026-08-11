/**
 * MediBook Centralized Domain Types & API Interfaces
 */

export type UserRole = 'patient' | 'doctor' | 'admin';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ConsultationType = 'in-person' | 'video';
export type PaymentGateway = 'stripe' | 'razorpay';
export type PaymentStatus = 'completed' | 'pending' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewsCount: number;
  fee: number;
  email: string;
  phone?: string;
  avatar: string;
  bio?: string;
  location?: string;
  availableDays?: string[];
  availableSlots?: string[];
  holidays?: string[];
}

export interface Appointment {
  _id: string;
  user: User | string;
  doctor: Doctor | string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  patientName: string;
  patientEmail: string;
  date: string;
  timeSlot: string;
  reason: string;
  type: ConsultationType;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
}

export interface PaymentRecord {
  _id: string;
  user: string;
  doctor?: Doctor | string;
  appointment?: Appointment | string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  transactionId: string;
  status: PaymentStatus;
  doctorName?: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface DoctorMetrics {
  todayPatients: number;
  totalPatients: number;
  completedVisits: number;
  pendingVisits: number;
  totalEarnings: number;
}

export interface DoctorPortalStats {
  doctorInfo: {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    experience: number;
    fee: number;
    holidays: string[];
  };
  metrics: DoctorMetrics;
  recentAppointments: Appointment[];
}
