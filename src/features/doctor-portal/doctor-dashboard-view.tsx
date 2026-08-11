"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useDoctorPortal } from "@/hooks/useDoctorPortal";
import { apiRequest } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  FileText,
  Loader2,
  Activity,
  Edit3,
  Palmtree,
  Plus,
  Trash2,
  CalendarOff
} from "lucide-react";

export function DoctorDashboardView() {
  const { user } = useAuth();
  const { stats, appointments, holidays, loading, addHoliday, removeHoliday, refreshData } = useDoctorPortal();
  const [updating, setUpdating] = useState<string | null>(null);

  // Diagnosis note modal state
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [notesText, setNotesText] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Holiday Modal State
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState(new Date().toISOString().split("T")[0]);
  const [addingHoliday, setAddingHoliday] = useState(false);

  const handleUpdateStatus = async (apptId: string, newStatus: string) => {
    try {
      setUpdating(apptId);
      await apiRequest(`/doctor-portal/appointment/${apptId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await refreshData();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleOpenNotes = (appt: any) => {
    setSelectedAppt(appt);
    setNotesText(appt.notes || "");
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppt) return;
    try {
      setUpdating(selectedAppt._id);
      await apiRequest(`/doctor-portal/appointment/${selectedAppt._id}`, {
        method: "PATCH",
        body: JSON.stringify({ notes: notesText }),
      });
      setShowNotesModal(false);
      await refreshData();
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleAddHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate) return;
    setAddingHoliday(true);
    await addHoliday(newHolidayDate);
    setAddingHoliday(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading Enterprise Doctor Portal...</p>
      </div>
    );
  }

  const doctorInfo = stats?.doctorInfo;
  const metrics = stats?.metrics;

  return (
    <div className="flex-1 space-y-6">
      {/* Doctor Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/20">
              <Stethoscope className="w-4 h-4 text-emerald-300" />
              <span>Doctor Practice & Clinical Queue</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome, {doctorInfo?.name || user?.name}! 🩺
            </h1>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              Specialist in <span className="font-bold underline">{doctorInfo?.specialty || "Medicine"}</span>. View patient appointments schedule, update clinical notes, and manage holiday days off.
            </p>
          </div>

          <Button
            onClick={() => setShowHolidayModal(true)}
            className="rounded-2xl bg-white text-emerald-800 hover:bg-white/90 font-bold shadow-md gap-2 shrink-0 self-start md:self-auto"
          >
            <Palmtree className="w-4 h-4 text-amber-600" /> Manage Holiday Days Off ({holidays.length})
          </Button>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
      </div>

      {/* Doctor Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-muted shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Patients</CardTitle>
            <Users className="w-5 h-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.todayPatients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-muted shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <Activity className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.totalPatients || appointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total assigned consultations</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-muted shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Visits</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.completedVisits || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Diagnosis completed</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-muted shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${metrics?.totalEarnings || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Consultation fee revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Appointments Queue */}
      <Card className="rounded-2xl border-muted shadow-sm">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Patient Appointment Schedule Queue</CardTitle>
            <CardDescription>View upcoming visits, confirm schedule, and document diagnosis notes</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appt: any) => (
                <div key={appt._id} className="p-4 rounded-2xl border bg-muted/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={appt.user?.avatar} alt={appt.user?.name || "Patient"} />
                        <AvatarFallback>{appt.user?.name ? appt.user.name.substring(0, 2) : "PT"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{appt.user?.name || appt.patientName || "Patient"}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            appt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : appt.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{appt.user?.email || appt.patientEmail || "patient@medibook.com"}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1 font-semibold text-foreground">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {appt.date}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-600">
                            <Clock className="w-3.5 h-3.5" /> {appt.timeSlot}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenNotes(appt)}
                        className="rounded-xl text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Clinical Notes
                      </Button>

                      {appt.status !== "completed" && (
                        <Button
                          size="sm"
                          disabled={updating === appt._id}
                          onClick={() => handleUpdateStatus(appt._id, "completed")}
                          className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          {updating === appt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Mark Completed"}
                        </Button>
                      )}

                      {appt.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updating === appt._id}
                          onClick={() => handleUpdateStatus(appt._id, "confirmed")}
                          className="rounded-xl text-xs border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
                        >
                          Confirm Visit
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-background rounded-xl border text-xs space-y-1">
                    <p><span className="font-semibold text-foreground">Reason for Visit:</span> {appt.reason}</p>
                    {appt.notes && (
                      <p><span className="font-semibold text-emerald-600">Doctor Diagnosis Notes:</span> {appt.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-2">
              <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto" />
              <h4 className="font-semibold text-sm">No Patient Appointments Yet</h4>
              <p className="text-xs text-muted-foreground">New patient consultations will appear in your queue here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Holiday Manager Modal */}
      <Dialog open={showHolidayModal} onOpenChange={setShowHolidayModal}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Palmtree className="w-5 h-5 text-amber-600" /> Manage Doctor Holiday Days Off
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mark specific dates as holidays so patients cannot book consultations on those days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <form onSubmit={handleAddHolidaySubmit} className="flex gap-2">
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                required
                className="h-11 rounded-xl text-xs flex-1"
              />
              <Button
                type="submit"
                disabled={addingHoliday}
                className="h-11 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {addingHoliday ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Add Holiday</>}
              </Button>
            </form>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground">Marked Holiday Dates:</h4>
              {holidays.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {holidays.map((dateStr) => (
                    <div key={dateStr} className="flex items-center justify-between p-3 rounded-xl border bg-amber-50/50 text-xs">
                      <span className="font-bold text-amber-900 flex items-center gap-2">
                        <CalendarOff className="w-4 h-4 text-amber-600" /> {dateStr}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHoliday(dateStr)}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No holiday dates currently set.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diagnosis Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Clinical Notes & Diagnosis
            </DialogTitle>
            <DialogDescription className="text-xs">
              Document prescription & diagnosis notes for <span className="font-bold text-foreground">{selectedAppt?.user?.name || selectedAppt?.patientName || "Patient"}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Doctor Clinical & Prescription Notes</label>
              <Textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Write patient diagnosis, prescribed medications, follow-up instructions..."
                className="rounded-xl resize-none min-h-[120px] text-xs"
              />
            </div>

            <Button
              onClick={handleSaveNotes}
              className="w-full h-11 rounded-2xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save Diagnosis Notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
