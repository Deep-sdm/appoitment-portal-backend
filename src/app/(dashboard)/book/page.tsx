"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaymentModal } from "@/components/payment-modal";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  Video,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Star,
  CreditCard,
  ShieldAlert,
  Palmtree,
  AlertTriangle
} from "lucide-react";

function BookAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDoctorId = searchParams.get("doctorId");
  const initialDate = searchParams.get("date");
  const { user } = useAuth();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState<string>("09:00 AM");
  const [type, setType] = useState<"in-person" | "video">("in-person");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true);
        const res = await apiRequest("/doctors");
        const docsList = res.data || [];
        setDoctors(docsList);

        if (initialDoctorId) {
          const doc = docsList.find((d: any) => d._id === initialDoctorId);
          if (doc) {
            setSelectedDoctor(doc);
            if (doc.availableSlots && doc.availableSlots.length > 0) {
              setTimeSlot(doc.availableSlots[0]);
            }
          }
        } else if (docsList.length > 0) {
          setSelectedDoctor(docsList[0]);
          if (docsList[0].availableSlots && docsList[0].availableSlots.length > 0) {
            setTimeSlot(docsList[0].availableSlots[0]);
          }
        }
      } catch (err: any) {
        setError("Failed to load doctor specialists.");
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, [initialDoctorId]);

  // Restriction for Doctor Role
  if (user?.role === "doctor") {
    return (
      <div className="flex-1 max-w-2xl mx-auto py-12">
        <Card className="rounded-3xl border-muted p-6 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Appointment Booking Restricted</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You are logged in as a <span className="font-bold text-foreground">Doctor</span>. Doctors cannot book appointments for themselves. You can view your patient schedule or set your holiday dates on the Doctor Portal.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button onClick={() => router.push("/")} className="rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
              Go to Doctor Portal Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleDoctorChange = (docId: string) => {
    const doc = doctors.find((d) => d._id === docId);
    if (doc) {
      setSelectedDoctor(doc);
      if (doc.availableSlots && doc.availableSlots.length > 0) {
        setTimeSlot(doc.availableSlots[0]);
      }
    }
  };

  const isSelectedDateHoliday = selectedDoctor?.holidays && selectedDoctor.holidays.includes(date);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }

    // Block submission if doctor is on holiday
    if (isSelectedDateHoliday) {
      setError(`${selectedDoctor.name} is on HOLIDAY on ${date}. Please select an available date.`);
      return;
    }

    if (!reason.trim()) {
      setError("Please specify the reason for your visit.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create Appointment first in pending state
      const apptRes = await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date,
          timeSlot,
          reason,
          type,
          notes,
        }),
      });

      if (apptRes.data?._id) {
        setPendingAppointmentId(apptRes.data._id);
        setShowPaymentModal(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to schedule appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      router.push("/appointments");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Preparing booking portal...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Book Appointment</h2>
        <p className="text-muted-foreground text-sm">
          Schedule a consultation with a top specialist
        </p>
      </div>

      {/* Visual Booking Process Steps Bar */}
      <div className="p-4 rounded-3xl border border-border/70 bg-card shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-2 font-black text-emerald-600 dark:text-emerald-400 shrink-0">
          <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md">1</span>
          <span>Select Specialist</span>
        </div>
        <div className="h-0.5 w-8 bg-emerald-500/30 shrink-0" />
        <div className="flex items-center gap-2 font-black text-foreground shrink-0">
          <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black">2</span>
          <span>Date & Time Slot</span>
        </div>
        <div className="h-0.5 w-8 bg-border shrink-0" />
        <div className="flex items-center gap-2 font-extrabold text-muted-foreground shrink-0">
          <span className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-black">3</span>
          <span>Stripe / Razorpay Payment</span>
        </div>
      </div>

      {success && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 rounded-3xl animate-in fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 animate-bounce" />
            <div>
              <h4 className="font-black text-sm text-foreground">Appointment & Payment Successfully Confirmed!</h4>
              <p className="text-xs font-medium text-muted-foreground">You can now start a live chat consultation with {selectedDoctor?.name}.</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/messages")}
            className="rounded-2xl h-11 px-5 font-black text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-md flex items-center gap-2 shrink-0"
          >
            <Stethoscope className="w-4 h-4" /> Start Live Doctor Chat
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 rounded-3xl text-xs font-extrabold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        {/* Left Form Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Select Doctor Card */}
          <Card className="rounded-3xl border-border/70 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Stethoscope className="w-4.5 h-4.5 text-emerald-600" />
                Select Certified Specialist Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor?._id === doc._id;
                  const hasHolidays = doc.holidays && doc.holidays.length > 0;
                  return (
                    <div
                      key={doc._id}
                      onClick={() => handleDoctorChange(doc._id)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-md scale-[1.01]"
                          : "border-border/80 bg-muted/20 hover:bg-muted/50"
                      }`}
                    >
                      <Avatar className="h-11 w-11 border-2 border-emerald-500/30 shadow-xs shrink-0">
                        <AvatarImage src={doc.avatar} alt={doc.name} />
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold">{doc.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden text-xs flex-1">
                        <h4 className="font-extrabold truncate text-foreground">{doc.name}</h4>
                        <p className="text-muted-foreground font-medium truncate">{doc.specialty}</p>
                        {hasHolidays && (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-black flex items-center gap-1 mt-0.5">
                            <Palmtree className="w-3 h-3 text-red-500" /> {doc.holidays.length} Holiday Date(s)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Doctor Holiday Dates Alert */}
              {selectedDoctor?.holidays && selectedDoctor.holidays.length > 0 && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs space-y-2">
                  <span className="font-black text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Palmtree className="w-4 h-4 text-red-500 shrink-0 animate-bounce" /> Doctor Leave Schedule (Red = Booking Blocked):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoctor.holidays.map((hDate: string) => (
                      <span key={hDate} className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-[11px] shadow-sm flex items-center gap-1">
                        🔴 {hDate}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card className="rounded-3xl border-border/70 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <CalendarIcon className="w-4.5 h-4.5 text-emerald-600" />
                Select Date & Time Slot
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs font-bold">Appointment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className={`h-11 rounded-2xl font-black text-xs transition-all ${
                      isSelectedDateHoliday
                        ? "border-red-500 bg-red-500/10 text-red-600 ring-2 ring-red-500/30"
                        : "bg-muted/20"
                    }`}
                  />

                  {isSelectedDateHoliday && (
                    <div className="p-3 rounded-2xl bg-red-600 text-white font-black text-xs flex items-center gap-2 shadow-md animate-pulse">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>🚫 {selectedDoctor.name} is on HOLIDAY on this date.</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs font-bold">Consultation Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={type === "in-person" ? "default" : "outline"}
                      onClick={() => setType("in-person")}
                      className={`h-11 rounded-2xl text-xs gap-1.5 font-extrabold ${
                        type === "in-person" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md" : "border-border/80"
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" /> In-Person
                    </Button>
                    <Button
                      type="button"
                      variant={type === "video" ? "default" : "outline"}
                      onClick={() => setType("video")}
                      className={`h-11 rounded-2xl text-xs gap-1.5 font-extrabold ${
                        type === "video" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md" : "border-border/80"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-cyan-200" /> Video Call
                    </Button>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-bold">Available Time Slots</Label>
                <div className="flex flex-wrap gap-2">
                  {(selectedDoctor?.availableSlots || [
                    "09:00 AM",
                    "10:30 AM",
                    "02:00 PM",
                    "03:30 PM",
                    "05:00 PM",
                  ]).map((slot: string) => (
                    <Button
                      key={slot}
                      type="button"
                      disabled={isSelectedDateHoliday}
                      variant={timeSlot === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeSlot(slot)}
                      className={`rounded-2xl px-4 h-9 text-xs font-extrabold transition-all ${
                        timeSlot === slot ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm" : "border-border/70"
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1.5" />
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visit Details */}
          <Card className="rounded-3xl border-border/70 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-extrabold">Visit Symptoms & Medical Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-xs font-bold">Reason for Consultation *</Label>
                <Input
                  id="reason"
                  placeholder="e.g. Regular heart checkup, persistent headache, fever..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="h-11 rounded-2xl bg-muted/20 text-xs font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-bold">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Mention any existing symptoms, medical history, or current medications..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-2xl resize-none min-h-[90px] bg-muted/20 text-xs font-medium"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Summary Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border/70 shadow-sm sticky top-20 bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-extrabold">Booking Summary</CardTitle>
              <CardDescription className="text-xs font-medium">Review details & checkout fee</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {selectedDoctor && (
                <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                  <Avatar className="h-12 w-12 border-2 border-emerald-500/30 shadow-xs">
                    <AvatarImage src={selectedDoctor.avatar} alt={selectedDoctor.name} />
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold">{selectedDoctor.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-black text-sm text-foreground">{selectedDoctor.name}</h4>
                    <p className="text-muted-foreground font-medium">{selectedDoctor.specialty}</p>
                    <div className="flex items-center gap-1 text-amber-600 font-bold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{selectedDoctor.rating}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-muted-foreground font-medium">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className={`font-black ${isSelectedDateHoliday ? "text-red-600" : "text-foreground"}`}>
                    {date} {isSelectedDateHoliday && "(Holiday)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Slot:</span>
                  <span className="font-extrabold text-foreground">{timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consultation Mode:</span>
                  <span className="font-extrabold text-foreground capitalize">{type}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/60 text-sm font-black text-foreground">
                  <span>Consultation Fee:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">${selectedDoctor?.fee || 100}.00</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || success || isSelectedDateHoliday}
                className={`w-full h-12 rounded-2xl text-xs font-black shadow-lg transition-all text-white ${
                  isSelectedDateHoliday
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparing Checkout...
                  </>
                ) : isSelectedDateHoliday ? (
                  <>🚫 Doctor Unavailable on Holiday</>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment (${selectedDoctor?.fee || 100}.00)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>


      {/* Payment Gateway Modal */}
      {selectedDoctor && pendingAppointmentId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          appointmentId={pendingAppointmentId}
          doctorId={selectedDoctor._id}
          doctorName={selectedDoctor.name}
          fee={selectedDoctor.fee || 100}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <BookAppointmentContent />
    </Suspense>
  );
}
