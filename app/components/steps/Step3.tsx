"use client";

import React, { useState, useEffect, useMemo } from "react";
import StepWrapper from "../StepWrapper";
import { useFormContext } from "../../context/FormContext";
import {
  useForm,
  Controller,
  SubmitHandler,
  Resolver,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

const schema = z.object({
  tripType: z.enum(["solo", "couple", "family", "group"]),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  budget: z.enum(["low", "medium", "high"]),
});

type FormData = z.infer<typeof schema>;

const interestsOptions = [
  "beaches",
  "museums",
  "hiking",
  "food",
  "nightlife",
  "shopping",
];

export default function Step3() {
  const { formData, setFormData, setStep } = useFormContext();
  const [error, setError] = useState("");

  const defaultValues = useMemo<FormData>(() => {
    return {
      tripType: formData.tripType ?? "solo",
      interests: formData.interests ?? [],
      budget: formData.budget ?? "medium",
    };
  }, [formData.tripType, formData.interests, formData.budget]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    setError("");
    try {
      const requiredFields = [
        formData.country,
        formData.city,
        formData.departureDate,
        formData.returnDate,
      ];
      if (requiredFields.some((v) => !v)) {
        throw new Error(
          "Missing required travel information from previous steps."
        );
      }

      setFormData({
        ...formData,
        ...data,
      });

      setStep(4);
    } catch (err: any) {
      setError(err?.message || "Please complete previous steps first.");
    }
  };

  return (
    <StepWrapper>
      <div className="relative  flex items-center justify-center   overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Background blurred glowing blobs */}
        <motion.div
          className="absolute rounded-full bg-purple-700 opacity-30 w-[340px] h-[340px] top-12 left-[-120px] filter blur-3xl animate-blob"
          style={{ animationDelay: "0s" }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute rounded-full bg-pink-600 opacity-30 w-[300px] h-[300px] bottom-24 right-[-100px] filter blur-3xl animate-blob animation-delay-2000"
          aria-hidden="true"
        />
        <motion.div
          className="absolute rounded-full bg-indigo-700 opacity-20 w-[420px] h-[420px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 filter blur-4xl animate-blob animation-delay-4000"
          aria-hidden="true"
        />

        {/* Frosted glass form container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 w-full max-w-2xl bg-indigo-900 bg-opacity-40 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl"
        >
          <h2 className="text-4xl font-extrabold text-white mb-12 flex items-center gap-3 drop-shadow-lg">
            🎯 Your Travel Preferences
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
            {/* Trip Type */}
            <div>
              <label className="block text-lg font-semibold text-pink-300 mb-4 select-none">
                Trip Type
              </label>
              <Controller
                control={control}
                name="tripType"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-6 py-4 rounded-2xl bg-white bg-opacity-20 border border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400 transition duration-300 shadow-lg text-black font-semibold text-lg"
                  >
                    <option value="solo">Solo</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                    <option value="group">Group</option>
                  </select>
                )}
              />
              {errors.tripType && (
                <p className="text-red-500 text-sm mt-2">{errors.tripType.message}</p>
              )}
            </div>

            {/* Interests */}
            <div>
              <label className="block text-lg font-semibold text-pink-300 mb-4 select-none">
                Interests
              </label>
              <Controller
                control={control}
                name="interests"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-4">
                    {interestsOptions.map((interest) => {
                      const checked = field.value.includes(interest);
                      return (
                        <label
                          key={interest}
                          className={`cursor-pointer px-6 py-4 rounded-3xl border-2 transition-colors duration-300 font-semibold select-none shadow-lg text-lg ${
                            checked
                              ? "bg-pink-500 border-pink-600 text-white"
                              : "bg-indigo-800 border-pink-400 text-pink-300 hover:bg-indigo-700 hover:border-pink-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={interest}
                            checked={checked}
                            onChange={(e) => {
                              const newValue = e.target.checked
                                ? [...field.value, interest]
                                : field.value.filter((i) => i !== interest);
                              field.onChange(newValue);
                            }}
                            className="hidden"
                          />
                          {interest.charAt(0).toUpperCase() + interest.slice(1)}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              {errors.interests && (
                <p className="text-red-500 text-sm mt-2">{errors.interests.message}</p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-lg font-semibold text-pink-300 mb-4 select-none">
                Budget
              </label>
              <Controller
                control={control}
                name="budget"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-6 py-4 rounded-2xl bg-white bg-opacity-20 border border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400 transition duration-300 shadow-lg text-black font-semibold text-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                )}
              />
              {errors.budget && (
                <p className="text-red-500 text-sm mt-2">{errors.budget.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 font-semibold mt-6 text-center">{error}</p>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-10 py-4 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md transition duration-300"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 hover:from-purple-700 hover:to-pink-600 text-white font-extrabold shadow-lg transition duration-300"
              >
                Next →
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </StepWrapper>
  );
}
