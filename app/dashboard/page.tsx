"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MapPin, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {authenticatedFetch} from "../../utilis/api";
export default function Dashboard() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    console.log("🚀 Dashboard Component Mounted");
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
    console.log("🗑️ Attempting to delete ID:", id);
    if (!confirm("Are you sure you want to delete this trip?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/itineraries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("📥 Delete Response Status:", res.status);
      
      if (res.ok) {
        console.log("✅ Delete successful on server.");
        setItineraries(prev => prev.filter((it: any) => it._id !== id));
      } else {
        console.error("❌ Delete failed on server.");
      }
    } catch (err) {
      console.error("🔥 Delete Request Failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black text-white p-8">
      <div className="max-w-5xl mx-auto pt-10">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black mb-2"
          >
            My Saved Expeditions
          </motion.h1>
          <p className="text-indigo-300">Manage your AI-generated travel plans.</p>
        </header>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-xl">🔍 Searching the archives...</div>
        ) : itineraries.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
            <p className="text-gray-400 mb-6 font-medium text-lg">You haven't saved any trips yet.</p>
            <button 
                onClick={() => router.push("/plan")} 
                className="bg-pink-600 hover:bg-pink-700 px-8 py-3 rounded-full font-bold shadow-lg transition transform hover:scale-105"
            >
                Start Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {itineraries.map((it: any) => (
              <motion.div 
                key={it._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col md:flex-row items-center justify-between bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/15 transition-all shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-4 rounded-xl shadow-lg">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">
                      {it.title || "Untitled Trip"}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> 
                        {it.createdAt ? new Date(it.createdAt).toLocaleDateString() : "No Date"}
                      </span>
                      <span className="text-indigo-300 font-medium">
                        {it.days?.length || 0} Days Plan
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <button 
                    onClick={() => router.push(`/itinerary/${it._id}`)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/20 px-5 py-2 rounded-xl transition border border-white/10"
                  >
                    View Details <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => deleteItinerary(it._id)}
                    className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}