"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "../../../utilis/api"; 
import { ChevronLeft, MapPin, Search, Sparkles, Navigation, Target, Activity as ActivityIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- LEAFLET IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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
      day.activities.map((act: any) => ({
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
        day.title.toLowerCase().includes(searchLower)
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
        
        {/* Navigation & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-4 text-gray-500 hover:text-white transition-all font-black italic uppercase text-xs group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Mission Logs
          </motion.button>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00a3cc] transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Filter Objectives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00a3cc]/50 text-[10px] font-black italic uppercase tracking-widest transition-all"
            />
          </div>
        </div>

        {/* Tactical Title */}
        <header className="mb-12">
          <div className="w-12 h-1 bg-[#00a3cc] mb-6" />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none"
          >
            {data.title.split(' ').map((word: string, i: number) => (
              <span key={i} className={i % 2 !== 0 ? "text-[#00a3cc]" : ""}>{word} </span>
            ))}
          </motion.h1>
        </header>

        {/* THE MAP VISUALIZATION (Tactical Overlay) */}
        <section className="mb-20 h-[500px] w-full rounded-[40px] overflow-hidden border border-white/5 shadow-2xl relative z-0">
          <div className="absolute top-6 left-6 z-[1000] bg-[#0d0d0f]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl">
             <p className="text-[9px] font-black italic uppercase tracking-widest flex items-center gap-2">
               <Navigation size={10} className="text-[#00a3cc]" /> Satellite Feed: Active
             </p>
          </div>
          
          {allCoords.length > 0 ? (
            <MapContainer 
              center={[allCoords[0].lat, allCoords[0].lng]} 
              zoom={13} 
              scrollWheelZoom={false}
              style={{ 
                height: '100%', 
                width: '100%',
                filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' 
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {allCoords.map((coord: any, i: number) => (
                <Marker key={i} position={[coord.lat, coord.lng]}>
                  <Popup>
                    <div className="p-2 font-black italic uppercase text-[10px]">
                      <span className="text-[#00a3cc] block mb-1">Objective {i + 1}</span>
                      {coord.name}
                    </div>
                  </Popup>
                </Marker>
              ))}

              <Polyline
                positions={allCoords.map((c: any) => [c.lat, c.lng])}
                pathOptions={{ color: '#00a3cc', weight: 3, opacity: 0.8, dashArray: '10, 10' }}
              />
            </MapContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1a1e]">
              <ActivityIcon size={32} className="text-gray-800 mb-4 animate-pulse" />
              <p className="text-[10px] font-black italic uppercase tracking-widest text-gray-600">Zero Coordinate Data Found</p>
            </div>
          )}
        </section>

        {/* Timeline Visualization (Vertical Stepper) */}
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
                  {/* Phase Marker */}
                  <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#0d0d0f] border-2 border-[#00a3cc] shadow-[0_0_15px_rgba(0,163,204,0.5)] z-10" />
                  
                  <div className="bg-[#1a1a1e] border border-white/5 p-8 md:p-10 rounded-[40px] hover:border-[#00a3cc]/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <span className="text-[#00a3cc] text-[10px] font-black italic uppercase tracking-[0.3em] mb-2 block">Phase {day.day}</span>
                        <h2 className="text-3xl font-black italic uppercase text-white leading-none">{day.title}</h2>
                      </div>
                      <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <p className="text-[9px] font-black italic uppercase tracking-widest text-gray-500">
                          {day.activities.length} Waypoints
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {day.activities.map((activity: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-black/20 border border-white/5 group hover:border-[#00a3cc]/20 transition-all">
                          <Target size={16} className="mt-1 text-gray-700 group-hover:text-[#00a3cc] transition-colors" />
                          <div>
                            <p className="text-[11px] font-bold text-gray-200 uppercase tracking-tight leading-relaxed">{activity.name}</p>
                            <p className="text-[8px] font-black italic text-gray-600 uppercase tracking-tighter mt-1">
                              LOC: {activity.lat.toFixed(4)} / {activity.lng.toFixed(4)}
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