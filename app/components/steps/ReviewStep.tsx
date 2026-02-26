"use client";

import React, { useState, useEffect } from "react";
import StepWrapper from "../StepWrapper";
import { useFormContext } from "../../context/FormContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
      const { departureDate, returnDate } = formData;
      if (!departureDate || !returnDate) {
        throw new Error("Departure and return dates must be selected.");
      }

      const duration = calculatedDuration ?? 1;
      const payload = { ...formData, duration };

      console.log("📦 Submitting formData with duration:", JSON.stringify(payload, null, 2));
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/ai-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server response is not valid JSON.");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Something went wrong.");
      }

      localStorage.setItem("lastItinerary", JSON.stringify(data));
      router.push("/itinerary");
    } catch (err) {
      const typedErr = err as Error;
      console.error("Error submitting plan:", typedErr);
      setError(typedErr.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Invalid date" : d.toLocaleDateString();
  };

  return (
    <StepWrapper>
      <div className="relative  flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Background blurred glowing blobs */}
        <motion.div
          className="absolute rounded-full bg-purple-700 opacity-30 w-[340px] h-[340px] top-16 left-[-120px] filter blur-3xl animate-blob"
          style={{ animationDelay: "0s" }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute rounded-full bg-pink-600 opacity-30 w-[300px] h-[300px] bottom-28 right-[-100px] filter blur-3xl animate-blob animation-delay-2000"
          aria-hidden="true"
        />
        <motion.div
          className="absolute rounded-full bg-indigo-700 opacity-20 w-[420px] h-[420px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 filter blur-4xl animate-blob animation-delay-4000"
          aria-hidden="true"
        />

        {/* Frosted glass review card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 w-full max-w-3xl bg-indigo-900 bg-opacity-40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 shadow-2xl"
        >
          <h2 className="text-3xl font-extrabold text-white text-center mb-5 drop-shadow-lg">
            🔍 Review Your Trip Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-white">
            <Info label="Destination" value={`${formData.city || "N/A"}, ${formData.country || "N/A"}`} />
            <Info
              label="Dates"
              value={`${formatDate(formData.departureDate)} – ${formatDate(formData.returnDate)}`}
            />
            <Info label="Trip Type" value={formData.tripType || "N/A"} />
            <Info
              label="Interests"
              value={formData.interests?.length ? formData.interests.join(", ") : "N/A"}
            />
            <Info label="Budget" value={formData.budget || "N/A"} />
            <Info label="Duration" value={`${calculatedDuration ?? "Calculating..."} days`} />
          </div>

          {error && (
            <p className="text-red-500 font-semibold mt-8 text-center drop-shadow-md">⚠️ {error}</p>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-10">
            <button
              onClick={() => setStep(3)}
              className="w-full sm:w-auto bg-pink-600 border border-pink-700 hover:bg-pink-700 text-white px-8 py-3 rounded-2xl shadow-md transition disabled:opacity-50"
              disabled={loading}
            >
              ⬅ Back
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-700 hover:from-purple-700 hover:to-pink-600 text-white px-8 py-3 rounded-2xl shadow-lg font-extrabold transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Generating..." : "✅ Confirm & Submit"}
            </button>
          </div>
        </motion.div>
      </div>
    </StepWrapper>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-pink-300">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
