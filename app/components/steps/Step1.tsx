"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepWrapper from "../StepWrapper";
import { useFormContext } from "../../context/FormContext";
import { Globe , ShieldCheck, Zap } from "lucide-react";

// --- YOUR CSV DATA ---
const SUPPORTED_DATA = {
  Ethiopia: ["Addis Ababa", "Hawassa", "Bahir Dar", "Arba Minch", "Mekelle"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  "United Kingdom": ["London", "Edinburgh", "Manchester", "Birmingham", "Glasgow"],
  France: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
  Japan: ["Tokyo", "Kyoto", "Osaka", "Sapporo", "Fukuoka"],
};

export default function Step1() {
  const { formData, setFormData, setStep } = useFormContext();

  const isOther = formData.country === "Other";
  
  // Check if current selection is in our local CSV
  const isOptimized = !isOther && 
    SUPPORTED_DATA[formData.country as keyof typeof SUPPORTED_DATA]?.includes(formData.city);

  const handleCountryChange = (val: string) => {
    setFormData({ ...formData, country: val, city: "" });
  };

  const canProceed = formData.country && formData.city;

  return (
    <StepWrapper>
      <div className="relative w-[30vw] rounded-3xl bg-indigo-900 bg-opacity-40 backdrop-blur-xl border border-white/30 shadow-2xl p-9 ">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-3 drop-shadow-lg">
            <Globe className="w-10 h-10 text-pink-400 animate-pulse" />
            Where to?
          </h2>
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* COUNTRY SELECT */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-pink-200">Country</label>
            <select
              value={formData.country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white bg-opacity-10 border border-pink-500 text-black focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            >
              <option value="" className="bg-indigo-950">Select Country </option>
              {Object.keys(SUPPORTED_DATA).map((c) => (
                <option key={c} value={c} className="bg-indigo-950">{c}</option>
              ))}
              <option value="Other" className="bg-indigo-950 italic">Other (Global Search)</option>
            </select>
          </div>

          {/* CITY INPUT / SELECT */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-pink-200">City</label>
            <AnimatePresence mode="wait">
              {isOther ? (
                <motion.input
                  key="input"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  type="text"
                  placeholder="Type any city in the world..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl bg-white bg-opacity-10 border border-yellow-500 text-black placeholder-pink-300 outline-none focus:ring-2 focus:ring-yellow-500 shadow-inner"
                />
              ) : (
                <motion.select
                  key="select"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  disabled={!formData.country}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl bg-white bg-opacity-10 border border-pink-500 text-black focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-30"
                >
                  <option value="" className="bg-indigo-950">Select City </option>
                  {formData.country &&
                    SUPPORTED_DATA[formData.country as keyof typeof SUPPORTED_DATA]?.map((city) => (
                      <option key={city} value={city} className="bg-indigo-950">{city}</option>
                    ))}
                </motion.select>
              )}
            </AnimatePresence>
          </div>

          {/* DYNAMIC FEEDBACK BOX */}
          <div className="mt-4 min-h-[40px]">
            {isOptimized ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-sm"
              >
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span>Verified: Our custom algorithm will optimize your route and budget.</span>
              </motion.div>
            ) : formData.city ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 text-sm"
              >
                <Zap className="w-5 h-5 flex-shrink-0" />
                <span>AI Global Mode: Using general AI knowledge. Accuracy may vary.</span>
              </motion.div>
            ) : null}
          </div>

          <motion.div className="flex justify-end mt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className={`font-bold px-10 py-3 rounded-xl shadow-lg transition duration-300 
                ${!canProceed 
                  ? "bg-gray-600 cursor-not-allowed opacity-50" 
                  : isOther 
                    ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-black hover:scale-105"
                    : "bg-gradient-to-r from-pink-500 to-purple-600 text-black hover:scale-105"
                }`}
            >
              Next →
            </button>
          </motion.div>
        </div>
      </div>
    </StepWrapper>
  );
}