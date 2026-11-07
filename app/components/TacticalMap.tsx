"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Activity as ActivityIcon } from "lucide-react";
// @ts-ignore
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Coordinate {
  lat: number | string;
  lng: number | string;
  name: string;
}

interface TacticalMapProps {
  allCoords: Coordinate[];
  activeDayParam: string | null;
}

// Custom numeric marker icon factory
const createNumberedIcon = (index: number) => {
  return L.divIcon({
    className: "custom-tactical-marker",
    html: `
      <div style="
        background-color: #1a1a1e;
        border: 2px solid #00a3cc;
        color: #00a3cc;
        border-radius: 9999px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 11px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Component to dynamically fit map bounds to current markers
function MapBoundsUpdater({ coords }: { coords: Array<{ lat: number; lng: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [coords, map]);

  return null;
}

export default function TacticalMap({ allCoords, activeDayParam }: TacticalMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parse and validate coordinates cleanly
  const validCoords = useMemo(() => {
    return (allCoords || [])
      .map((coord) => ({
        ...coord,
        lat: typeof coord.lat === "number" ? coord.lat : parseFloat(coord.lat as string),
        lng: typeof coord.lng === "number" ? coord.lng : parseFloat(coord.lng as string),
      }))
      .filter((coord) => !isNaN(coord.lat) && !isNaN(coord.lng));
  }, [allCoords]);

  if (!isMounted) {
    return null;
  }

  if (validCoords.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1a1e] p-6 text-center">
        <ActivityIcon size={32} className="text-gray-700 mb-3 animate-pulse" />
        <p className="text-[10px] font-black italic uppercase tracking-widest text-gray-500">
          Zero Coordinate Data Found
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#1a1a1e]">
      <MapContainer 
        key={activeDayParam || "global"} 
        center={[validCoords[0].lat, validCoords[0].lng]} 
        zoom={activeDayParam ? 14 : 12} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <MapBoundsUpdater coords={validCoords} />

        {/* Dark Mode Map Tile Configuration */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {validCoords.map((coord, i) => (
          <Marker 
            key={`${coord.lat}-${coord.lng}-${i}`} 
            position={[coord.lat, coord.lng]}
            icon={createNumberedIcon(i)}
          >
            <Popup className="tactical-popup">
              <div className="p-1 font-black italic uppercase text-[10px] tracking-wide text-gray-900">
                <span className="text-[#00a3cc] block mb-0.5">Waypoint {i + 1}</span>
                {coord.name}
              </div>
            </Popup>
          </Marker>
        ))}

        <Polyline
          positions={validCoords.map((c) => [c.lat, c.lng])}
          pathOptions={{ 
            color: '#00a3cc', 
            weight: 3, 
            opacity: 0.8, 
            dashArray: '8, 8' 
          }}
        />
      </MapContainer>
    </div>
  );
}