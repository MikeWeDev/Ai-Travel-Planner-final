"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Navigation, Activity as ActivityIcon } from "lucide-react";
// @ts-ignore
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

interface TacticalMapProps {
  allCoords: Array<{ lat: number; lng: number; name: string }>;
  activeDayParam: string | null;
}

export default function TacticalMap({ allCoords, activeDayParam }: TacticalMapProps) {
  if (allCoords.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1a1e]">
        <ActivityIcon size={32} className="text-gray-800 mb-4 animate-pulse" />
        <p className="text-[10px] font-black italic uppercase tracking-widest text-gray-600">
          Zero Coordinate Data Found
        </p>
      </div>
    );
  }

  return (
    <MapContainer 
      key={activeDayParam || "global"} 
      center={[allCoords[0].lat, allCoords[0].lng]} 
      zoom={activeDayParam ? 14 : 12} 
      scrollWheelZoom={false}
      style={{ 
        height: '100%', 
        width: '100%',
        filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' 
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {allCoords.map((coord, i) => (
        <Marker key={i} position={[coord.lat, coord.lng]}>
          <Popup>
            <div className="p-2 font-black italic uppercase text-[10px]">
              <span className="text-[#00a3cc] block mb-1">Waypoint {i + 1}</span>
              {coord.name}
            </div>
          </Popup>
        </Marker>
      ))}

      <Polyline
        positions={allCoords.map((c) => [c.lat, c.lng])}
        pathOptions={{ color: '#00a3cc', weight: 3, opacity: 0.8, dashArray: '10, 10' }}
      />
    </MapContainer>
  );
}