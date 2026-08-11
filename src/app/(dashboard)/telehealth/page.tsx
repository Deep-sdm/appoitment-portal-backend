"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoCallModal } from "@/components/video-call/video-call-modal";
import {
  Video,
  Stethoscope,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Loader2,
  Users,
  Play
} from "lucide-react";

export default function TelehealthPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Video Call Modal Control
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeCallDoc, setActiveCallDoc] = useState<any>(null);

  useEffect(() => {
    async function loadTelehealthData() {
      try {
        setLoading(true);
        const [apptsRes, docsRes] = await Promise.all([
          apiRequest("/appointments"),
          apiRequest("/doctors")
        ]);
        setAppointments(apptsRes.data || []);
        setDoctors(docsRes.data || []);
      } catch (err) {
        console.error("Error loading telehealth data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTelehealthData();
  }, []);

  const handleStartCall = (doc?: any) => {
    const defaultDoc = doc || (doctors.length > 0 ? doctors[0] : { name: "Dr. Sarah Jenkins", specialty: "Cardiology Specialist" });
    setActiveCallDoc(defaultDoc);
    setIsVideoModalOpen(true);
  };

  const videoAppointments = appointments.filter((a) => a.type === "video" || a.status === "confirmed");

  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold">
            <Zap className="w-3.5 h-3.5" /> Ultra-HD 1080p Telehealth Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">HD Video Consultation Room</h1>
          <p className="text-sm text-slate-300">
            Connect directly with verified medical specialists in end-to-end encrypted HD video consultations.
          </p>
        </div>

        <div className="z-10 flex gap-3">
          <Button
            onClick={() => handleStartCall()}
            className="h-12 px-6 rounded-2xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" /> Launch Instant Video Call
          </Button>
        </div>

        {/* Ambient Glow background */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Grid: Scheduled Video Appointments & Available Specialists */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Video Consultations List */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-muted">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Video className="w-5 h-5 text-emerald-600" />
                  Your Scheduled Video Visits
                </CardTitle>
                <span className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold px-2.5 py-1 rounded-full">
                  {videoAppointments.length} Available
                </span>
              </div>
              <CardDescription>Click to join active video room for your appointment</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Loading video consultations...</span>
                </div>
              ) : videoAppointments.length > 0 ? (
                videoAppointments.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-4 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-emerald-500/30 shrink-0">
                        <AvatarImage src={appt.doctorAvatar || appt.doctor?.avatar} alt={appt.doctorName} />
                        <AvatarFallback><Stethoscope className="w-6 h-6" /></AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground">{appt.doctorName}</h4>
                        <p className="text-xs text-muted-foreground">{appt.doctorSpecialty}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-semibold pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {appt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" /> {appt.timeSlot}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleStartCall(appt.doctor || { name: appt.doctorName, specialty: appt.doctorSpecialty, avatar: appt.doctorAvatar })}
                      className="h-11 px-5 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-xs flex items-center gap-2 shrink-0"
                    >
                      <Video className="w-4 h-4" /> Join Call Now
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Video className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                  <h4 className="font-bold text-sm text-foreground">No Video Appointments Found</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    You can start an instant test consultation with any online medical specialist below.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Active Online Specialists */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-muted">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Online Specialists
              </CardTitle>
              <CardDescription>Available for immediate video consultations</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {doctors.slice(0, 4).map((doc) => (
                <div key={doc._id} className="p-3 rounded-2xl border bg-muted/20 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 border border-emerald-500/20 shrink-0">
                      <AvatarImage src={doc.avatar} alt={doc.name} />
                      <AvatarFallback>{doc.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <h4 className="font-bold truncate text-foreground">{doc.name}</h4>
                      <p className="text-muted-foreground truncate text-[11px]">{doc.specialty}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleStartCall(doc)}
                    size="sm"
                    className="h-9 px-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] shrink-0"
                  >
                    <Video className="w-3.5 h-3.5 mr-1" /> Call
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security Micro Badge */}
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> HIPAA Security Guarantee
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              All telehealth video streams use peer-to-peer 256-bit encryption. No audio or video is stored on external servers.
            </p>
          </div>
        </div>
      </div>

      {/* Video Call Modal Primitive */}
      {activeCallDoc && (
        <VideoCallModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          doctorName={activeCallDoc.name || "Dr. Sarah Jenkins"}
          doctorSpecialty={activeCallDoc.specialty || "General Medicine"}
          doctorAvatar={activeCallDoc.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop"}
          patientName={user?.name || "Patient Consultation"}
          patientAvatar={user?.avatar || ""}
        />
      )}
    </div>
  );
}
