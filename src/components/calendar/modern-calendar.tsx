"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useHIPAA } from "@/context/hipaa-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Sparkles,
  Filter,
  Search,
  Video,
  Building,
  User,
  List,
  Grid,
  Columns,
  ShieldCheck,
  EyeOff
} from "lucide-react";

interface ModernCalendarProps {
  appointments: any[];
  doctors: any[];
  loading: boolean;
}

type ViewMode = "month" | "week" | "day" | "agenda";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

export function ModernCalendar({ appointments, doctors, loading }: ModernCalendarProps) {
  const { isPhiMasked, maskPhi } = useHIPAA();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Filters
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Inspection Modal
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (selectedDoctorFilter !== "all" && appt.doctorId !== selectedDoctorFilter) {
        return false;
      }
      if (selectedTypeFilter !== "all" && appt.type !== selectedTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const docMatch = appt.doctorName?.toLowerCase().includes(q);
        const reasonMatch = appt.reason?.toLowerCase().includes(q);
        const patientMatch = appt.patientName?.toLowerCase().includes(q);
        if (!docMatch && !reasonMatch && !patientMatch) return false;
      }
      return true;
    });
  }, [appointments, selectedDoctorFilter, selectedTypeFilter, searchQuery]);

  // Calendar calculations for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === "week") {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
      setSelectedDateStr(prev.toISOString().split("T")[0]);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === "week") {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
      setSelectedDateStr(next.toISOString().split("T")[0]);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split("T")[0]);
  };

  // Build Month Cells (42 cells)
  const calendarCells = [];
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = prevDate.toISOString().split("T")[0];
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const currDate = new Date(year, month, dayNum);
    const yyyy = currDate.getFullYear();
    const mm = String(currDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currDate.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: true });
  }

  const remainingCells = 42 - calendarCells.length;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const nextDate = new Date(year, month + 1, dayNum);
    const dateStr = nextDate.toISOString().split("T")[0];
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Week View Days (7 days centered around currentDate or current week starting Sunday)
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day); // Sunday

    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      result.push({
        date: d,
        dateStr,
        dayName: WEEKDAYS[i],
        dayNum: d.getDate(),
        isToday: dateStr === new Date().toISOString().split("T")[0],
      });
    }
    return result;
  }, [currentDate]);

  // Appointments Map by Date
  const appointmentsByDate: { [key: string]: any[] } = {};
  filteredAppointments.forEach((appt) => {
    if (!appointmentsByDate[appt.date]) {
      appointmentsByDate[appt.date] = [];
    }
    appointmentsByDate[appt.date].push(appt);
  });

  // Holidays Map by Date
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

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const selectedDateAppointments = appointmentsByDate[selectedDateStr] || [];
  const selectedDateHolidays = doctorHolidaysByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar & View Switcher */}
      <div className="p-4 rounded-3xl border border-border/80 bg-card shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Month / Date Navigator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" onClick={handlePrev} className="h-9 w-9 rounded-xl border-border/80">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext} className="h-9 w-9 rounded-xl border-border/80">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="rounded-xl h-9 px-3 text-xs font-black">
                Today
              </Button>
            </div>

            <h3 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              {viewMode === "month" && `${monthName} ${year}`}
              {viewMode === "week" && `Week of ${weekDays[0].dateStr} - ${weekDays[6].dateStr}`}
              {(viewMode === "day" || viewMode === "agenda") && selectedDateStr}
            </h3>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border/50 self-start lg:self-auto">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className={`h-8 rounded-xl text-xs font-black gap-1.5 ${
                viewMode === "month" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs" : ""
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Month
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className={`h-8 rounded-xl text-xs font-black gap-1.5 ${
                viewMode === "week" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs" : ""
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Week
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("day")}
              className={`h-8 rounded-xl text-xs font-black gap-1.5 ${
                viewMode === "day" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs" : ""
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Day
            </Button>
            <Button
              variant={viewMode === "agenda" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("agenda")}
              className={`h-8 rounded-xl text-xs font-black gap-1.5 ${
                viewMode === "agenda" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs" : ""
              }`}
            >
              <List className="w-3.5 h-3.5" /> Agenda
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-3 border-t border-border/60 grid gap-3 sm:grid-cols-3 lg:grid-cols-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-muted/20 border-border/60"
            />
          </div>

          <select
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            className="h-9 px-3 text-xs font-extrabold rounded-xl bg-card border border-border/70 text-foreground"
          >
            <option value="all">All Specialists & Doctors</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name} ({doc.specialty})
              </option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="h-9 px-3 text-xs font-extrabold rounded-xl bg-card border border-border/70 text-foreground"
          >
            <option value="all">All Consultation Modes</option>
            <option value="in-person">In-Person Clinic</option>
            <option value="video">Video Consult</option>
          </select>

          {isPhiMasked && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold text-xs border border-amber-500/30">
              <EyeOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>PHI Masking Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Calendar View Area */}
      {loading ? (
        <Card className="rounded-3xl p-16 text-center border-border/70 bg-card">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-bold">Syncing schedule matrix...</p>
        </Card>
      ) : (
        <>
          {/* VIEW MODE 1: MONTH VIEW */}
          {viewMode === "month" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 rounded-3xl border-border/80 bg-card shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  {/* Weekday Header */}
                  <div className="grid grid-cols-7 gap-1.5 text-center font-black text-xs text-muted-foreground pb-3 border-b border-border/60 uppercase">
                    {WEEKDAYS.map((wd) => (
                      <div key={wd} className="py-1">
                        {wd}
                      </div>
                    ))}
                  </div>

                  {/* Day Cells Grid */}
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
                          className={`min-h-[100px] p-2 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                            isSelected
                              ? isHoliday
                                ? "border-red-500 bg-red-500/15 ring-2 ring-red-500/40 shadow-md scale-[1.02]"
                                : "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-md scale-[1.02]"
                              : isHoliday
                              ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                              : cell.isCurrentMonth
                              ? "bg-card border-border/60 hover:bg-emerald-500/5 hover:border-emerald-500/40"
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

                          {/* Doctor Holiday Alert */}
                          {isHoliday && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-lg bg-red-600 text-white shadow-xs">
                                <Palmtree className="w-2.5 h-2.5" /> Doctor Holiday
                              </span>
                            </div>
                          )}

                          {/* Appointment Chips */}
                          <div className="space-y-1 mt-1 overflow-hidden">
                            {dayAppts.slice(0, 2).map((appt) => (
                              <div
                                key={appt._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointment(appt);
                                }}
                                className="text-[10px] truncate px-1.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1 hover:bg-emerald-500/30"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="truncate">{appt.doctorName?.split(" ")[1] || appt.doctorName}</span>
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
                </CardContent>
              </Card>

              {/* Side Details Inspector for Selected Date */}
              <Card className="rounded-3xl border-border/80 bg-card flex flex-col shadow-sm">
                <CardHeader className="pb-3 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-extrabold text-foreground">
                      Details for {selectedDateStr}
                    </CardTitle>
                    <span className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black px-2.5 py-0.5 rounded-full">
                      {selectedDateAppointments.length} Visits
                    </span>
                  </div>
                  <CardDescription className="text-xs font-medium">Scheduled consultations & availability</CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-3 flex-1 overflow-y-auto">
                  {selectedDateHolidays.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Doctor Leave Warning</span>
                      </div>
                      {selectedDateHolidays.map((doc) => (
                        <p key={doc._id} className="text-red-700 dark:text-red-300 font-bold">
                          • {doc.name} ({doc.specialty}) is on HOLIDAY today.
                        </p>
                      ))}
                    </div>
                  )}

                  {selectedDateAppointments.length > 0 ? (
                    selectedDateAppointments.map((appt) => (
                      <div
                        key={appt._id}
                        onClick={() => setSelectedAppointment(appt)}
                        className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer space-y-2 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-emerald-500/30 shrink-0">
                            <AvatarImage src={appt.doctorAvatar || appt.doctor?.avatar} alt={appt.doctorName} />
                            <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold">
                              <Stethoscope className="w-5 h-5 text-emerald-600" />
                            </AvatarFallback>
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

                        <p className="text-[11px] bg-card p-2 rounded-xl text-foreground font-medium border border-border/40 truncate">
                          <span className="font-bold text-emerald-600">Reason:</span> {maskPhi(appt.reason, "reason")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <CalendarIcon className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs font-bold text-muted-foreground">No visits scheduled for this date</p>
                      <Button asChild size="sm" className="rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                        <Link href={`/book?date=${selectedDateStr}`}>Book for {selectedDateStr}</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* VIEW MODE 2: WEEK VIEW STRIP */}
          {viewMode === "week" && (
            <Card className="rounded-3xl border-border/80 bg-card p-4 shadow-sm space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((wDay) => {
                  const dayAppts = appointmentsByDate[wDay.dateStr] || [];
                  const dayHolidays = doctorHolidaysByDate[wDay.dateStr] || [];
                  const isHoliday = dayHolidays.length > 0;

                  return (
                    <div
                      key={wDay.dateStr}
                      onClick={() => setSelectedDateStr(wDay.dateStr)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-3 min-h-[220px] ${
                        wDay.dateStr === selectedDateStr
                          ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                          : isHoliday
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-muted/20 border-border/60 hover:bg-muted/40"
                      }`}
                    >
                      <div className="text-center border-b border-border/50 pb-2">
                        <p className="text-[11px] font-black text-muted-foreground uppercase">{wDay.dayName}</p>
                        <p
                          className={`text-lg font-black ${
                            wDay.isToday ? "text-emerald-600" : "text-foreground"
                          }`}
                        >
                          {wDay.dayNum}
                        </p>
                      </div>

                      {isHoliday && (
                        <span className="block text-center text-[9px] font-black px-1 py-0.5 rounded-lg bg-red-600 text-white">
                          Holiday
                        </span>
                      )}

                      <div className="space-y-1.5">
                        {dayAppts.map((appt) => (
                          <div
                            key={appt._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(appt);
                            }}
                            className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-[11px] font-bold space-y-0.5 hover:scale-[1.02] transition-transform"
                          >
                            <p className="truncate text-foreground font-black">{appt.doctorName?.split(" ")[1] || appt.doctorName}</p>
                            <p className="text-[10px] text-emerald-600 font-semibold">{appt.timeSlot}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* VIEW MODE 3: DAY HOURLY VIEW */}
          {viewMode === "day" && (
            <Card className="rounded-3xl border-border/80 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <h4 className="text-lg font-black text-foreground">Timeline Schedule for {selectedDateStr}</h4>
                <Button asChild size="sm" className="rounded-xl font-bold bg-emerald-600 text-white">
                  <Link href={`/book?date=${selectedDateStr}`}>Book Slot</Link>
                </Button>
              </div>

              <div className="space-y-3 divide-y divide-border/40">
                {TIME_SLOTS.map((slot) => {
                  const slotAppts = selectedDateAppointments.filter((a) => a.timeSlot === slot);
                  return (
                    <div key={slot} className="pt-3 flex items-start gap-4">
                      <span className="w-24 text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0 pt-1">
                        {slot}
                      </span>
                      <div className="flex-1 min-h-[48px] rounded-2xl bg-muted/20 border border-border/50 p-2.5">
                        {slotAppts.length > 0 ? (
                          slotAppts.map((appt) => (
                            <div
                              key={appt._id}
                              onClick={() => setSelectedAppointment(appt)}
                              className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-500/40 cursor-pointer flex items-center justify-between text-xs font-bold text-foreground"
                            >
                              <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-emerald-600" />
                                <span>{appt.doctorName} ({appt.doctorSpecialty})</span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">{maskPhi(appt.reason, "reason")}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60 italic">Slot Available</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* VIEW MODE 4: AGENDA LIST VIEW */}
          {viewMode === "agenda" && (
            <Card className="rounded-3xl border-border/80 bg-card p-6 shadow-sm space-y-4">
              <h4 className="text-lg font-black text-foreground">Upcoming Agenda Appointments ({filteredAppointments.length})</h4>
              {filteredAppointments.length > 0 ? (
                <div className="space-y-3">
                  {filteredAppointments.map((appt) => (
                    <div
                      key={appt._id}
                      onClick={() => setSelectedAppointment(appt)}
                      className="p-4 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border border-emerald-500/30 shrink-0">
                          <AvatarImage src={appt.doctorAvatar || appt.doctor?.avatar} alt={appt.doctorName} />
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold">
                            <Stethoscope className="w-5 h-5 text-emerald-600" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-extrabold text-sm text-foreground">{appt.doctorName}</h4>
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold">{appt.doctorSpecialty}</p>
                          <p className="text-muted-foreground text-[11px] mt-0.5">
                            Reason: {maskPhi(appt.reason, "reason")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-black text-foreground">{appt.date}</p>
                          <p className="text-emerald-600 font-bold">{appt.timeSlot}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black capitalize text-[10px]">
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-2">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-bold text-muted-foreground">No appointments matching filters</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Appointment Detail Inspector Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-2xl space-y-4">
            <DialogHeader className="border-b border-border/60 pb-3">
              <DialogTitle className="text-lg font-black flex items-center gap-2 text-foreground">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                Appointment Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Verified Medical Record • 256-Bit Encrypted
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <Avatar className="h-12 w-12 border-2 border-emerald-500/30">
                  <AvatarImage src={selectedAppointment.doctorAvatar || selectedAppointment.doctor?.avatar} alt={selectedAppointment.doctorName} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-700 font-bold">DOC</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-black text-sm text-foreground">{selectedAppointment.doctorName}</h4>
                  <p className="text-emerald-600 font-bold">{selectedAppointment.doctorSpecialty}</p>
                </div>
              </div>

              <div className="space-y-2 text-muted-foreground font-medium">
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-black text-foreground">{selectedAppointment.date} at {selectedAppointment.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="font-black text-foreground capitalize">{selectedAppointment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-black text-emerald-600 capitalize">{selectedAppointment.status}</span>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <span className="font-bold text-foreground block mb-1">Reason for Visit:</span>
                  <p className="p-3 rounded-xl bg-muted/30 border border-border/50 text-foreground font-medium">
                    {maskPhi(selectedAppointment.reason, "reason")}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {selectedAppointment.type === "video" && (
                <Button asChild size="sm" className="rounded-xl font-bold bg-emerald-600 text-white">
                  <Link href="/telehealth">
                    <Video className="w-3.5 h-3.5 mr-1" /> Launch Telehealth Call
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(null)} className="rounded-xl font-bold">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
