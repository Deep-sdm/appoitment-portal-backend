"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from "recharts";
import { Activity, BarChart3, TrendingUp, Users, CalendarClock, Loader2, Sparkles, ShieldCheck } from "lucide-react";

const monthlyTrendData = [
  { month: "Jan", appointments: 12 },
  { month: "Feb", appointments: 19 },
  { month: "Mar", appointments: 25 },
  { month: "Apr", appointments: 32 },
  { month: "May", appointments: 28 },
  { month: "Jun", appointments: 40 },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        if (user) {
          const res = await apiRequest("/dashboard/stats");
          setStats(res.data);
        }
      } catch (err) {
        console.error("Error loading analytics stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  const metrics = stats?.metrics || {
    totalDoctors: 6,
    totalAppointments: 1,
    upcomingAppointments: 1,
    completedAppointments: 0,
    cancelledAppointments: 0,
  };

  const specialtyData = stats?.specialtyDistribution || [
    { name: "Cardiology", value: 1 },
    { name: "Neurology", value: 1 },
    { name: "Pediatrics", value: 1 },
    { name: "Dermatology", value: 1 },
    { name: "Orthopedics", value: 1 },
    { name: "General Med", value: 1 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Generating analytics reports...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          Analytics & Intelligence
          <Sparkles className="w-5 h-5 text-emerald-500" />
        </h2>
        <p className="text-muted-foreground text-sm font-medium">
          Comprehensive overview metrics and consultation growth trends
        </p>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Total Specialists</CardTitle>
            <div className="w-8 h-8 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{metrics.totalDoctors}</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified specialists on platform
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Total Consultations</CardTitle>
            <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{metrics.totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
              ↑ +12.4% increase this month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Active Scheduled Visits</CardTitle>
            <div className="w-8 h-8 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{metrics.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Confirmed upcoming visits</p>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend Area Chart */}
        <Card className="rounded-3xl border-border/70 bg-card shadow-sm">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-600" /> Monthly Appointment Volume
            </CardTitle>
            <CardDescription className="text-xs font-medium">Consultation volume trajectory</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAppt)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Doctor Specialty Bar Chart */}
        <Card className="rounded-3xl border-border/70 bg-card shadow-sm">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-emerald-600" /> Doctors by Specialty
            </CardTitle>
            <CardDescription className="text-xs font-medium">Specialist department distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

