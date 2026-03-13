"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MapPin, Calendar, ArrowRight, Sparkles, Database, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authenticatedFetch } from "../../utilis/api";

export default function Dashboard() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(`${BACKEND_URL}/api/itineraries/my-itineraries`);
      if (res.ok) {
        const data = await res.json();
        setItineraries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItinerary = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/itineraries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItineraries(prev => prev.filter((it: any) => it._id !== id));
      }
    } catch (err) {
      console.error("Delete Request Failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white p-8">
      <div className="max-w-5xl mx-auto pt-20">
        
        {/* HEADER SECTION */}
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-12 h-1 bg-[#00a3cc] mb-6" />
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">
              MISSION <span className="text-[#00a3cc]">LOGS.</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-2">
              <History size={12} className="text-[#00a3cc]" /> ARCHIVED EXPEDITION DATA
            </p>
          </motion.div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Database size={32} className="text-[#00a3cc]" />
            </motion.div>
            <p className="text-[10px] font-black italic uppercase tracking-widest text-gray-600">Querying Database...</p>
          </div>
        ) : itineraries.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1e] border border-white/5 rounded-[40px] p-20 text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Sparkles size={30} className="text-gray-700" />
            </div>
            <p className="text-gray-500 font-black italic uppercase text-lg mb-8 tracking-tight">No Active Itineraries in Memory.</p>
            <button 
                onClick={() => router.push("/plan")} 
                className="bg-[#00a3cc] hover:bg-[#00c2f3] text-white px-10 py-4 rounded-2xl font-black italic uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(0,163,204,0.2)] transition-all"
            >
                Initialize Plan
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {itineraries.map((it: any) => (
                <motion.div 
                  key={it._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group flex flex-col md:flex-row items-center justify-between bg-[#1a1a1e] border border-white/5 p-8 rounded-[32px] hover:border-[#00a3cc]/30 transition-all"
                >
                  <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="hidden sm:flex bg-white/5 p-5 rounded-[24px] text-[#00a3cc] group-hover:bg-[#00a3cc] group-hover:text-white transition-all">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic uppercase text-white group-hover:text-[#00a3cc] transition-colors tracking-tight">
                        {it.title || "Untitled Trip"}
                      </h3>
                      <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                        <span className="flex items-center gap-2">
                          <Calendar size={12} className="text-[#00a3cc]" /> 
                          {it.createdAt ? new Date(it.createdAt).toLocaleDateString() : "No Date"}
                        </span>
                        <span className="flex items-center gap-2">
                          <History size={12} className="text-[#00a3cc]" />
                          {it.days?.length || 0} Standard Days
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-8 md:mt-0 w-full md:w-auto">
                    <button 
                      onClick={() => router.push(`/itinerary/${it._id}`)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl text-[11px] font-black italic uppercase tracking-widest transition-all border border-white/5"
                    >
                      Access Data <ArrowRight size={16} className="text-[#00a3cc]" />
                    </button>
                    <button 
                      onClick={() => deleteItinerary(it._id)}
                      className="p-4 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}