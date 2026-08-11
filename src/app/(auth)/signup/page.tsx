"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Loader2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Stethoscope,
  UserCheck,
  Award,
  DollarSign,
  Activity,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function SignUpPage() {
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [fee, setFee] = useState("120");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAuth();
  const router = useRouter();

  const specialtiesList = [
    "General Medicine",
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Dermatology",
    "Orthopedics",
    "Gynecology",
    "ENT & Otolaryngology",
    "Psychiatry",
    "Ophthalmology"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(
        name,
        email,
        password,
        role,
        role === "doctor" ? specialty : undefined,
        role === "doctor" ? Number(fee) : undefined
      );
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 py-4">
      {/* Top Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-500/20 border border-emerald-400/30 mb-1">
          <Activity className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Create MediBook Account</h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          Register as a Patient or Doctor to access consultations & portal features
        </p>
      </div>

      {/* Main Glassmorphic Auth Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/95 shadow-2xl space-y-6 backdrop-blur-2xl relative overflow-hidden">
        {/* Role Switcher Pill Bar */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-muted/80 border text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              role === "patient"
                ? "bg-background text-primary shadow-sm border font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="w-4 h-4 text-primary" /> Patient Account
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              role === "doctor"
                ? "bg-emerald-600 text-white shadow-md font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-200" /> Doctor Account
          </button>
        </div>

        {error && (
          <div className="p-3.5 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-foreground">
              {role === "doctor" ? "Doctor Full Name" : "Full Name"}
            </Label>
            <div className="relative">
              {role === "doctor" ? (
                <Stethoscope className="absolute left-4 top-3.5 h-4 w-4 text-emerald-600" />
              ) : (
                <User className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                id="name"
                type="text"
                placeholder={role === "doctor" ? "Dr. Sarah Jenkins" : "John Doe"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-11 h-12 rounded-2xl text-xs bg-muted/20 border-border/80 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={role === "doctor" ? "doctor.name@medibook.com" : "patient@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11 h-12 rounded-2xl text-xs bg-muted/20 border-border/80 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Conditional Doctor Fields */}
          {role === "doctor" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" /> Medical Specialty
                </Label>
                <select
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full h-12 rounded-xl text-xs bg-background border border-border px-3 font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {specialtiesList.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee" className="text-xs font-bold text-foreground flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Consultation Fee ($)
                </Label>
                <Input
                  id="fee"
                  type="number"
                  placeholder="120"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  required
                  min="1"
                  className="h-12 rounded-xl text-xs bg-background border-border/80 font-bold"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-11 h-12 rounded-2xl text-xs bg-muted/20 border-border/80 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs font-bold text-foreground">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-11 h-12 rounded-2xl text-xs bg-muted/20 border-border/80 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl text-xs font-extrabold shadow-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white transition-all mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Provisioning Account...
              </>
            ) : (
              <>
                Register as {role === "doctor" ? "Doctor Specialist" : "Patient"} <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground border-t">
          Already have an account?{" "}
          <Link href="/login" className="font-extrabold text-primary hover:underline ml-1">
            Sign in
          </Link>
        </div>
      </div>

      {/* Bottom Trust Micro-Badge */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Medical Registry
        </span>
        <span>•</span>
        <span className="flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Immediate Activation
        </span>
      </div>
    </div>
  );
}
