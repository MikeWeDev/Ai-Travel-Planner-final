"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "../../../utilis/api"; 
import { ChevronLeft, Search, Sparkles, Navigation, Target, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const TacticalMap = dynamic(() => import("../../components/TacticalMap"), { ssr: false });

export default function ItineraryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await authenticatedFetch(`${BACKEND_URL}/api/itineraries/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching detail:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, router, BACKEND_URL]);

  const allCoords = useMemo(() => {
    if (!data?.days) return [];
    return data.days.flatMap((day: any) => 
      (day.activities || []).map((act: any) => ({
        lat: act.lat,
        lng: act.lng,
        name: act.name
      })).filter((coord: any) => coord.lat !== 0 && coord.lat !== undefined)
    );
  }, [data]);

  const filteredDays = useMemo(() => {
    if (!data?.days) return [];
    return data.days.filter((day: any) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        day.day.toString().includes(searchLower) ||
        (day.title || "").toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchQuery]);

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center text-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <Sparkles size={48} className="text-[#00a3cc]" />
      </motion.div>
      <p className="mt-4 font-black italic uppercase tracking-[0.4em] text-[10px] text-gray-600">Retrieving Manifest...</p>
    </div>
  );

  if (!data) return null;

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white p-6 md:p-12 pb-32">
      <div className="max-w-6xl mx-auto pt-16">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-4 text-gray-500 hover:text-white transition-all font-black italic uppercase text-xs group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Mission Logs
          </button>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input 
              type="text"
              placeholder="Filter Objectives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black italic uppercase tracking-widest focus:outline-none focus:border-[#00a3cc]/50"
            />
          </div>
        </div>

        <header className="mb-12">
          <div className="w-12 h-1 bg-[#00a3cc] mb-6" />
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            {data.title?.split(' ').map((word: string, i: number) => (
              <span key={i} className={i % 2 !== 0 ? "text-[#00a3cc]" : ""}>{word} </span>
            ))}
          </h1>
        </header>

        <section className="mb-20 h-[500px] w-full rounded-[40px] overflow-hidden border border-white/5 shadow-2xl relative z-0">
          <div className="absolute top-6 left-6 z-[1000] bg-[#0d0d0f]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl">
             <p className="text-[9px] font-black italic uppercase tracking-widest flex items-center gap-2">
               <Navigation size={10} className="text-[#00a3cc]" /> Satellite Feed: Total Architecture Active
             </p>
          </div>
          <TacticalMap allCoords={allCoords} activeDayParam={null} />
        </section>

        <div className="max-w-4xl mx-auto">
          <div className="relative border-l-2 border-dashed border-white/5 ml-4 md:ml-12 space-y-16">
            <AnimatePresence mode="popLayout">
              {filteredDays.map((day: any) => (
                <motion.section 
                  key={day.day} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative pl-12 md:pl-20"
                >
                  <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#0d0d0f] border-2 border-[#00a3cc] shadow-[0_0_15px_rgba(0,163,204,0.5)] z-10" />
                  
                  <div className="bg-[#1a1a1e] border border-white/5 p-8 md:p-10 rounded-[40px] hover:border-[#00a3cc]/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <span className="text-[#00a3cc] text-[10px] font-black italic uppercase tracking-[0.3em] mb-2 block">Phase {day.day}</span>
                        <h2 className="text-3xl font-black italic uppercase text-white leading-none">
                          {day.title || `Day ${day.day} Operations`}
                        </h2>
                      </div>
                      
                      <button
                        onClick={() => router.push(`/itinerary/${id}/day/${day.day}`)}
                        className="flex items-center gap-2 bg-[#00a3cc]/10 hover:bg-[#00a3cc]/20 border border-[#00a3cc]/20 rounded-xl px-5 py-3 text-[10px] font-black italic uppercase tracking-widest text-[#00a3cc] transition-all group shrink-0"
                      >
                        <Compass size={14} className="group-hover:rotate-45 transition-transform" />
                        Launch Day Briefing
                      </button>
                    </div>

                    {/* ✅ FIXED: Restored the exact sub-activity detail logs below */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(day.activities || []).map((activity: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-black/20 border border-white/5 group hover:border-[#00a3cc]/20 transition-all">
                          <Target size={16} className="mt-1 text-gray-700 group-hover:text-[#00a3cc] transition-colors" />
                          <div>
                            <p className="text-[11px] font-bold text-gray-200 uppercase tracking-tight leading-relaxed">{activity.name}</p>
                            <p className="text-[8px] font-black italic text-gray-600 uppercase tracking-tighter mt-1">
                              LOC: {activity.lat ? activity.lat.toFixed(4) : "0.0000"} / {activity.lng ? activity.lng.toFixed(4) : "0.0000"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}