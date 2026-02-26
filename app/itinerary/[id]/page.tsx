"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "../../../utilis/api"; 
import { ChevronLeft, Calendar, MapPin, Sparkles, Clock, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ItineraryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

  // ✅ Search Filter Logic
  const filteredDays = useMemo(() => {
    if (!data?.days) return [];
    return data.days.filter((day: any) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        day.day.toString().includes(searchLower) || 
        day.title.toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchQuery]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="animate-pulse text-indigo-300">Unlocking Expedition Data...</p>
    </div>
  );

  if (!data) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white p-6 md:p-12 mt-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-indigo-400 hover:text-pink-400 transition-all group"
          >
            <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={24} /> 
            <span className="font-bold">Back to Dashboard</span>
          </button>

          {/* ✅ Search Input Field */}
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-pink-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search Day or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Hero Header */}
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-pink-300 leading-tight"
          >
            {data.title}
          </motion.h1>

          {/* ✅ Quick Navigation Dots */}
          <div className="flex flex-wrap gap-2 mb-8">
            {data.days.map((day: any) => (
              <button
                key={day.day}
                onClick={() => setSearchQuery(day.day.toString())}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  searchQuery === day.day.toString() 
                  ? "bg-pink-600 text-white" 
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                Day {day.day}
              </button>
            ))}
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="px-3 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300">
                Show All
              </button>
            )}
          </div>
        </header>

        {/* The Timeline Visualization */}
        <div className="relative">
          {/* Vertical Glowing Line - Only visible if search isn't filtering down to one item */}
          {filteredDays.length > 1 && (
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 via-indigo-500 to-transparent opacity-20" />
          )}

          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {filteredDays.length > 0 ? (
                filteredDays.map((day: any) => (
                  <motion.section 
                    key={day.day}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative pl-12 md:pl-24"
                  >
                    <div className="absolute left-[9px] md:left-[25px] top-0 w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] border-4 border-black" />
                    
                    <div className="group bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-300 shadow-2xl">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-pink-400 transition-colors">
                          Day {day.day}
                        </h2>
                        <span className="text-indigo-300 font-medium px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm w-fit">
                          {day.title}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        {day.activities.map((activity: string, idx: number) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 text-indigo-100/90"
                          >
                            <MapPin size={18} className="mt-1 text-pink-500 shrink-0" />
                            <span className="text-sm md:text-base leading-relaxed">{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.section>
                ))
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-gray-400">No matching days found for "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery("")} className="text-pink-500 mt-2 font-bold">Clear Search</button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}