"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepWrapper from "../StepWrapper";
import { useFormContext } from "../../context/FormContext";
import { ShieldCheck, Zap, Sparkles, ChevronDown } from "lucide-react";

// --- PRIMARY REGIONAL DATABASE ---
const SUPPORTED_DATA = {
  Ethiopia: ["Addis Ababa", "Hawassa", "Bahir Dar", "Arba Minch", "Mekelle"],
};

// --- GLOBAL BACKUP DESTINATIONS ---
const GLOBAL_DESTINATIONS = [
  "Zanzibar, Tanzania",
  "Marrakech, Morocco",
  "Cairo, Egypt",
  "Cape Town, South Africa",
  "Nairobi, Kenya",
  "Paris, France",
  "Tokyo, Japan",
  "Rome, Italy",
  "New York City, USA",
  "Bali, Indonesia",
  "Dubai, UAE",
  "London, UK",
  "Sydney, Australia",
  "Rio de Janeiro, Brazil",
  "Bangkok, Thailand",
  "Santorini, Greece",
  "Kyoto, Japan",
  "Barcelona, Spain",
  "Machu Picchu, Peru",
  "Reykjavik, Iceland"
].sort();

export default function Step1() {
  const { formData, setFormData, setStep } = useFormContext();

  // Custom dropdown open/close states
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // Refs to handle clicking outside to close dropdowns
  const countryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setCountryOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOther = formData.country === "Other";

  const isOptimized =
    !isOther &&
    SUPPORTED_DATA[formData.country as keyof typeof SUPPORTED_DATA]?.includes(
      formData.city
    );

  const handleCountrySelect = (val: string) => {
    setFormData({ ...formData, country: val, city: "" });
    setCountryOpen(false);
  };

  const handleCitySelect = (val: string) => {
    setFormData({ ...formData, city: val });
    setCityOpen(false);
  };

  const canProceed = formData.country && formData.city;

  // Available cities based on country
  const currentCities = isOther 
    ? GLOBAL_DESTINATIONS 
    : (formData.country ? SUPPORTED_DATA[formData.country as keyof typeof SUPPORTED_DATA] || [] : []);

  return (
    <StepWrapper>
      {/* Main Container */}
      <div className="relative w-[450px] rounded-[40px] bg-[#1a1a1e] border border-white/5 shadow-2xl p-10 font-sans text-white">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-5xl font-black italic tracking-tighter leading-none uppercase">
            PLAN YOUR <br />
            <span className="text-[#00a3cc]">JOURNEY.</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-6">
          
          {/* TARGET COORDINATES (COUNTRY DROPDOWN) */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Target Coordinates
            </label>
            
            <div className="relative" ref={countryRef}>
              {/* Entire box is clickable */}
              <div
                onClick={() => setCountryOpen(!countryOpen)}
                className="w-full flex items-center justify-between border-b-2 border-gray-800 py-3 cursor-pointer hover:border-gray-600 transition-all select-none"
              >
                <span className={`text-lg font-bold uppercase tracking-tight ${formData.country ? "text-white" : "text-gray-500"}`}>
                  {formData.country || "WHERE TO NEXT?"}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${countryOpen ? "rotate-180" : ""}`} />
              </div>

              {/* Dropdown Menu Options */}
              <AnimatePresence>
                {countryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 left-0 right-0 mt-2 bg-[#222227] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                  >
                    <div
                      onClick={() => handleCountrySelect("Ethiopia")}
                      className="px-5 py-3 hover:bg-[#00a3cc]/20 hover:text-[#00a3cc] font-bold text-sm uppercase cursor-pointer transition-colors"
                    >
                      Ethiopia
                    </div>
                    <div
                      onClick={() => handleCountrySelect("Other")}
                      className="px-5 py-3 hover:bg-[#00a3cc]/20 hover:text-[#00a3cc] font-bold text-sm uppercase italic cursor-pointer transition-colors border-t border-white/5"
                    >
                      Other (Global Search)
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SPECIFIC LANDING ZONE (CITY DROPDOWN) */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Specific Landing Zone
            </label>

            <div className="relative" ref={cityRef}>
              {/* Entire box is clickable */}
              <div
                onClick={() => formData.country && setCityOpen(!cityOpen)}
                className={`w-full flex items-center justify-between bg-[#2a2a2e] rounded-xl px-4 py-4 transition-all select-none ${
                  !formData.country 
                    ? "opacity-30 cursor-not-allowed" 
                    : "cursor-pointer hover:bg-[#323238]"
                }`}
              >
                <span className={`font-bold text-sm truncate pr-4 ${formData.city ? "text-white" : "text-gray-400"}`}>
                  {formData.city ? formData.city.toUpperCase() : (isOther ? "SELECT GLOBAL HUB" : "SELECT CITY")}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${cityOpen ? "rotate-180" : ""}`} />
              </div>

              {/* Dropdown Menu Options */}
              <AnimatePresence>
                {cityOpen && formData.country && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 left-0 right-0 mt-2 bg-[#222227] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                  >
                    {currentCities.map((city) => (
                      <div
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className="px-5 py-3 hover:bg-[#00a3cc]/20 hover:text-[#00a3cc] font-bold text-sm uppercase cursor-pointer transition-colors border-b border-white/5 last:border-none"
                      >
                        {city.toUpperCase()}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* DYNAMIC FEEDBACK BOX */}
          <div className="min-h-[50px]">
            {isOptimized ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold uppercase tracking-wider"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Route: High Precision Data Active</span>
              </motion.div>
            ) : formData.city ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold uppercase tracking-wider"
              >
                <Zap className="w-4 h-4" />
                <span>AI Global Mode: Mapping External Framework Vectors...</span>
              </motion.div>
            ) : null}
          </div>

          {/* ACTION BUTTON */}
          <motion.div className="mt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className={`w-full flex items-center justify-center gap-2 font-black italic uppercase tracking-widest py-5 rounded-2xl shadow-[0_10px_20px_rgba(0,163,204,0.3)] transition-all duration-300 
                ${
                  !canProceed
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-[#00a3cc] text-white hover:bg-[#008db1] hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
              Initialize AI Itinerary
              <Sparkles className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </StepWrapper>
  );
}