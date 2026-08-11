"use client";

import { Calendar, Home, Users, MessageSquare, CreditCard, FileText, Settings, LogOut, CalendarClock, Stethoscope, Video, Sparkles, Activity } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();

  const isDoctor = user?.role === "doctor";

  // Menu items based on role
  const items = isDoctor
    ? [
        { title: "Doctor Portal", url: "/", icon: Stethoscope },
        { title: "Patient Schedule Queue", url: "/calendar", icon: Calendar },
        { title: "Telehealth Video Call", url: "/telehealth", icon: Video },
        { title: "Messages & Chat", url: "/messages", icon: MessageSquare },
        { title: "Earnings & Receipts", url: "/payments", icon: CreditCard },
        { title: "Settings", url: "/settings", icon: Settings },
      ]
    : [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "Book Appointment", url: "/book", icon: CalendarClock },
        { title: "Telehealth Video Call", url: "/telehealth", icon: Video },
        { title: "Doctors Directory", url: "/doctors", icon: Users },
        { title: "My Appointments", url: "/appointments", icon: FileText },
        { title: "Calendar Schedule", url: "/calendar", icon: Calendar },
        { title: "Messages", url: "/messages", icon: MessageSquare },
        { title: "Payments", url: "/payments", icon: CreditCard },
        { title: "Analytics & Reports", url: "/reports", icon: FileText },
        { title: "Settings", url: "/settings", icon: Settings },
      ];

  const handleLogout = () => {
    logout();
    if (isMobile) setOpenMobile(false);
    router.push("/login");
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="border-r border-border/80 bg-sidebar">
      {/* Header Brand Logo */}
      <SidebarHeader className="h-16 flex items-center justify-between px-4 border-b border-border/60">
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-2.5 font-extrabold text-xl group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="tracking-tight text-foreground text-lg leading-none font-black flex items-center gap-1">
              MediBook
              <Sparkles className="w-3 h-3 text-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
              Healthcare SaaS
            </span>
          </div>
        </Link>
        {isMobile && (
          <button
            type="button"
            onClick={() => setOpenMobile(false)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Close navigation"
          >
            <span className="sr-only">Close sidebar</span>
            ✕
          </button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/80 px-2 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {isDoctor ? "Doctor Portal Suite" : "Patient Portal"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1.5">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={handleLinkClick}
                      render={<Link href={item.url} />}
                      className={`w-full justify-start gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-emerald-500/10"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/60">
        {user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="w-full justify-start gap-3 px-3.5 py-2.5 rounded-2xl text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-500/10 font-bold text-xs transition-all"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout ({user.name.split(" ")[0]})</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLinkClick}
                render={<Link href="/login" />}
                className="w-full justify-start gap-3 px-3.5 py-2.5 rounded-2xl text-emerald-600 hover:bg-emerald-500/10 font-bold text-xs transition-all"
              >
                <LogOut className="w-4 h-4 shrink-0 rotate-180" />
                <span>Sign In Account</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}


