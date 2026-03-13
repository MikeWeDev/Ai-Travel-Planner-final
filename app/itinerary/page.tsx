"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, FormProvider } from "../context/FormContext";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ChevronLeft, 
  Download, 
  Save, 
  FileText, 
  Search, 
  MapPin, 
  Clock,
  ArrowRight
} from "lucide-react";

/* =====================================================
   TYPES (Untouched)
===================================================== */
type Activity = {
  name: string;
  lat: number;
  lng: number;
};

type Day = {
  day: number;
  title: string;
  activities: Activity[];
  image?: string;
};

type Itinerary = {
  title: string;
  days: Day[];
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const getFullImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const cleanPath = url.replace(/^\/?images\//, "");
  return `${BACKEND_URL}/images/${cleanPath}`;
};

function isItinerary(obj: unknown): obj is Itinerary {
  return (
    !!obj &&
    typeof obj === "object" &&
    "title" in obj &&
    typeof (obj as any).title === "string" &&
    "days" in obj &&
    Array.isArray((obj as any).days)
  );
}

/* =====================================================
   MAIN CONTENT COMPONENT
===================================================== */
function ItineraryContent() {
  const { itinerary } = useFormContext();
  const [localItinerary, setLocalItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const data: Itinerary | null = itinerary && isItinerary(itinerary) ? itinerary : localItinerary;
  const lowerSearch = search.toLowerCase();

  const filteredDays = useMemo(() => {
    if (!data || !data.days) return [];
    return data.days.filter((day: Day) => {
      const dayNum = day.day?.toString() ?? "";
      const dayMatch = dayNum.includes(lowerSearch);
      const titleMatch = (day.title ?? "").toLowerCase().includes(lowerSearch);
      const activityMatch = (day.activities ?? []).some((a: Activity) =>
        (a.name ?? "").toLowerCase().includes(lowerSearch)
      );
      return dayMatch || titleMatch || activityMatch;
    });
  }, [data, lowerSearch]);

  const saveToDb = async () => {
    if (!data) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to save your itinerary!");
      router.push("/auth/auth-login");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/itineraries/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ title: data.title, days: data.days }),
      });
      if (response.ok) { alert("💾 Trip saved successfully!"); } 
      else { const errorData = await response.json(); throw new Error(errorData.message || "Failed to save"); }
    } catch (err: any) { alert(err.message); } 
    finally { setSaving(false); }
  };

  useEffect(() => {
    const loadItinerary = () => {
      try {
        const saved = localStorage.getItem("lastItinerary");
        if (!saved) throw new Error("No itinerary found in localStorage.");
        const parsed = JSON.parse(saved);
        if (!isItinerary(parsed)) throw new Error("Itinerary data is invalid.");
        setLocalItinerary(parsed);
      } catch (err) { setError(err instanceof Error ? err.message : "Unknown error."); } 
      finally { setLoading(false); }
    };
    if (!itinerary) loadItinerary(); else setLoading(false);
  }, [itinerary]);

  const downloadPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor("#00a3cc");
    doc.text(data.title, 14, 20);
    let y = 30;
    data.days.forEach((day: Day, index: number) => {
      doc.setFontSize(14);
      doc.text(`Day ${day.day}: ${day.title}`, 14, y);
      autoTable(doc, {
        startY: y + 5,
        head: [["Activities"]],
        body: day.activities.map((a: Activity) => [a.name]),
        theme: "striped",
        didDrawPage: (t) => { if (t.cursor) y = t.cursor.y + 10; },
      });
      if (index < data.days.length - 1 && y > 250) { doc.addPage(); y = 20; }
    });
    doc.save("itinerary.pdf");
  };

  const downloadTxt = () => {
    if (!data) return;
    let text = `${data.title}\n\n`;
    data.days.forEach((day: Day) => {
      text += `Day ${day.day}: ${day.title}\n`;
      day.activities.forEach((a: Activity) => (text += `- ${a.name}\n`));
      text += "\n";
    });
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "itinerary.txt";
    link.click();
  };

  if (loading) return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0f] text-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <Sparkles size={48} className="text-[#00a3cc]" />
      </motion.div>
      <p className="mt-4 font-black italic uppercase tracking-widest text-sm text-gray-500">Initializing Manifest...</p>
    </main>
  );

  if (error || !data) return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0f] text-white p-6">
      <h2 className="text-4xl font-black italic uppercase text-red-500 mb-2">Manifest Error</h2>
      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-8">{error || "Data Corruption Detected"}</p>
      <button onClick={() => router.push("/")} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black italic uppercase hover:bg-white/10 transition-all flex items-center gap-3">
        <ChevronLeft size={16} /> Return to Base
      </button>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white pb-24">
      {/* HEADER SECTION */}
      <div className="w-full bg-[#1a1a1e] border-b border-white/5 pt-16 pb-12 px-8 mb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex-1">
            <div className="w-12 h-1 bg-[#00a3cc] mb-4" />
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              {data.title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "text-[#00a3cc]" : ""}>{word} </span>
              ))}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={saveToDb} disabled={saving} className="h-12 px-6 rounded-xl bg-[#00a3cc] text-white font-black italic uppercase text-[10px] flex items-center gap-2 hover:bg-[#00c2f3] transition-all">
              <Save size={14} /> {saving ? "Saving..." : "Save to Profile"}
            </button>
            <button onClick={downloadPDF} className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-black italic uppercase text-[10px] flex items-center gap-2 hover:bg-white/10 transition-all">
              <Download size={14} /> PDF
            </button>
            <button onClick={downloadTxt} className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-black italic uppercase text-[10px] flex items-center gap-2 hover:bg-white/10 transition-all">
              <FileText size={14} /> TXT
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {/* SEARCH BAR */}
        <div className="relative mb-16 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00a3cc] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search Objective, Activity, or Day..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-16 py-6 text-white font-black italic uppercase outline-none focus:border-[#00a3cc] transition-all"
          />
        </div>

        {/* ITINERARY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredDays.map((day: Day) => (
              <motion.div
                layout
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1a1a1e] border border-white/5 rounded-[40px] overflow-hidden group hover:border-[#00a3cc]/30 transition-all flex flex-col"
              >
               {day.image && (
  <div className="relative h-64 w-full overflow-hidden">
    <Image
      src={getFullImageUrl(day.image)}
      // Fixed: Explicitly ensuring alt is a string and descriptive
      alt={day.title || `Visual for Day ${day.day}`}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-700"
      unoptimized
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1e] via-transparent to-transparent" />
    <div className="absolute bottom-6 left-8">
      <span className="bg-[#00a3cc] text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase italic tracking-widest">
        Phase {day.day}
      </span>
    </div>
  </div>
)}

                <div className="p-8 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black italic uppercase text-white mb-6 group-hover:text-[#00a3cc] transition-colors leading-tight">
                    {day.title}
                  </h2>
                  
                  <div className="space-y-4 flex-1">
                    {day.activities.map((activity, i) => (
                      <div key={i} className="flex gap-4 items-start group/act">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-700 group-hover/act:bg-[#00a3cc] transition-colors" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-300 uppercase leading-relaxed tracking-tight">
                            {activity.name}
                          </p>
                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-tighter mt-1">
                            GPS: {activity.lat.toFixed(4)} / {activity.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* BOTTOM NAV */}
        <div className="mt-24 border-t border-white/5 pt-12 flex flex-col items-center">
          <button 
            onClick={() => router.push("/")} 
            className="group flex items-center gap-4 text-gray-500 hover:text-white transition-all font-black italic uppercase text-xs"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            New Operation
            <div className="w-12 h-[1px] bg-gray-800" />
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ItineraryPage() {
  return (
    <FormProvider>
      <ItineraryContent />
    </FormProvider>
  );
}