"use client";

import { useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import StepWrapper from "../StepWrapper";
import { useFormContext } from "../../context/FormContext";
import { motion } from "framer-motion";
import { Calendar, Sparkles, ChevronLeft } from "lucide-react";

export default function Step2() {
  const { formData, setFormData, setStep } = useFormContext();

  useEffect(() => {
    const { departureDate, returnDate, duration } = formData;
    if (departureDate && returnDate) {
      const start = new Date(departureDate);
      const end = new Date(returnDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (duration !== diffInDays) {
          setFormData({ ...formData, duration: diffInDays });
        }
      }
    }
  }, [formData, setFormData]);

  return (
    <StepWrapper>
      {/* FIX: Removed fixed widths that cause X-axis overflow. 
          The 'w-screen' and 'px-6' ensure it stays within the visible bounds.
      */}
      <div className="w-screen max-w-full flex flex-col items-center justify-center py-10 px-6 md:px-5">
        
        {/* GRID SYSTEM: 
            Stacks vertically on mobile (col-1), 
            Side-by-side on large screens (lg:grid-cols-2).
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full max-w-[1500px]">
          
          {/* LEFT COLUMN: TITLE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-start w-full"
          >
            <div className="w-16 h-1 bg-[#00a3cc] mb-6" />
            <h2 className="text-5xl md:text-7xl xl:text-6xl font-black italic tracking-tighter leading-[0.9] uppercase text-white">
              SELECT YOUR <br />
              <span className="text-[#00a3cc] drop-shadow-[0_10px_30px_rgba(0,163,204,0.3)]">
                TIMELINE.
              </span>
            </h2>
            
            <div className="mt-4 space-y-1">
              <span className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[10px]">
                Expedition Clock
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black italic text-white uppercase leading-none">
                  {formData.duration || "00"}
                </span>
                <span className="text-[#00a3cc] font-bold uppercase tracking-widest text-xs italic">
                  Days Calculated
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: THE CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex justify-center lg:justify-end "
          >
            {/* CARD WIDTH: Using 'w-full' with a 'max-w' 
                ensures it never grows larger than the UI design but fits smaller screens.
            */}
            <div className="bg-[#1a1a1e] border border-white/10 rounded-[40px] p-8 md:p-8 shadow-2xl w-full max-w-[500px] flex flex-col gap-10">
              
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00a3cc]">
                  Launch Date
                </label>
                <div className="relative border-b border-gray-800 focus-within:border-[#00a3cc] transition-all pb-2">
                  <DatePicker
                    selected={formData.departureDate ?? null}
                    onChange={(date) => setFormData({ ...formData, departureDate: date })}
                    className="w-full bg-transparent py-2 text-xl font-black italic uppercase text-white outline-none cursor-pointer"
                    minDate={new Date()}
                    placeholderText="MM / DD / YYYY"
                  />
                  <Calendar className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                  Return Date
                </label>
                <div className="relative border-b border-gray-800 focus-within:border-[#00a3cc] transition-all pb-2">
                  <DatePicker
                    selected={formData.returnDate ?? null}
                    onChange={(date) => setFormData({ ...formData, returnDate: date })}
                    className="w-full bg-transparent py-2 text-xl font-black italic uppercase text-white outline-none cursor-pointer"
                    minDate={formData.departureDate ?? new Date()}
                    placeholderText="MM / DD / YYYY"
                  />
                  <Calendar className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                </div>
              </div>

              <div className="flex flex-col gap-5 pt-4">
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.departureDate || !formData.returnDate}
                  className={`w-full py-5 rounded-2xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300
                    ${!formData.departureDate || !formData.returnDate
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed opacity-30"
                      : "bg-[#00a3cc] text-white hover:bg-[#00c2f3] shadow-[0_10px_25px_rgba(0,163,204,0.3)]"
                    }`}
                >
                  Confirm Window
                  <Sparkles size={16} />
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors"
                >
                  <ChevronLeft size={14} />
                  Back to Coordinates
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </StepWrapper>
  );
}