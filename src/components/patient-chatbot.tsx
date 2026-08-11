"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bot,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  Minimize2,
  Calendar,
  CreditCard
} from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  doctorRecommendation?: {
    name: string;
    specialty: string;
    id: string;
  };
  quickLink?: {
    label: string;
    href: string;
  };
}

const QUICK_PROMPTS = [
  "🩺 Recommend a specialist for my headache",
  "💳 How do I pay via UPI or Stripe?",
  "📅 How do I view my booked appointments?",
  "❤️ What does a Cardiology visit cost?"
];

export function PatientChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: `Hello ${user ? user.name : "Patient"}! 👋 I'm your MediBook AI Health Assistant. How can I assist your healthcare journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const generateBotReply = (userQuery: string): Message => {
    const query = userQuery.toLowerCase();
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (query.includes("headache") || query.includes("brain") || query.includes("migraine") || query.includes("neuro")) {
      return {
        id: Date.now().toString(),
        sender: "bot",
        text: "Based on your symptoms related to headaches or neurology, I recommend consulting with our Neurology specialist Dr. Michael Chen.",
        timestamp: now,
        doctorRecommendation: {
          name: "Dr. Michael Chen",
          specialty: "Neurology",
          id: "neurology-doc",
        },
        quickLink: {
          label: "Book with Dr. Michael Chen ($175)",
          href: "/book",
        },
      };
    }

    if (query.includes("heart") || query.includes("chest") || query.includes("cardio") || query.includes("blood pressure")) {
      return {
        id: Date.now().toString(),
        sender: "bot",
        text: "For cardiovascular health, heart checkups, or chest symptoms, Dr. Sarah Jenkins is our leading Board-certified Cardiologist.",
        timestamp: now,
        doctorRecommendation: {
          name: "Dr. Sarah Jenkins",
          specialty: "Cardiology",
          id: "cardiology-doc",
        },
        quickLink: {
          label: "Book with Dr. Sarah Jenkins ($150)",
          href: "/book",
        },
      };
    }

    if (query.includes("child") || query.includes("kid") || query.includes("fever") || query.includes("pediatric")) {
      return {
        id: Date.now().toString(),
        sender: "bot",
        text: "For pediatric consultations, infant and adolescent care, Dr. Emily Rodriguez offers expert compassionate care.",
        timestamp: now,
        doctorRecommendation: {
          name: "Dr. Emily Rodriguez",
          specialty: "Pediatrics",
          id: "pediatric-doc",
        },
        quickLink: {
          label: "Book with Dr. Emily Rodriguez ($120)",
          href: "/book",
        },
      };
    }

    if (query.includes("pay") || query.includes("stripe") || query.includes("upi") || query.includes("razorpay") || query.includes("billing")) {
      return {
        id: Date.now().toString(),
        sender: "bot",
        text: "MediBook supports secure payments via both Stripe (Credit/Debit Cards) and Razorpay (UPI, Google Pay, Paytm). During checkout, you can select your preferred gateway and test card presets.",
        timestamp: now,
        quickLink: {
          label: "View Payments & Receipts",
          href: "/payments",
        },
      };
    }

    if (query.includes("appointment") || query.includes("booking") || query.includes("schedule") || query.includes("cancel")) {
      return {
        id: Date.now().toString(),
        sender: "bot",
        text: "You can view all your scheduled visits on your Appointments dashboard, or browse available date slots on the Interactive Calendar.",
        timestamp: now,
        quickLink: {
          label: "Open Calendar Schedule",
          href: "/calendar",
        },
      };
    }

    // Default fallback
    return {
      id: Date.now().toString(),
      sender: "bot",
      text: "I am your AI Healthcare Assistant! You can ask me about symptom recommendations, doctor specialties (Cardiology, Neurology, Pediatrics, Dermatology), booking procedures, or payment support.",
      timestamp: now,
      quickLink: {
        label: "Explore Doctor Catalog",
        href: "/doctors",
      },
    };
  };

  const handleSend = (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg = generateBotReply(messageText);
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  // Don't show chatbot for Doctor role
  if (user?.role === "doctor") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-emerald-600 text-white font-bold shadow-2xl hover:scale-105 transition-all duration-200"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <span className="text-xs hidden sm:inline-block">AI Health Assistant</span>
        </button>
      )}

      {/* Expanded Chat Widget Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl border border-muted bg-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary via-primary/90 to-emerald-600 text-primary-foreground flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  <AvatarFallback className="bg-white/20 text-white font-bold">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  MediBook AI Assistant <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <p className="text-[11px] text-primary-foreground/80">Online • Healthcare Guide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-muted/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl space-y-2 ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                      : "bg-background border shadow-xs rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Doctor Recommendation Chip */}
                  {msg.doctorRecommendation && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 space-y-1 mt-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px]">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recommended: {msg.doctorRecommendation.name}</span>
                      </div>
                      <p className="text-[10px] text-emerald-700">{msg.doctorRecommendation.specialty} Specialist</p>
                    </div>
                  )}

                  {/* Quick Link Button */}
                  {msg.quickLink && (
                    <Button
                      asChild
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="w-full h-8 rounded-xl text-[11px] font-semibold bg-gradient-to-r from-primary to-emerald-600 text-white shadow-sm mt-1"
                    >
                      <Link href={msg.quickLink.href}>
                        {msg.quickLink.label} <ChevronRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  )}

                  <span
                    className={`text-[9px] block text-right font-medium ${
                      msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground text-[11px] p-2">
                <Bot className="w-4 h-4 animate-spin text-primary" />
                <span>AI Assistant is typing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-background border-t overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-[10px] font-semibold whitespace-nowrap border transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-background border-t flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI health assistant..."
              className="h-10 rounded-xl text-xs flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="h-10 w-10 rounded-xl shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
