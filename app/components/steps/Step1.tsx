"use client";
import React from "react";
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

  const isOther = formData.country === "Other";

  const isOptimized =
    !isOther &&
    SUPPORTED_DATA[formData.country as keyof typeof SUPPORTED_DATA]?.includes(
      formData.city
    );

  const handleCountryChange = (val: string) => {
    setFormData({ ...formData, country: val, city: "" });
  };

  const canProceed = formData.country && formData.city;

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
          {/* TARGET COORDINATES */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Target Coordinates
            </label>
            
            {/* COUNTRY SELECT */}
            <div className="relative w-full flex items-center border-b-2 border-gray-800 py-3 focus-within:border-[#00a3cc] transition-all">
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-transparent text-lg font-bold uppercase tracking-tight text-white outline-none cursor-pointer appearance-none pr-8"
              >
                <option value="" className="bg-[#1a1a1e] text-white">WHERE TO NEXT?</option>
                {Object.keys(SUPPORTED_DATA).map((c) => (
                  <option key={c} value={c} className="bg-[#1a1a1e] text-white">
                    {c}
                  </option>
                ))}
                <option value="Other" className="bg-[#1a1a1e] text-white italic">
                  OTHER (GLOBAL SEARCH)
                </option>
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-0 pointer-events-none" />
            </div>
          </div>

          {/* CITY SELECT / GLOBAL DROPDOWN */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Specific Landing Zone
            </label>
            <AnimatePresence mode="wait">
              {isOther ? (
                <motion.div
                  key="global-select-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full bg-[#2a2a2e] rounded-xl px-4 py-4 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-[#00a3cc] transition-all"
                >
                  <span className="font-bold text-white truncate pr-6 pointer-events-none">
                    {formData.city ? formData.city.toUpperCase() : "SELECT GLOBAL HUB"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 pointer-events-none" />
                  <select
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="" className="bg-[#2a2a2e] text-white">SELECT GLOBAL HUB</option>
                    {GLOBAL_DESTINATIONS.map((dest) => (
                      <option key={dest} value={dest} className="bg-[#2a2a2e] text-white">
                        {dest.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </motion.div>
              ) : (
                <motion.div
                  key="regional-select-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`relative w-full bg-[#2a2a2e] rounded-xl px-4 py-4 flex items-center justify-between transition-all ${
                    !formData.country 
                      ? "opacity-30 cursor-not-allowed" 
                      : "cursor-pointer focus-within:ring-2 focus-within:ring-[#00a3cc]"
                  }`}
                >
                  <span className="font-bold text-white truncate pr-6 pointer-events-none">
                    {formData.city ? formData.city.toUpperCase() : "SELECT CITY"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 pointer-events-none" />
                  <select
                    disabled={!formData.country}
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-[#2a2a2e] text-white">SELECT CITY</option>
                    {formData.country &&
                      SUPPORTED_DATA[
                        formData.country as keyof typeof SUPPORTED_DATA
                      ]?.map((city) => (
                        <option key={city} value={city} className="bg-[#2a2a2e] text-white">
                          {city.toUpperCase()}
                        </option>
                      ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
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