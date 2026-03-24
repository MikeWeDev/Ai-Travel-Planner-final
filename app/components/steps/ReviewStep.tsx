"use client";

import React, { useState, useEffect } from "react";
import StepWrapper from "../StepWrapper";
import { useFormContext } from "../../context/FormContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, MapPin, Calendar, Fingerprint, Activity } from "lucide-react";

export default function ReviewStep() {
  const { formData, setStep } = useFormContext();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calculatedDuration, setCalculatedDuration] = useState<number | null>(null);

  useEffect(() => {
    const { departureDate, returnDate } = formData;
    if (departureDate && returnDate) {
      const start = new Date(departureDate).getTime();
      const end = new Date(returnDate).getTime();
      const days = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1);
      setCalculatedDuration(days);
    }
  }, [formData.departureDate, formData.returnDate]);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const { departureDate, returnDate ,budget} = formData;
      if (!departureDate || !returnDate) throw new Error("Dates missing.");

      const duration = calculatedDuration ?? 1;
    const payload = {
      ...formData,
       budget: formData.budget?.amount ?? 0,
      duration,
    };

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/ai-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Something went wrong.");

      localStorage.setItem("lastItinerary", JSON.stringify(data));
      router.push("/itinerary");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <StepWrapper>
      <div className="w-full flex flex-col items-center justify-start py-4 px-6">
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[600px] mb-6"
        >
          <div className="w-10 h-1 bg-[#00a3cc] mb-4" />
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
            CONFIRM <span className="text-[#00a3cc]">MANIFEST.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[600px]"
        >
          <div className="bg-[#1a1a1e] border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl flex flex-col gap-8">
            
            <div className="grid grid-cols-1 gap-y-6">
              <DataPoint 
                icon={<MapPin size={14} className="text-[#00a3cc]" />}
                label="Target Destination" 
                value={`${formData.city || "N/A"}, ${formData.country || "N/A"}`} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <DataPoint 
                  icon={<Calendar size={14} className="text-gray-500" />}
                  label="Timeline" 
                  value={`${formatDate(formData.departureDate)}`} 
                />
                <DataPoint 
                  icon={<Activity size={14} className="text-gray-500" />}
                  label="Duration" 
                  value={`${calculatedDuration ?? "..."} Standard Days`} 
                />
              </div>

              <div className="h-[1px] bg-white/5 w-full" />

              <div className="grid grid-cols-2 gap-4">
                <DataPoint 
                  icon={<Fingerprint size={14} className="text-gray-500" />}
                  label="Unit Profile" 
                  value={formData.tripType || "N/A"} 
                />
                <DataPoint 
                  icon={<Fingerprint size={14} className="text-gray-500" />}
                  label="Budget Allocation" 
                  value={
                    formData.budget && typeof formData.budget === 'object'
                      ? `($${formData.budget.amount.toLocaleString()})`
                      : "N/A"
                  } 
                />
              </div>

              <DataPoint 
                label="Selected Objectives" 
                value={formData.interests?.length ? formData.interests.join(" • ") : "None"} 
                isFullWidth
              />
            </div>

            {error && (
              <p className="text-red-500 text-[15px] p-3
              font-bold uppercase text-center animate-pulse border border-red-500/20 rounded-lg bg-red-500/5">
                System Error: {error}
              </p>
            )}

            <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-[#00a3cc] text-white font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#00c2f3] transition-all shadow-[0_15px_30px_rgba(0,163,204,0.3)] disabled:opacity-50"
              >
                {loading ? "Initializing..." : "Engage AI Planner"}
                <Sparkles size={16} />
              </button>
              
              <button
                onClick={() => setStep(3)}
                disabled={loading}
                className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={14} /> Back to Parameters
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </StepWrapper>
  );
}

function DataPoint({ label, value, icon, isFullWidth = false }: { label: string; value: string; icon?: React.ReactNode; isFullWidth?: boolean }) {
  return (
    <div className={`${isFullWidth ? "col-span-full" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1 flex items-center gap-2">
        {icon} {label}
      </p>
      <p className="text-lg font-black italic uppercase text-white ">
        {value}
      </p>
    </div>
  );
}