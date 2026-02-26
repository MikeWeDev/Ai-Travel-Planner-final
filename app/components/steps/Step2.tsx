"use client";

import { useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import StepWrapper from "../StepWrapper";
import { useFormContext } from "../../context/FormContext";
import { motion } from "framer-motion";

export default function Step2() {
  const { formData, setFormData, setStep } = useFormContext();

  useEffect(() => {
    const { departureDate, returnDate, duration } = formData;

    if (departureDate && returnDate) {
      const start = new Date(departureDate);
      const end = new Date(returnDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        const diffInDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (duration !== diffInDays) {
          setFormData({
            ...formData,
            duration: diffInDays,
          });
        }
      }
    }
  }, [formData, setFormData]);

  return (
    <StepWrapper>
      <div className="relative w-[35vw] flex items-center justify-center p-5">
        <motion.div
          className="max-w-2xl w-full rounded-3xl bg-indigo-900 bg-opacity-40 backdrop-blur-xl border border-white/30 shadow-2xl p-10 animate-fade-in"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-extrabold text-white mb-5 flex items-center gap-3 drop-shadow-lg">
            📅 When are you traveling?
          </h2>

          <div className="flex flex-col gap-8">
            {/* Departure Date Picker */}
            <div>
              <label className="block text-base font-semibold text-pink-200 mb-2 select-none">
                Departure Date
              </label>
              <DatePicker
                selected={formData.departureDate ?? null}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    departureDate: date,
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-white bg-opacity-30 border border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300 text-black placeholder-black shadow-inner"
                minDate={new Date()}
                placeholderText="Select departure date"
              />
            </div>

            {/* Return Date Picker */}
            <div>
              <label className="block text-base font-semibold text-pink-200 mb-2 select-none">
                Return Date
              </label>
              <DatePicker
                selected={formData.returnDate ?? null}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    returnDate: date,
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-white bg-opacity-30 border border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300 text-black placeholder-black shadow-inner"
                minDate={formData.departureDate ?? new Date()}
                placeholderText="Select return date"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 font-medium shadow-sm"
              >
                ← Back
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={!formData.departureDate || !formData.returnDate}
                className={`px-6 py-3 rounded-2xl font-semibold shadow-md transition-all duration-300 ${
                  !formData.departureDate || !formData.returnDate
                    ? "bg-pink-800 text-pink-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white"
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </StepWrapper>
  );
}
