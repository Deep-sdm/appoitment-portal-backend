"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { DoctorDashboard } from "@/components/doctor-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarClock,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Stethoscope,
  Calendar,
  Activity,
  Star,
  CalendarDays,
  ShieldCheck,
  Zap,
  Heart,
  TrendingUp,
  Sparkles,
  Award,
  Video
} from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        if (user) {
          if (user.role !== "doctor") {
            const statsRes = await apiRequest("/dashboard/stats");
            setStats(statsRes.data);
          }
        }
        const docsRes = await apiRequest("/doctors");
        setDoctors(docsRes.data || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  // If user is a Doctor, render the Doctor Dashboard!
  if (user?.role === "doctor") {
    return <DoctorDashboard />;
  }

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 p-6 md:p-8 text-white shadow-2xl border border-emerald-500/20">
        {/* Glow ambient background mesh */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-extrabold border border-white/20 shadow-sm">
            <Activity className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>Smart Health Suite • Real-time Sync Active</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-white bg-clip-text text-transparent">{user ? user.name : "Patient"}</span> 👋
          </h1>

          <p className="text-white/90 text-sm md:text-base leading-relaxed font-medium">
            Manage your medical consultations, review diagnostic notes, browse certified specialists, and launch HD video calls with instant availability checking.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" className="rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black shadow-xl gap-2 hover:scale-[1.02] transition-transform">
              <Link href="/book">
                <Plus className="w-5 h-5 text-emerald-600 shrink-0" />
                Book Appointment
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/30 text-white hover:bg-white/10 font-bold backdrop-blur-md">
              <Link href="/doctors" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-300" />
                Specialists Directory
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards with Trends */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border-border/70 shadow-sm hover-lift bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Certified Specialists</CardTitle>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-black text-foreground">{loading ? "..." : (stats?.metrics?.totalDoctors || doctors.length || 6)}</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Verified Physicians</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 shadow-sm hover-lift bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Upcoming Visits</CardTitle>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-black text-foreground">{loading ? "..." : (stats?.metrics?.upcomingAppointments || 0)}</div>
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scheduled Sessions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 shadow-sm hover-lift bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Completed Visits</CardTitle>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-black text-foreground">{loading ? "..." : (stats?.metrics?.completedAppointments || 0)}</div>
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Diagnoses Saved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 shadow-sm hover-lift bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Total Consultations</CardTitle>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-xs">
              <CalendarClock className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-black text-foreground">{loading ? "..." : (stats?.metrics?.totalAppointments || 0)}</div>
            <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Lifetime Record</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments List */}
        <Card className="lg:col-span-2 rounded-3xl border-border/70 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/60">
            <div>
              <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Upcoming Consultations Queue
              </CardTitle>
              <CardDescription>Your active booked medical visits with live status</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 rounded-xl">
              <Link href="/appointments">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAppointments.map((appt: any) => (
                  <div key={appt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-emerald-500/30 shrink-0">
                        <AvatarImage src={appt.doctorAvatar || appt.doctor?.avatar} alt={appt.doctorName} />
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold"><Stethoscope className="w-5 h-5 text-emerald-600" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">{appt.doctorName}</h4>
                        <p className="text-xs text-muted-foreground font-medium">{appt.doctorSpecialty}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-semibold">
                          <span className="flex items-center gap-1 text-foreground">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {appt.date}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Clock className="w-3.5 h-3.5" /> {appt.timeSlot}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {appt.type === "video" && appt.status === "confirmed" && (
                        <Button asChild size="sm" className="h-9 px-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm">
                          <Link href="/telehealth">
                            <Video className="w-3.5 h-3.5 mr-1" /> Join Call
                          </Link>
                        </Button>
                      )}
                      <span className={`px-3 py-1 text-xs font-black rounded-full capitalize ${
                        appt.status === 'confirmed'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : appt.status === 'cancelled'
                          ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CalendarClock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-base text-foreground">No Active Appointments Scheduled</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Select a specialist doctor from our directory and schedule your consultation in seconds.
                  </p>
                </div>
                <Button asChild size="sm" className="rounded-xl mt-2 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-md">
                  <Link href="/book">Schedule Consultation</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar: Mini Calendar & Top Specialists */}
        <div className="space-y-6">
          {/* Calendar Overview Card */}
          <Card className="rounded-3xl border-border/70 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4.5 h-4.5 text-emerald-600" />
                <CardTitle className="text-base font-extrabold">Schedule Matrix</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 rounded-xl">
                <Link href="/calendar">Full Calendar</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center justify-between border border-emerald-500/20">
                <span>Today&apos;s Date</span>
                <span>{todayStr}</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed font-medium">
                Check doctor availability and holiday days off directly on the interactive schedule calendar.
              </p>
            </CardContent>
          </Card>

          {/* Top Specialists Sidebar */}
          <Card className="rounded-3xl border-border/70 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/60">
              <div>
                <CardTitle className="text-base font-extrabold">Top Doctor Specialists</CardTitle>
                <CardDescription className="text-xs">Highest rated physicians</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 rounded-xl">
                <Link href="/doctors">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {doctors.slice(0, 4).map((doc: any) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-10 w-10 border border-emerald-500/30 shrink-0">
                        <AvatarImage src={doc.avatar} alt={doc.name} />
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold">{doc.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="truncate">
                        <h4 className="font-extrabold text-xs truncate text-foreground">{doc.name}</h4>
                        <p className="text-[11px] text-muted-foreground truncate font-medium">{doc.specialty}</p>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{doc.rating}</span>
                          <span className="text-muted-foreground font-medium">(${doc.fee})</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="h-8 rounded-xl text-xs font-extrabold shrink-0 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10">
                      <Link href={`/book?doctorId=${doc._id}`}>Book</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

