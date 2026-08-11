import { apiRequest } from "@/lib/api-client";
import { Doctor, DoctorPortalStats, Appointment } from "@/types";

export class DoctorService {
  static async getDoctors(specialty?: string, search?: string) {
    let endpoint = "/doctors";
    const params = new URLSearchParams();
    if (specialty && specialty !== "All") params.append("specialty", specialty);
    if (search) params.append("search", search);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const response = await apiRequest<Doctor[]>(endpoint);
    return response.data || [];
  }

  static async getDoctorById(id: string) {
    const response = await apiRequest<Doctor>(`/doctors/${id}`);
    return response.data;
  }

  static async getDoctorPortalStats() {
    const response = await apiRequest<DoctorPortalStats>("/doctor-portal/stats");
    return response.data;
  }

  static async getDoctorAppointments() {
    const response = await apiRequest<Appointment[]>("/doctor-portal/appointments");
    return response.data || [];
  }

  static async addDoctorHoliday(date: string) {
    const response = await apiRequest<{ holidays: string[] }>("/doctor-portal/holiday", {
      method: "POST",
      body: JSON.stringify({ date }),
    });
    return response.holidays || [];
  }

  static async removeDoctorHoliday(date: string) {
    const response = await apiRequest<{ holidays: string[] }>(`/doctor-portal/holiday/${date}`, {
      method: "DELETE",
    });
    return response.holidays || [];
  }
}
