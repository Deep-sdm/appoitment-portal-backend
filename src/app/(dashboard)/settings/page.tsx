"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Camera,
  Upload,
  Save,
  CheckCircle2,
  Loader2,
  Sparkles,
  Trash2,
  LogOut,
  ShieldAlert
} from "lucide-react";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop"
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "+1 (555) 123-4567");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.avatar) setAvatar(user.avatar);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size should be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setAvatar(reader.result as string);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ name, email, avatar, phone }),
      });

      if (res.data) {
        updateUser(res.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          Account & Profile Settings
          <Sparkles className="w-5 h-5 text-emerald-500" />
        </h2>
        <p className="text-muted-foreground text-sm font-medium">
          Manage your profile avatar, personal contact information, and security preferences
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile picture and account information updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Picture Upload Section */}
        <Card className="rounded-3xl border-border/70 bg-card overflow-hidden shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Camera className="w-4.5 h-4.5 text-emerald-600" /> Profile Photo & Avatar
            </CardTitle>
            <CardDescription className="text-xs font-medium">Upload a custom profile photo or select a preset avatar</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-emerald-500/30 shadow-md">
                  <AvatarImage src={avatar || user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-2xl">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : "MB"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl h-10 px-4 text-xs font-bold gap-1.5 border-border/70"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo
                  </Button>
                  {avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatar("")}
                      className="rounded-2xl h-10 text-xs font-bold text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="avatar-url" className="text-xs font-bold text-foreground">Custom Image URL</Label>
                  <Input
                    id="avatar-url"
                    type="url"
                    placeholder="https://example.com/my-photo.jpg"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="h-11 rounded-2xl text-xs bg-muted/30 border-border/60 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Presets */}
            <div className="pt-3 space-y-2 border-t border-border/60">
              <span className="text-xs font-extrabold text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Choose Preset Avatar
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {AVATAR_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`rounded-full p-0.5 border-2 transition-all shrink-0 ${
                      avatar === preset ? "border-emerald-500 scale-110 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={preset} alt={`Preset ${index}`} />
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Form */}
        <Card className="rounded-3xl border-border/70 bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
              <UserIcon className="w-4.5 h-4.5 text-emerald-600" /> Personal Details
            </CardTitle>
            <CardDescription className="text-xs font-medium">Update your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-foreground">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-2xl text-xs bg-muted/30 border-border/60 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-2xl text-xs bg-muted/30 border-border/60 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold text-foreground">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-2xl text-xs bg-muted/30 border-border/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-2xl px-6 h-12 font-extrabold text-xs shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Profile & Settings
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Logout Account Danger Zone */}
      <Card className="rounded-3xl border-red-500/30 bg-red-500/5 shadow-sm">
        <CardHeader className="pb-3 border-b border-red-500/20">
          <CardTitle className="text-base font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500" /> Account Session Security
          </CardTitle>
          <CardDescription className="text-xs font-medium">Sign out of your active session</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div className="text-xs text-muted-foreground font-medium">
            Logging out will clear your authentication session and return you to the sign-in screen.
          </div>
          <Button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl h-11 px-5 font-extrabold text-xs bg-red-600 hover:bg-red-700 text-white shrink-0 shadow-md flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Log Out Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

