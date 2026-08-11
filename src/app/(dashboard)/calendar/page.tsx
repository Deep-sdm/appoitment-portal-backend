"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
  Palmtree,
  AlertTriangle,
  Sparkles
} from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split("T")[0]);
  };

  // Build 42-cell matrix (6 weeks)
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = prevDate.toISOString().split("T")[0];
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const currDate = new Date(year, month, dayNum);
    const yyyy = currDate.getFullYear();
    const mm = String(currDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currDate.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: true });
  }

  // Next month leading days
  const remainingCells = 42 - calendarCells.length;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const nextDate = new Date(year, month + 1, dayNum);
    const dateStr = nextDate.toISOString().split("T")[0];
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Map appointments by date
  const appointmentsByDate: { [key: string]: any[] } = {};
  appointments.forEach((appt) => {
    if (!appointmentsByDate[appt.date]) {
      appointmentsByDate[appt.date] = [];
    }
    appointmentsByDate[appt.date].push(appt);
  });

  // Map doctor holidays by date
  const doctorHolidaysByDate: { [key: string]: any[] } = {};
  doctors.forEach((doc) => {
    if (doc.holidays && Array.isArray(doc.holidays)) {
      doc.holidays.forEach((hDate: string) => {
        if (!doctorHolidaysByDate[hDate]) {
          doctorHolidaysByDate[hDate] = [];
        }
        doctorHolidaysByDate[hDate].push(doc);
      });
    }
  });

  const selectedDateAppointments = appointmentsByDate[selectedDateStr] || [];
  const selectedDateHolidays = doctorHolidaysByDate[selectedDateStr] || [];

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Interactive Schedule Matrix
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            View scheduled consultations & doctor holiday availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday} className="rounded-2xl h-10 px-4 text-xs font-black border-border/80">
            Today
          </Button>
          <Button asChild size="sm" className="rounded-2xl h-10 px-4 font-black shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs">
            <Link href={`/book?date=${selectedDateStr}`}>
              <Plus className="w-4 h-4 mr-1.5" /> Book Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Doctor Holiday Color Legend Banner */}
      <div className="p-3.5 rounded-3xl bg-card border border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-4 flex-wrap font-bold">
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs" /> Booked Appointment
          </span>
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse shadow-xs" /> Doctor Holiday (Unavailable)
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground font-semibold">
          💡 Highlighted red cells indicate dates where doctor specialists are on leave.
        </span>
      </div>

      {/* Main Grid & Side Details Container */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Full Month Grid (2 cols) */}
        <Card className="lg:col-span-2 rounded-3xl border-border/70 bg-card overflow-hidden flex flex-col shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg font-black text-foreground">
                {monthName} {year}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-xl">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-xl">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center font-extrabold text-xs text-muted-foreground pb-3 border-b border-border/60 uppercase tracking-wider">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="py-1">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5 pt-3">
                {calendarCells.map((cell, idx) => {
                  const dayAppts = appointmentsByDate[cell.dateStr] || [];
                  const dayHolidays = doctorHolidaysByDate[cell.dateStr] || [];
                  const isHoliday = dayHolidays.length > 0;
                  const isSelected = cell.dateStr === selectedDateStr;
                  const isToday = cell.dateStr === new Date().toISOString().split("T")[0];

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[90px] p-2 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                        isSelected
                          ? isHoliday
                            ? "border-red-500 bg-red-500/15 ring-2 ring-red-500/40 shadow-md scale-[1.02]"
                            : "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-md scale-[1.02]"
                          : isHoliday
                          ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                          : cell.isCurrentMonth
                          ? "bg-card border-border/60 hover:bg-muted/50 hover:border-emerald-500/40"
                          : "bg-muted/10 border-transparent text-muted-foreground opacity-40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-black w-6 h-6 rounded-xl flex items-center justify-center ${
                            isToday
                              ? "bg-emerald-600 text-white shadow-xs"
                              : isHoliday
                              ? "bg-red-600 text-white font-black"
                              : isSelected
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          }`}
                        >
                          {cell.dayNum}
                        </span>
                        {dayAppts.length > 0 && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                            {dayAppts.length}
                          </span>
                        )}
                      </div>

                      {/* RED Holiday Badge Indicator */}
                      {isHoliday && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-lg bg-red-600 text-white shadow-xs">
                            <Palmtree className="w-2.5 h-2.5" /> Doctor Holiday
                          </span>
                        </div>
                      )}

                      {/* Appointment badges inside day cell */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayAppts.slice(0, 2).map((appt) => (
                          <div
                            key={appt._id}
                            className="text-[10px] truncate px-1.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{appt.doctorName.split(" ")[1] || appt.doctorName}</span>
                          </div>
                        ))}
                        {dayAppts.length > 2 && (
                          <span className="text-[9px] text-muted-foreground block font-bold">
                            +{dayAppts.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Date Side Details */}
        <Card className="lg:col-span-1 rounded-3xl border-border/70 bg-card flex flex-col shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-extrabold text-foreground">
                Details for {selectedDateStr}
              </CardTitle>
              <span className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black px-2.5 py-0.5 rounded-full">
                {selectedDateAppointments.length} Visits
              </span>
            </div>
            <CardDescription className="text-xs font-medium">Scheduled consultations & doctor availability</CardDescription>
          </CardHeader>

          <CardContent className="pt-4 flex-1 space-y-4 overflow-y-auto">
            {/* Holiday Warning Card if any Doctor is on Holiday on selected date */}
            {selectedDateHolidays.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Doctor Holiday Alert ({selectedDateStr})</span>
                </div>
                {selectedDateHolidays.map((doc) => (
                  <div key={doc._id} className="flex items-center gap-2 text-xs font-extrabold text-red-700 dark:text-red-300 bg-red-500/15 p-2.5 rounded-xl">
                    <Palmtree className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{doc.name} ({doc.specialty}) is on HOLIDAY today.</span>
                  </div>
                ))}
                <p className="text-[11px] text-red-600/90 dark:text-red-300/90 font-medium">
                  Appointment bookings for holiday doctors are blocked on this date.
                </p>
              </div>
            )}

            {selectedDateAppointments.length > 0 ? (
              selectedDateAppointments.map((appt) => (
                <div key={appt._id} className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-emerald-500/30 shrink-0">
                      <AvatarImage src={appt.doctorAvatar || appt.doctor?.avatar} alt={appt.doctorName} />
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold"><Stethoscope className="w-5 h-5 text-emerald-600" /></AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <h4 className="font-extrabold text-sm text-foreground truncate">{appt.doctorName}</h4>
                      <p className="text-muted-foreground font-medium truncate">{appt.doctorSpecialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Clock className="w-3.5 h-3.5" /> {appt.timeSlot}
                    </span>
                    <span className="capitalize px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-[10px]">
                      {appt.status}
                    </span>
                  </div>

                  <p className="text-[11px] bg-card p-2.5 rounded-xl text-foreground font-medium border border-border/40">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Reason:</span> {appt.reason}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-3">
                <CalendarIcon className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <h4 className="font-extrabold text-sm text-foreground">No Appointments Scheduled</h4>
                <p className="text-xs text-muted-foreground font-medium">
                  There are no medical visits scheduled for {selectedDateStr}.
                </p>
                <Button asChild size="sm" className="rounded-2xl text-xs font-black mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white">
                  <Link href={`/book?date=${selectedDateStr}`}>Book for {selectedDateStr}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

