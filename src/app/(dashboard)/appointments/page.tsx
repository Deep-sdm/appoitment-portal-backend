"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoCallModal } from "@/components/video-call/video-call-modal";
import {
  CalendarClock,
  Calendar,
  Clock,
  Stethoscope,
  Video,
  Building,
  Plus,
  Loader2,
  XCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // Video Call Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeCallAppt, setActiveCallAppt] = useState<any>(null);

  useEffect(() => {
    fetchAppointments();
  }, [filter, user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = "/appointments";
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      const res = await apiRequest(url);
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      setActionId(id);
      await apiRequest(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || "Failed to cancel appointment");
    } finally {
      setActionId(null);
    }
  };

  const handleJoinVideoCall = (appt: any) => {
    setActiveCallAppt(appt);
    setIsVideoModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            My Appointments Queue
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Manage active medical visits, launch video consultations, or view clinical history
          </p>
        </div>
        <Button asChild className="rounded-2xl h-11 px-5 font-extrabold shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs">
          <Link href="/book">
            <Plus className="w-4 h-4 mr-2" />
            Book New Consultation
          </Link>
        </Button>
      </div>

      {/* Filter Segmented Pills */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto scrollbar-none">
        {["all", "confirmed", "completed", "cancelled"].map((tab) => {
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold capitalize transition-all ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Loading appointment records...</p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid gap-4">
          {appointments.map((appt) => (
            <Card key={appt._id} className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-emerald-500/30 shadow-xs shrink-0">
                    <AvatarImage src={appt.doctorAvatar || appt.doctor?.avatar} alt={appt.doctorName} />
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold"><Stethoscope className="w-6 h-6 text-emerald-600" /></AvatarFallback>
                  </Avatar>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-extrabold text-base text-foreground">{appt.doctorName}</h3>
                      <span className={`px-3 py-0.5 text-[11px] font-black rounded-full capitalize ${
                        appt.status === 'confirmed'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : appt.status === 'cancelled'
                          ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{appt.doctorSpecialty}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-bold text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {appt.date}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-3.5 h-3.5" /> {appt.timeSlot}
                      </span>
                      <span className="flex items-center gap-1 capitalize font-bold text-foreground">
                        {appt.type === 'video' ? (
                          <Video className="w-3.5 h-3.5 text-cyan-600" />
                        ) : (
                          <Building className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {appt.type}
                      </span>
                    </div>

                    {appt.reason && (
                      <p className="text-xs text-foreground bg-muted/30 p-3 rounded-2xl mt-2 font-medium border border-border/50">
                        <span className="font-black text-emerald-700 dark:text-emerald-400">Visit Reason:</span> {appt.reason}
                      </p>
                    )}
                  </div>
                </div>

                {appt.status === "confirmed" && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 shrink-0">
                    <Button
                      onClick={() => handleJoinVideoCall(appt)}
                      className="rounded-2xl h-11 px-4 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-md flex items-center gap-2"
                    >
                      <Video className="w-4 h-4 text-cyan-200" /> Join Telehealth Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelAppointment(appt._id)}
                      disabled={actionId === appt._id}
                      className="rounded-2xl h-11 px-4 text-xs font-extrabold text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-500/10 border-red-500/30"
                    >
                      {actionId === appt._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                      )}
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-3xl p-12 text-center border-border/70 bg-card">
          <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 mb-3">
            <CalendarClock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-foreground">No appointments found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-medium">
            You don&apos;t have any medical appointments under &quot;{filter}&quot; status.
          </p>
          <Button asChild size="sm" className="rounded-2xl mt-4 h-10 px-4 font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white">
            <Link href="/book">Schedule Appointment</Link>
          </Button>
        </Card>
      )}

      {/* Video Call Room Modal */}
      {activeCallAppt && (
        <VideoCallModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          doctorName={activeCallAppt.doctorName}
          doctorSpecialty={activeCallAppt.doctorSpecialty}
          doctorAvatar={activeCallAppt.doctorAvatar || activeCallAppt.doctor?.avatar}
          patientName={user?.name || "Patient Consultation"}
        />
      )}
    </div>
  );
}

