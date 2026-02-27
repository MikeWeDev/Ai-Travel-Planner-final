"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "../../../utilis/api"; 
import { ChevronLeft, MapPin, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- NEW LEAFLET IMPORTS (Replaces Google Maps) ---
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + Next.js
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

  // EXTRACT ALL COORDINATES FOR THE MAP
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
            <ChevronLeft size={24} /> 
            <span className="font-bold">Back to Dashboard</span>
          </button>

          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
            <input 
              type="text"
              placeholder="Search Day or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm"
            />
          </div>
        </div>

        {/* Hero Header */}
        <header className="mb-8">
          <motion.h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-pink-300">
            {data.title}
          </motion.h1>
        </header>

        {/* 4. THE MAP VISUALIZATION SECTION (LEAFLET VERSION) */}
        <section className="mb-12 h-[400px] w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative z-0">
          {allCoords.length > 0 ? (
            <MapContainer 
              center={[allCoords[0].lat, allCoords[0].lng]} 
              zoom={13} 
              scrollWheelZoom={false}
              style={{ 
                height: '100%', 
                width: '100%',
                // This filter creates a "Dark Mode" look for the standard OpenStreetMap tiles
                filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' 
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {allCoords.map((coord: any, i: number) => (
                <Marker key={i} position={[coord.lat, coord.lng]}>
                  <Popup>
                    <div className="text-black">
                      <strong className="block text-pink-600">Day Activity {i + 1}</strong>
                      {coord.name}
                    </div>
                  </Popup>
                </Marker>
              ))}

              <Polyline
                positions={allCoords.map((c: any) => [c.lat, c.lng])}
                pathOptions={{ color: '#ec4899', weight: 4, opacity: 0.8 }}
              />
            </MapContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 animate-pulse">
              No coordinate data found for this expedition.
            </div>
          )}
        </section>

        {/* Timeline Visualization */}
        <div className="relative">
          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {filteredDays.map((day: any) => (
                <motion.section key={day.day} className="relative pl-12 md:pl-24">
                  <div className="absolute left-[9px] md:left-[25px] top-0 w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] border-4 border-black" />
                  
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] hover:bg-white/10 transition-all">
                    <div className="flex justify-between mb-8">
                      <h2 className="text-2xl font-black text-white">Day {day.day}</h2>
                      <span className="text-indigo-300 px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm">
                        {day.title}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {day.activities.map((activity: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                          <MapPin size={18} className="mt-1 text-pink-500" />
                          <div>
                            <p className="font-bold text-white">{activity.name}</p>
                            <p className="text-xs text-indigo-400">
                              Lat: {activity.lat.toFixed(4)} | Lng: {activity.lng.toFixed(4)}
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