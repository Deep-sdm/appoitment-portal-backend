import { apiRequest } from "@/lib/api-client";
import { Appointment } from "@/types";

export class AppointmentService {
  static async getMyAppointments(status?: string) {
    const endpoint = status && status !== "all" ? `/appointments?status=${status}` : "/appointments";
    const response = await apiRequest<Appointment[]>(endpoint);
    return response.data || [];
  }

  static async createAppointment(data: {
    doctorId: string;
    date: string;
    timeSlot: string;
    reason: string;
    type?: "in-person" | "video";
    notes?: string;
  }) {
    const response = await apiRequest<Appointment>("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  static async getAppointmentById(id: string) {
    const response = await apiRequest<Appointment>(`/appointments/${id}`);
    return response.data;
  }
}
