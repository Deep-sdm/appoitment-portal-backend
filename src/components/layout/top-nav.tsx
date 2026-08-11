"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Bell,
  Search,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Calendar,
  Stethoscope,
  Check,
  Loader2,
  LogOut,
  Settings,
  CalendarClock,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Command
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/context/auth-context";
import { NotificationService, AppNotification } from "@/services/notification.service";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [isOpenNotif, setIsOpenNotif] = useState(false);
  const [isOpenUserMenu, setIsOpenUserMenu] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoadingNotifs(true);
      const data = await NotificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await NotificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleLogout = () => {
    logout();
    setIsOpenUserMenu(false);
    router.push("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "MB";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_confirmed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "appointment_cancelled":
        return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
      case "appointment_completed":
        return <Stethoscope className="w-4 h-4 text-cyan-500 shrink-0" />;
      case "appointment_booked":
        return <Calendar className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    const diff = Math.floor((Date.now() - time) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/80 backdrop-blur-md px-4 lg:px-6">
      <div className="flex items-center gap-3 flex-1">
        <SidebarTrigger className="-ml-1 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600" />
        <div className="w-full max-w-sm hidden md:flex items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search doctors, symptoms, appointments..."
              className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-background pl-9 pr-12 h-9 rounded-2xl text-xs transition-all border-border/50"
            />
            <div className="absolute right-3 top-2 flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-md border border-border/40 pointer-events-none">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Notification Bell Popover */}
        {user && (
          <Popover open={isOpenNotif} onOpenChange={(open) => { setIsOpenNotif(open); if (open) fetchNotifications(); }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-2xl border border-border/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all">
                <Bell className="h-4.5 w-4.5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full shadow-md animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 sm:w-96 p-0 rounded-3xl border-border/80 shadow-2xl overflow-hidden backdrop-blur-xl bg-popover">
              <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                    Notifications
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
                {loadingNotifs && notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Fetching notifications...
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-3.5 flex gap-3 transition-colors ${
                        !notif.isRead ? "bg-emerald-500/5 font-semibold" : "hover:bg-muted/30 opacity-80"
                      }`}
                    >
                      <div className="pt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground truncate">{notif.title}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-medium">{getTimeAgo(notif.createdAt)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif._id, e)}
                          title="Mark read"
                          className="self-center p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-600"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <Bell className="w-8 h-8 mx-auto text-muted-foreground/40" />
                    <p className="text-xs font-bold text-muted-foreground">No notifications yet</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      Notifications for appointment requests & status updates will appear here.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-border/60 bg-muted/20 text-center">
                <Link
                  href="/appointments"
                  onClick={() => setIsOpenNotif(false)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View All Appointments &rarr;
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* User Profile Avatar & Dropdown Menu */}
        {user ? (
          <Popover open={isOpenUserMenu} onOpenChange={setIsOpenUserMenu}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 p-1 px-1.5 rounded-2xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all outline-none"
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 border-2 border-emerald-500/40 shadow-sm">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight text-foreground flex items-center gap-1">
                    {user.name} <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize font-extrabold">{user.role} Account</span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2 rounded-3xl border-border/80 shadow-2xl overflow-hidden backdrop-blur-xl bg-popover">
              {/* User Identity Header */}
              <div className="p-3 border-b border-border/50 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl mb-1">
                <p className="font-extrabold text-sm text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate font-medium">{user.email}</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-full capitalize">
                  Role: {user.role}
                </span>
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5">
                <Link
                  href="/settings"
                  onClick={() => setIsOpenUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-emerald-500/10 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-emerald-600" /> Account Settings
                </Link>
                <Link
                  href="/appointments"
                  onClick={() => setIsOpenUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-emerald-500/10 rounded-xl transition-colors"
                >
                  <CalendarClock className="w-4 h-4 text-emerald-600" /> My Appointments
                </Link>
              </div>

              {/* Logout Button */}
              <div className="pt-1 mt-1 border-t border-border/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" /> Log Out Account
                </button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button asChild size="sm" className="rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-md">
            <Link href="/login">
              <UserIcon className="w-4 h-4 mr-2" />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}

