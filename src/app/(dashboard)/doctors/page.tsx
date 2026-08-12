"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Loader2,
  Stethoscope,
  Sparkles,
  Video,
  CheckCircle2,
  Palmtree
} from "lucide-react";

const specialties = ["All", "Cardiology", "Neurology", "Pediatrics", "Dermatology", "Orthopedics", "General Medicine"];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async (search = searchQuery) => {
    try {
      setLoading(true);
      let url = `/doctors?specialty=${selectedSpecialty}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await apiRequest(url);
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors(searchQuery);
  };

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Doctor Specialists Directory
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Browse certified physicians, check consultation fees & schedule appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search doctor name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-card border-border/80 text-xs shadow-xs"
            />
          </form>
        </div>
      </div>

      {/* Specialty Filter Segmented Pure Emerald Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {specialties.map((spec) => {
          const isActive = selectedSpecialty === spec;
          return (
            <button
              key={spec}
              type="button"
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 border ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/20 scale-[1.02] border-transparent"
                  : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {spec}
            </button>
          );
        })}
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Loading medical specialists...</p>
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {
            return (
              <Card key={doctor._id} className="flex flex-col justify-between rounded-3xl border-border/80 bg-card shadow-sm hover-lift overflow-hidden">
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-emerald-500/30 shadow-xs shrink-0">
                        <AvatarImage src={doctor.avatar} alt={doctor.name} />
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-700 font-extrabold">
                          <Stethoscope className="w-7 h-7 text-emerald-600" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          {doctor.specialty}
                        </span>
                        {doctor.holidays && doctor.holidays.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black bg-red-500/10 text-red-700 dark:text-red-300 rounded-full border border-red-500/20">
                            <Palmtree className="w-3 h-3" /> Holiday Alert
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-foreground truncate">{doctor.name}</h3>

                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                        <span>{doctor.rating}</span>
                        <span className="text-muted-foreground font-medium">({doctor.reviewsCount || 12} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pt-2 text-xs space-y-3 text-muted-foreground">
                  <p className="line-clamp-2 leading-relaxed font-medium">{doctor.bio}</p>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50 text-foreground font-bold">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>{doctor.experience} Yrs Exp</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>${doctor.fee} / Visit</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground pt-0.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{doctor.location}</span>
                  </div>
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-2 gap-2">
                  <Button asChild className="flex-1 rounded-2xl h-11 font-black shadow-md bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:opacity-95 text-white text-xs">
                    <Link href={`/book?doctorId=${doctor._id}`}>
                      <Calendar className="w-3.5 h-3.5 mr-1.5" /> Book Consultation
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-3xl p-12 text-center border-border/80">
          <Stethoscope className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-base font-black text-foreground">No doctor specialists found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or specialty filter.</p>
        </Card>
      )}
    </div>
  );
}
