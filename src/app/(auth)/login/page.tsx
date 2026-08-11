"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Stethoscope,
  UserCheck,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDoctorDemo = () => {
    setRole("doctor");
    setEmail("doctor@medibook.com");
    setPassword("password123");
  };

  const fillPatientDemo = () => {
    setRole("patient");
    setEmail("patient@medibook.com");
    setPassword("password123");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password, role);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Check your email & password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 py-4">
      {/* Top Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-500/20 border border-emerald-400/30 mb-1">
          <Activity className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Welcome to MediBook</h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          Sign in to access your appointments, medical records & doctor portal
        </p>
      </div>

      {/* Main Glassmorphic Auth Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/95 shadow-2xl space-y-6 backdrop-blur-2xl relative overflow-hidden">
        {/* Top Decorative Subtle Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Role Switcher Segmented Pills */}
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
            <UserCheck className="w-4 h-4 text-primary" /> Patient Portal
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
            <Stethoscope className="w-4 h-4 text-emerald-200" /> Doctor Portal
          </button>
        </div>

        {/* Quick Demo Fill Bar */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" /> Quick Demo Fill:
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={fillDoctorDemo}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-[11px] shadow-sm"
            >
              🩺 Doctor Demo
            </button>
            <button
              type="button"
              onClick={fillPatientDemo}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all text-[11px] shadow-sm"
            >
              👤 Patient Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={role === "doctor" ? "doctor@medibook.com" : "patient@medibook.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11 h-12 rounded-2xl text-xs bg-muted/20 border-border/80 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-bold text-foreground">Password</Label>
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl text-xs font-extrabold shadow-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white transition-all mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating Portal...
              </>
            ) : (
              <>
                Sign In as {role === "doctor" ? "Doctor" : "Patient"} <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground border-t">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-extrabold text-primary hover:underline ml-1">
            Create an account
          </Link>
        </div>
      </div>

      {/* Bottom Trust Micro-Badge */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encryption
        </span>
        <span>•</span>
        <span className="flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> HIPAA Compliant Data
        </span>
      </div>
    </div>
  );
}
