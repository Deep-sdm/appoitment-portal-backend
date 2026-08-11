import Link from "next/link";
import { Activity, CheckCircle2, ShieldCheck, HeartPulse } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex w-full bg-background font-sans overflow-x-hidden">
      {/* Left Panel - Visual/Brand (50% width on desktop) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 text-white overflow-hidden p-12 flex-col justify-between">
        {/* Glowing Ambient Mesh Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-teal-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-950/50 border border-emerald-400/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight text-white">MediBook</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 ml-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Enterprise SaaS
            </span>
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 space-y-8 max-w-xl my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <HeartPulse className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Next-Gen Healthcare Management & Teleconsultation</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            The modern platform to manage <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">clinical consultations</span> & practice.
          </h1>

          <div className="space-y-4 text-slate-300 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Intelligent appointment scheduling with doctor holiday management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Instant Stripe & Razorpay (UPI) payment gateway verification</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>24/7 AI Health Assistant & direct clinical chat messaging</span>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-3">
            <p className="text-xs text-slate-200 italic leading-relaxed">
              &ldquo;MediBook has transformed how our medical clinic handles patient bookings. We save hours every day on scheduling and diagnosis documentation.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Avatar className="h-9 w-9 border border-emerald-400/40">
                <AvatarImage src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xs font-bold text-white">Dr. Sarah Jenkins</h4>
                <p className="text-[11px] text-emerald-300 font-medium">Head of Cardiology, Heart & Vascular Pavilion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} MediBook Healthcare Inc.</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> HIPAA Compliant Security
          </span>
        </div>
      </div>

      {/* Right Panel - Auth Forms (100% on mobile/tablet, 50% on desktop) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative bg-gradient-to-br from-background via-muted/40 to-emerald-500/10 min-h-screen">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
