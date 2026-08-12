"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { ModernCalendar } from "@/components/calendar/modern-calendar";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, ShieldCheck, Palmtree } from "lucide-react";

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [apptsRes, docsRes] = await Promise.all([
          apiRequest("/appointments"),
          apiRequest("/doctors")
        ]);
        setAppointments(apptsRes.data || []);
        setDoctors(docsRes.data || []);
      } catch (err) {
        console.error("Error loading calendar data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Clinical Schedule Suite
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Interactive multi-view calendar with real-time doctor leave tracking & HIPAA privacy protection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="rounded-2xl h-10 px-5 font-black shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs">
            <Link href="/book">
              <Plus className="w-4 h-4 mr-1.5" /> Schedule New Visit
            </Link>
          </Button>
        </div>
      </div>

      {/* Legend & Compliance Banner */}
      <div className="p-4 rounded-3xl bg-card border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-4 flex-wrap font-bold">
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs" /> Scheduled Appointment
          </span>
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse shadow-xs" /> Doctor Holiday (Booking Blocked)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>HIPAA 256-Bit Encrypted Schedule</span>
        </div>
      </div>

      {/* Modern Multi-View Calendar Component */}
      <ModernCalendar appointments={appointments} doctors={doctors} loading={loading} />
    </div>
  );
}
