"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MessageSquare,
  FileText,
  ShieldCheck,
  Wifi,
  Maximize2,
  Minimize2,
  Send,
  X,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Volume2
} from "lucide-react";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorAvatar?: string;
  patientName?: string;
  patientAvatar?: string;
  appointmentId?: string;
}

export function VideoCallModal({
  isOpen,
  onClose,
  doctorName = "Dr. Sarah Jenkins",
  doctorSpecialty = "Cardiology Specialist",
  doctorAvatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
  patientName = "Patient Consultation",
  patientAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
}: VideoCallModalProps) {
  const { user } = useAuth();
  const isDoctorUser = user?.role === "doctor";

  // Dynamic remote participant vs local user assignment
  const remoteParticipantName = isDoctorUser ? patientName : doctorName;
  const remoteParticipantSubtitle = isDoctorUser ? "Patient Visit" : doctorSpecialty;
  const remoteParticipantAvatar = isDoctorUser ? patientAvatar : doctorAvatar;
  const localParticipantName = isDoctorUser ? doctorName : (user?.name || patientName);

  // Call Controls State
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<"none" | "chat" | "notes">("none");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Timer State
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [callEnded, setCallEnded] = useState(false);

  // Live Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "System", text: "End-to-End Encrypted Telehealth Video Session Started.", time: "Just now" },
    { sender: remoteParticipantName, text: `Hello! Telehealth video connection established with ${remoteParticipantName}.`, time: "Just now" }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  // Clinical Notes State
  const [clinicalNotes, setClinicalNotes] = useState("Patient reports mild headache & chest pressure. Vital signs stable.");

  // Video Ref simulation
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: any;
    if (isOpen && !callEnded) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callEnded]);

  // Request real camera stream if browser permits, fallback to clean video stream poster
  useEffect(() => {
    if (isOpen && cameraActive && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera permission denied or mock fallback
        });
    }
  }, [isOpen, cameraActive]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainderSecs).padStart(2, "0")}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: "You", text: inputMsg.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setInputMsg("");
  };

  const handleEndCall = () => {
    setCallEnded(true);
  };

  const handleCloseAll = () => {
    setCallEnded(false);
    setSecondsElapsed(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAll}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 rounded-3xl border-slate-800 bg-slate-950 text-white overflow-hidden shadow-2xl flex flex-col">
        {callEnded ? (
          /* Call Ended Summary Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/40">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-black tracking-tight">Consultation Completed</h3>
              <p className="text-sm text-slate-400">
                Your video session with <span className="text-white font-bold">{remoteParticipantName}</span> has ended. Duration: <span className="font-mono text-emerald-400 font-bold">{formatTime(secondsElapsed)}</span>.
              </p>
            </div>

            <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Session ID:</span>
                <span className="font-mono text-slate-200">TH-8942-MED</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Security Level:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Encrypted
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Consultation Notes Saved:</span>
                <span className="text-white font-semibold">Ready in Health Records</span>
              </div>
            </div>

            <Button
              onClick={handleCloseAll}
              className="px-8 h-12 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
            >
              Back to Portal
            </Button>
          </div>
        ) : (
          /* Main Active Video Room */
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Top Room Header Bar */}
            <div className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-emerald-500/40">
                  <AvatarImage src={remoteParticipantAvatar} alt={remoteParticipantName} />
                  <AvatarFallback><Stethoscope className="w-5 h-5 text-emerald-400" /></AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    {remoteParticipantName}
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h4>
                  <p className="text-xs text-slate-400">{remoteParticipantSubtitle}</p>
                </div>
              </div>

              {/* Call Timer & Network Status */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-emerald-400 font-bold">HD 1080p • 45ms</span>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm font-black flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {formatTime(secondsElapsed)}
                </div>
              </div>
            </div>

            {/* Main Stage Grid Container */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Doctor/Patient Remote Stream (Main Large Video) */}
              <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center">
                {/* Background Video Feed Simulation */}
                {screenSharing ? (
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <Monitor className="w-16 h-16 text-emerald-400 animate-pulse" />
                    <h3 className="text-xl font-bold text-white">Screen Sharing Active</h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      {remoteParticipantName} is presenting medical records & laboratory reports in real time.
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                    <img
                      src={remoteParticipantAvatar}
                      alt={remoteParticipantName}
                      className="w-full h-full object-cover opacity-90 filter brightness-95 contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />

                    {/* Active Remote Speaker Overlay Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur-md text-xs text-white font-bold flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>{remoteParticipantName} (Connected HD Video)</span>
                    </div>
                  </div>
                )}

                {/* Self Camera PIP (Picture in Picture) */}
                <div className="absolute bottom-6 right-6 w-44 h-32 sm:w-56 sm:h-40 rounded-2xl border-2 border-slate-700 bg-slate-950 shadow-2xl overflow-hidden z-20 group">
                  {cameraActive ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
                      <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
                      <span className="text-[10px] font-bold">Camera Off</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white">
                    {localParticipantName} ({micActive ? "Mic On" : "Muted"})
                  </div>
                </div>
              </div>

              {/* Slide-out Sidebar Panel (Chat or Clinical Notes) */}
              {activeTab !== "none" && (
                <div className="w-80 sm:w-96 border-l border-slate-800 bg-slate-950/95 backdrop-blur-xl flex flex-col z-20 transition-all">
                  {/* Panel Header */}
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      {activeTab === "chat" ? (
                        <>
                          <MessageSquare className="w-4 h-4 text-emerald-400" /> Consultation Chat
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 text-emerald-400" /> Clinical Visit Notes
                        </>
                      )}
                    </h4>
                    <button
                      onClick={() => setActiveTab("none")}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Panel Content Body */}
                  {activeTab === "chat" ? (
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-2xl space-y-1 ${
                              msg.sender === "You"
                                ? "bg-emerald-600 text-white ml-6 rounded-br-none"
                                : msg.sender === "System"
                                ? "bg-slate-900 border border-slate-800 text-slate-400 text-center"
                                : "bg-slate-900 border border-slate-800 text-slate-200 mr-6 rounded-bl-none"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] opacity-75">
                              <span className="font-bold">{msg.sender}</span>
                              <span>{msg.time}</span>
                            </div>
                            <p className="leading-snug">{msg.text}</p>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex gap-2">
                        <Input
                          placeholder="Type chat message..."
                          value={inputMsg}
                          onChange={(e) => setInputMsg(e.target.value)}
                          className="h-10 rounded-xl bg-slate-900 border-slate-800 text-xs text-white placeholder:text-slate-500"
                        />
                        <Button type="submit" size="icon" className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white">
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 p-4 space-y-4 text-xs overflow-y-auto">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                        <span className="font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Real-time Doctor Clinical Notes
                        </span>
                        <p className="text-[11px] opacity-90">
                          Notes typed here are saved directly to the patient&apos;s electronic health record.
                        </p>
                      </div>

                      <textarea
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="Write clinical observations, prescription & advice..."
                        className="w-full h-48 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none font-mono"
                      />

                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="font-bold text-white">Digital Prescription:</span>
                        <p className="text-slate-400 text-[11px]">
                          • Paracetamol 500mg (1-0-1 after meals)<br />
                          • Vitamin C 500mg daily<br />
                          • Drink 3L water daily
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Floating Control Dock */}
            <div className="h-20 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-6 flex items-center justify-between z-20">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit Telehealth Stream</span>
              </div>

              {/* Action Buttons Center */}
              <div className="flex items-center gap-3 mx-auto sm:mx-0">
                {/* Mic Button */}
                <Button
                  onClick={() => setMicActive(!micActive)}
                  className={`w-12 h-12 rounded-2xl transition-all ${
                    micActive
                      ? "bg-slate-800 hover:bg-slate-700 text-white"
                      : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                  }`}
                  title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>

                {/* Camera Button */}
                <Button
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`w-12 h-12 rounded-2xl transition-all ${
                    cameraActive
                      ? "bg-slate-800 hover:bg-slate-700 text-white"
                      : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                  }`}
                  title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>

                {/* Screen Share Button */}
                <Button
                  onClick={() => setScreenSharing(!screenSharing)}
                  className={`w-12 h-12 rounded-2xl transition-all ${
                    screenSharing
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                  title="Share Screen"
                >
                  <Monitor className="w-5 h-5" />
                </Button>

                {/* Chat Drawer Toggle Button */}
                <Button
                  onClick={() => setActiveTab(activeTab === "chat" ? "none" : "chat")}
                  className={`w-12 h-12 rounded-2xl transition-all ${
                    activeTab === "chat"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                  title="Live Chat"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>

                {/* Clinical Notes Toggle Button */}
                <Button
                  onClick={() => setActiveTab(activeTab === "notes" ? "none" : "notes")}
                  className={`w-12 h-12 rounded-2xl transition-all ${
                    activeTab === "notes"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                  title="Visit Notes"
                >
                  <FileText className="w-5 h-5" />
                </Button>

                {/* End Call Button */}
                <Button
                  onClick={handleEndCall}
                  className="px-6 h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-lg shadow-red-600/30 flex items-center gap-2 ml-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>End Call</span>
                </Button>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
