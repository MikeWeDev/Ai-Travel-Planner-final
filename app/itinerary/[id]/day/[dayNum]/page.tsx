"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from  "../../../../../utilis/api";
import { ChevronLeft, Target, Clock, ShieldCheck, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const TacticalMap = dynamic(() => import("../../../../components/TacticalMap"), { ssr: false });

export default function DayBriefingPage() {
  const { id, dayNum } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await authenticatedFetch(`${BACKEND_URL}/api/itineraries/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          router.push(`/itinerary/${id}`);
        }
      } catch (err) {
        console.error("Error reading specific briefing data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, router, BACKEND_URL]);

  const activeDayData = useMemo(() => {
    if (!data?.days) return null;
    return data.days.find((d: any) => d.day.toString() === dayNum);
  }, [data, dayNum]);

  const singleDayCoords = useMemo(() => {
    if (!activeDayData?.activities) return [];
    return activeDayData.activities.map((act: any) => ({
      lat: act.lat,
      lng: act.lng,
      name: act.name
    })).filter((c: any) => c.lat !== 0 && c.lat !== undefined);
  }, [activeDayData]);

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center text-white">
      <p className="font-black italic uppercase tracking-[0.4em] text-[11px] text-[#00a3cc] animate-pulse">Isolating Spatial Vectors...</p>
    </div>
  );

  if (!activeDayData) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center text-white p-6">
        <p className="text-xs uppercase font-black text-gray-500 mb-4">Specified Day Segment Matrix Not Found</p>
        <button onClick={() => router.push(`/itinerary/${id}`)} className="text-xs text-[#00a3cc] uppercase font-black italic">Return to Base Blueprint</button>
      </div>
    );
  }

  return (
    // ✅ Restructured layout flow: flex-col ensures clean sequential vertical stacking
    // Added safety padding-top (pt-28) to stay perfectly clear of overlapping global Navbars
    <main className="min-h-screen bg-[#0d0d0f] text-white p-6 md:p-12 pb-32 pt-28">
      <div className="max-w-6xl mx-auto  mt-10">
        
        {/* Navigation Action Row */}
        <div className="mb-12">
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push(`/itinerary/${id}`)}
            className="flex items-center gap-4 text-gray-500 hover:text-white transition-all font-black italic uppercase text-xs group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform  text-2xl" /> 
            Back to Master Itinerary
          </motion.button>
        </div>

        {/* Tactical Title Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#00a3cc] text-black font-black italic uppercase tracking-widest text-[9px] px-3 py-1 rounded-md">
              PHASE {dayNum}
            </span>
            <span className="text-gray-600 text-[9px] font-black uppercase tracking-widest">
              {singleDayCoords.length} Tracked Objectives
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-white">
            {activeDayData.title || `Day ${dayNum} Operational Framework`}
          </h1>
        </header>

        {/* ✅ MAP POSITIONED AT THE TOP (Matching parent detail page archetype exactly) */}
        <section className="mb-16 h-[450px] w-full rounded-[40px] overflow-hidden border border-white/5 shadow-2xl relative z-0">
          <div className="absolute top-6 left-6 z-[1000] bg-[#0d0d0f]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl">
             <p className="text-[9px] font-black italic uppercase tracking-widest flex items-center gap-2">
               <Navigation size={10} className="text-[#00a3cc] animate-pulse" /> 
               Isolated Satellite Feed: Day {dayNum} Active Vector
             </p>
          </div>
          <TacticalMap allCoords={singleDayCoords} activeDayParam={dayNum as string} />
        </section>

        {/* ✅ ATTRACTIVE OBJECTIVES LIST RENDERED BELOW THE MAP */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-gray-500 text-[10px] font-black italic uppercase tracking-[0.3em] mb-8 block">
            Objective Checkpoint Manifest
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDayData.activities.map((activity: any, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#1a1a1e] border border-white/5 rounded-[30px] p-6 hover:border-[#00a3cc]/30 transition-all flex gap-5 items-start relative overflow-hidden group"
              >
                {/* Numeric Index Badge */}
                <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl w-10 h-10 flex items-center justify-center shrink-0 text-[#00a3cc]">
                  <span className="font-black text-xs italic">{idx + 1}</span>
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-black uppercase italic tracking-tight text-white mb-2 leading-tight group-hover:text-[#00a3cc] transition-colors">
                    {activity.name}
                  </h3>
                  
                  {/* Localized Geolocation Info strings */}
                  <p className="text-[8px] font-black italic text-gray-600 uppercase tracking-tighter mb-4">
                    COORDS: {activity.lat ? activity.lat.toFixed(4) : "0.0000"} / {activity.lng ? activity.lng.toFixed(4) : "0.0000"}
                  </p>
                  
                  {/* Tactical Target Metadata Tags */}
                  <div className="flex flex-wrap gap-2 text-[8px] font-black italic uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                      <Clock size={8} className="text-[#00a3cc]" /> Verified Schedule
                    </span>
                    <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                      <ShieldCheck size={8} className="text-[#00a3cc]" /> Secure Hub
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}