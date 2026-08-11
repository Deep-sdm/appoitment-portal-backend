"use client";

import { useState, useEffect, useCallback } from "react";
import { DoctorService } from "@/services/doctor.service";
import { Appointment, DoctorPortalStats } from "@/types";

export function useDoctorPortal() {
  const [stats, setStats] = useState<DoctorPortalStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await DoctorService.getDoctorPortalStats();
      if (statsData) {
        setStats(statsData);
        if (statsData.doctorInfo?.holidays) {
          setHolidays(statsData.doctorInfo.holidays);
        }
      }

      const apptsData = await DoctorService.getDoctorAppointments();
      setAppointments(apptsData);
    } catch (err: any) {
      setError(err.message || "Failed to load Doctor Portal data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const addHoliday = async (date: string) => {
    try {
      const updatedHolidays = await DoctorService.addDoctorHoliday(date);
      setHolidays(updatedHolidays);
      return true;
    } catch (err) {
      console.error("Failed to add holiday:", err);
      return false;
    }
  };

  const removeHoliday = async (date: string) => {
    try {
      const updatedHolidays = await DoctorService.removeDoctorHoliday(date);
      setHolidays(updatedHolidays);
      return true;
    } catch (err) {
      console.error("Failed to remove holiday:", err);
      return false;
    }
  };

  return {
    stats,
    appointments,
    holidays,
    loading,
    error,
    refreshData: loadPortalData,
    addHoliday,
    removeHoliday,
  };
}
