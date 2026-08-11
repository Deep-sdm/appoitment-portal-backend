"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { getSocket } from "@/lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Stethoscope,
  Bot,
  Sparkles,
  ChevronLeft,
  Radio,
  CalendarCheck,
  CheckCheck,
  UserCheck,
  FileText,
  Pill,
  Paperclip,
  Smile,
  RefreshCw,
  Clock,
  User
} from "lucide-react";

interface Message {
  _id?: string;
  senderId?: string;
  senderName?: string;
  senderRole?: "patient" | "doctor" | "ai";
  text: string;
  isRead?: boolean;
  createdAt?: string;
  time?: string;
}

interface Conversation {
  id: string | number;
  roomId: string;
  appointmentId?: string;
  doctor: string;
  patientName?: string;
  specialty: string;
  avatar: string;
  isBot: boolean;
  lastMessage: string;
  time: string;
  messages: Message[];
}

const DEFAULT_AI_CHAT: Conversation = {
  id: "ai_assistant",
  roomId: "room_ai_assistant",
  doctor: "MediBook AI Health Assistant",
  specialty: "24/7 AI Medical Guide",
  avatar: "",
  isBot: true,
  lastMessage: "Hello! Ask me about symptoms, specialists, or appointment bookings.",
  time: "Online",
  messages: [
    {
      senderRole: "ai",
      senderName: "MediBook AI Assistant",
      text: "Hello! I am your 24/7 MediBook AI Health Assistant. How can I assist you with your health today?",
      time: "Just now"
    }
  ]
};

export default function MessagesPage() {
  const { user } = useAuth();

  // Role simulation toggle for testing ("patient" or "doctor")
  const [activeRole, setActiveRole] = useState<"patient" | "doctor">(user?.role === "doctor" ? "doctor" : "patient");

  const [conversations, setConversations] = useState<Conversation[]>([DEFAULT_AI_CHAT]);
  const [activeChat, setActiveChat] = useState<Conversation>(DEFAULT_AI_CHAT);
  const [inputText, setInputText] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Typing indicator state
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync default active role with logged-in user
  useEffect(() => {
    if (user?.role === "doctor") {
      setActiveRole("doctor");
    }
  }, [user]);

  // Auto-scroll to bottom of message panel
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages, typingUser]);

  // Load user's booked appointments and chat history from MongoDB
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await apiRequest("/messages/conversations/my");
        if (res.data && res.data.length > 0) {
          const apiConvs: Conversation[] = res.data.map((c: any) => ({
            id: c.roomId,
            roomId: c.roomId,
            appointmentId: c.appointmentId,
            doctor: c.doctorName,
            patientName: c.patientName,
            specialty: activeRole === "doctor" ? `Patient: ${c.patientName}` : (c.doctorSpecialty || "Specialist"),
            avatar: c.doctorAvatar || "",
            isBot: false,
            lastMessage: c.lastMessage || `Booked for ${c.appointmentDate}`,
            time: c.appointmentTime || "Booked",
            messages: []
          }));

          setConversations([DEFAULT_AI_CHAT, ...apiConvs]);
        } else {
          // If no custom messages, fetch booked appointments directly
          const apptRes = await apiRequest("/appointments/my");
          if (apptRes.data && apptRes.data.length > 0) {
            const bookedConvs: Conversation[] = apptRes.data.map((appt: any) => ({
              id: appt._id,
              roomId: `room_${appt._id}`,
              appointmentId: appt._id,
              doctor: appt.doctorName,
              patientName: appt.patientName,
              specialty: activeRole === "doctor" ? `Patient: ${appt.patientName}` : (appt.doctorSpecialty || "General Specialist"),
              avatar: appt.doctorAvatar || "",
              isBot: false,
              lastMessage: `Confirmed appointment on ${appt.date} at ${appt.timeSlot}`,
              time: appt.timeSlot,
              messages: [
                {
                  senderRole: "doctor",
                  senderName: appt.doctorName,
                  text: `Hello ${appt.patientName || "Patient"}! Your appointment is confirmed for ${appt.date} at ${appt.timeSlot}. Feel free to message me here prior to our visit!`,
                  time: appt.date
                }
              ]
            }));
            setConversations([DEFAULT_AI_CHAT, ...bookedConvs]);
          }
        }
      } catch (err) {
        console.warn("Could not load backend conversations, using fallback:", err);
      }
    }

    loadConversations();
  }, [user, activeRole]);

  // Connect to Socket.io and handle real-time message events
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    if (socket.connected) {
      setSocketConnected(true);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Join current conversation room
    socket.emit("join_room", { roomId: activeChat.roomId });

    // Load room history from MongoDB
    async function loadRoomHistory() {
      if (!activeChat.isBot && activeChat.roomId) {
        try {
          const res = await apiRequest(`/messages/room/${activeChat.roomId}`);
          if (res.data && res.data.length > 0) {
            const formatted: Message[] = res.data.map((m: any) => ({
              _id: m._id,
              senderId: m.senderId,
              senderName: m.senderName,
              senderRole: m.senderRole,
              text: m.text,
              isRead: true,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setActiveChat(prev => ({ ...prev, messages: formatted }));
          }
        } catch (err) {
          console.warn("Failed to fetch room messages from API:", err);
        }
      }
    }

    loadRoomHistory();

    // Listen for incoming live socket messages
    const onReceiveMessage = (msg: any) => {
      if (msg.roomId === activeChat.roomId) {
        const formattedMsg: Message = {
          _id: msg._id,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderRole: msg.senderRole,
          text: msg.text,
          isRead: true,
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
        };

        setActiveChat((prev) => {
          if (prev.messages.some((m) => m._id === msg._id && msg._id)) return prev;
          return {
            ...prev,
            lastMessage: msg.text,
            messages: [...prev.messages, formattedMsg]
          };
        });

        // Update list sidebar
        setConversations((prevList) =>
          prevList.map((c) =>
            c.roomId === msg.roomId ? { ...c, lastMessage: msg.text } : c
          )
        );
      }
    };

    // Typing Listeners
    const onUserTyping = (data: any) => {
      if (data.roomId === activeChat.roomId) {
        setTypingUser(data.senderName || "Specialist");
      }
    };

    const onUserStopTyping = (data: any) => {
      if (data.roomId === activeChat.roomId) {
        setTypingUser(null);
      }
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stop_typing", onUserStopTyping);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stop_typing", onUserStopTyping);
    };
  }, [activeChat.roomId]);

  // Handle typing indicator emission
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    const socket = getSocket();
    if (socketConnected && activeChat.roomId) {
      socket.emit("typing", {
        roomId: activeChat.roomId,
        senderName: activeRole === "doctor" ? (user?.name || "Doctor") : (user?.name || "Patient")
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { roomId: activeChat.roomId });
      }, 1500);
    }
  };

  // Send Message function
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    if (!customText) setInputText("");

    const socket = getSocket();
    if (socketConnected) {
      socket.emit("stop_typing", { roomId: activeChat.roomId });
    }

    const payload = {
      roomId: activeChat.roomId,
      appointmentId: activeChat.appointmentId,
      senderId: user?._id || (activeRole === "doctor" ? "doc_user" : "patient_user"),
      senderName: activeRole === "doctor" ? (user?.name || "Doctor Specialist") : (user?.name || activeChat.patientName || "Patient"),
      senderRole: activeRole,
      recipientId: activeChat.isBot ? "ai_bot" : (activeRole === "doctor" ? activeChat.patientName : activeChat.doctor),
      text: textToSend
    };

    // Emit live socket event
    if (socketConnected) {
      socket.emit("send_message", payload);
    } else {
      // Local optimistic state update
      const localMsg: Message = {
        senderId: payload.senderId,
        senderName: payload.senderName,
        senderRole: payload.senderRole,
        text: textToSend,
        isRead: true,
        time: "Just now"
      };

      setActiveChat(prev => ({
        ...prev,
        lastMessage: textToSend,
        messages: [...prev.messages, localMsg]
      }));

      // HTTP API Fallback
      try {
        await apiRequest("/messages/send", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("HTTP message send fallback error:", err);
      }
    }
  };

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Live Doctor & Patient Consultation Chat
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Real-time Socket.io live messaging between medical specialists, patients, and 24/7 AI Assistant
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Active Role Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-muted/50 border border-border/70 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => setActiveRole("patient")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeRole === "patient"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-3.5 h-3.5" /> Patient View
            </button>
            <button
              type="button"
              onClick={() => setActiveRole("doctor")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeRole === "doctor"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" /> Doctor View
            </button>
          </div>

          {/* Real-time Socket Connection Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/70 bg-card shadow-xs">
            <div className="relative flex items-center justify-center">
              <Radio className={`w-4 h-4 ${socketConnected ? "text-emerald-500 animate-pulse" : "text-amber-500"}`} />
              {socketConnected && <span className="absolute size-2 rounded-full bg-emerald-500 animate-ping opacity-75" />}
            </div>
            <span className="text-xs font-extrabold text-foreground">
              {socketConnected ? "Socket Online" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[660px]">
        {/* Left Column: Active Consultations List */}
        <Card className={`rounded-3xl border-border/70 bg-card overflow-hidden flex flex-col shadow-sm ${showMobileChat ? "hidden md:flex" : "flex"}`}>
          <CardHeader className="p-4 pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-black text-foreground flex items-center justify-between">
              <span>Active Consultation Rooms</span>
              <span className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-black">
                {conversations.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 overflow-y-auto flex-1 space-y-1.5 scrollbar-none">
            {conversations.map((chat) => {
              const displayName = activeRole === "doctor" && chat.patientName ? chat.patientName : chat.doctor;
              const displaySub = activeRole === "doctor" ? "Booked Patient" : chat.specialty;
              const isSelected = activeChat.id === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat);
                    setShowMobileChat(true);
                  }}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 shadow-xs scale-[1.01]"
                      : "hover:bg-muted/40 border border-transparent"
                  }`}
                >
                  <Avatar className="h-11 w-11 border-2 border-emerald-500/30 shrink-0">
                    {chat.isBot ? (
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black">
                        <Bot className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={chat.avatar} alt={displayName} />
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold">
                          {activeRole === "doctor" ? <User className="w-5 h-5 text-emerald-600" /> : <Stethoscope className="w-5 h-5 text-emerald-600" />}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="overflow-hidden text-xs space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-foreground truncate flex items-center gap-1">
                        {displayName} {chat.isBot && <Sparkles className="w-3 h-3 text-amber-500" />}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-semibold">{chat.time}</span>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">{displaySub}</p>
                    <p className="text-muted-foreground truncate font-medium">{chat.lastMessage}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Column: Interactive Chat Window */}
        <Card className={`md:col-span-2 rounded-3xl border-border/70 bg-card overflow-hidden flex flex-col shadow-sm ${!showMobileChat ? "hidden md:flex" : "flex"}`}>
          {/* Chat Window Header */}
          <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1.5 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <Avatar className="h-11 w-11 border-2 border-emerald-500/30">
                {activeChat.isBot ? (
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black">
                    <Bot className="w-5 h-5 text-white" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={activeChat.avatar} alt={activeChat.doctor} />
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-bold">
                      {activeRole === "doctor" ? <User className="w-5 h-5 text-emerald-600" /> : <Stethoscope className="w-5 h-5 text-emerald-600" />}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div>
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  {activeRole === "doctor" && activeChat.patientName ? activeChat.patientName : activeChat.doctor}
                  {activeChat.isBot && <Sparkles className="w-4 h-4 text-amber-500" />}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {activeRole === "doctor" ? `Patient Consultation` : activeChat.specialty}
                </p>
              </div>
            </div>

            {/* Booked Status Badge */}
            {!activeChat.isBot && (
              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-extrabold">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified Consultation</span>
              </div>
            )}
          </div>

          {/* Quick Medical Action Chips */}
          <div className="px-4 py-2 bg-muted/30 border-b border-border/40 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">Quick Options:</span>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, "Hello Doctor, I would like to inquire about my prescription.")}
              className="px-3 py-1 rounded-full bg-card border border-border/60 hover:bg-emerald-500/10 text-foreground font-semibold shrink-0 text-[11px] flex items-center gap-1 transition-colors"
            >
              <Pill className="w-3 h-3 text-emerald-500" /> Prescription Inquiry
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, "Here is a brief summary of my current symptoms for our visit.")}
              className="px-3 py-1 rounded-full bg-card border border-border/60 hover:bg-emerald-500/10 text-foreground font-semibold shrink-0 text-[11px] flex items-center gap-1 transition-colors"
            >
              <FileText className="w-3 h-3 text-teal-500" /> Share Symptoms
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, "Can we confirm the exact time slot for our consultation?")}
              className="px-3 py-1 rounded-full bg-card border border-border/60 hover:bg-emerald-500/10 text-foreground font-semibold shrink-0 text-[11px] flex items-center gap-1 transition-colors"
            >
              <Clock className="w-3 h-3 text-cyan-500" /> Time Confirmation
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-muted/10">
            {activeChat.messages.map((msg, index) => {
              const isMyMessage = activeRole === "doctor" ? msg.senderRole === "doctor" : msg.senderRole === "patient";

              return (
                <div
                  key={msg._id || index}
                  className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-3xl text-xs font-semibold shadow-xs ${
                      isMyMessage
                        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-br-xs"
                        : "bg-card border border-border/70 text-foreground rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-2 text-[10px] text-muted-foreground font-medium">
                    {!isMyMessage && msg.senderName && <span>{msg.senderName} • </span>}
                    <span>{msg.time || "Just now"}</span>
                    {isMyMessage && (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 inline-block" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live Typing Indicator */}
            {typingUser && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-card border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 w-fit text-xs font-bold animate-pulse">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>{typingUser} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-border/60 flex items-center gap-2 bg-card">
            <Input
              placeholder={
                activeRole === "doctor"
                  ? `Reply to patient ${activeChat.patientName || "consultation"}...`
                  : `Send live message to ${activeChat.doctor}...`
              }
              value={inputText}
              onChange={handleInputChange}
              className="h-12 rounded-2xl text-xs bg-muted/30 border-border/60 focus:ring-2 focus:ring-emerald-500/20"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-2xl shrink-0 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md hover:opacity-95"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
