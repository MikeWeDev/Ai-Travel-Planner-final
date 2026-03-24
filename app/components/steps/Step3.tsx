"use client";

import React, { useState, useEffect, useMemo } from "react";
import StepWrapper from "../StepWrapper";
import { useFormContext } from "../../context/FormContext";
import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, Target, Wallet, Users } from "lucide-react";

const schema = z.object({
  tripType: z.enum(["solo", "couple", "family", "group"]),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  budget: z.object({
    amount: z.coerce.number().min(1, "Enter a valid amount"),
    category: z.string(),
  }),
});

type FormData = z.infer<typeof schema>;

// Centralized logic for category naming
const getBudgetCategory = (val: number) => {
  if (val <= 0) return "Awaiting Input";
  if (val < 1000) return "Economy (< $1k)";
  if (val < 5000) return "Business ($1k - $5k)";
  return "First Class ($5k+)";
};

export default function Step3() {
  const { formData, setFormData, setStep } = useFormContext();
  const [error, setError] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const defaultValues = useMemo<FormData>(() => ({
    tripType: formData.tripType ?? "solo",
    interests: formData.interests ?? [],
    budget: formData.budget ?? { amount: 500, category: "Economy (< $1k)" },
  }), [formData]);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues,
  });

  const currentAmount = watch("budget.amount");

  useEffect(() => { reset(defaultValues); }, [defaultValues, reset]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    setFormData({ ...formData, ...data });
    setStep(4);
  };

  return (
    <StepWrapper>
      <div className="w-full flex flex-col items-center justify-start py-4 px-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[600px] mb-6">
          <div className="w-10 h-1 bg-[#00a3cc] mb-4" />
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white whitespace-nowrap">
            DEFINE YOUR <span className="text-[#00a3cc]">PARAMETERS</span>
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[600px]">
          <div className="bg-[#1a1a1e] border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl flex flex-col">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00a3cc] flex items-center gap-2">
                    <Users size={12} /> Unit Type
                  </label>
                  <Controller
                    control={control}
                    name="tripType"
                    render={({ field }) => (
                      <select {...field} className="w-full bg-transparent border-b border-gray-800 text-white font-black italic uppercase py-2 outline-none focus:border-[#00a3cc] cursor-pointer">
                        <option value="solo" className="bg-[#1a1a1e]">Solo Traveler</option>
                        <option value="couple" className="bg-[#1a1a1e]">Duo / Couple</option>
                        <option value="family" className="bg-[#1a1a1e]">Family Unit</option>
                        <option value="group" className="bg-[#1a1a1e]">Large Group</option>
                      </select>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                    <Wallet size={12} /> Resource Allocation
                  </label>
                  
                  {!isCustom ? (
                    <select 
                      value={currentAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "custom") {
                          setIsCustom(true);
                          setValue("budget.amount", 0);
                        } else {
                          const num = Number(val);
                          setValue("budget.amount", num);
                          setValue("budget.category", getBudgetCategory(num));
                        }
                      }}
                      className="w-full bg-transparent border-b border-gray-800 text-white font-black italic uppercase py-2 outline-none focus:border-[#00a3cc] cursor-pointer"
                    >                   
                       <option className="bg-[#1a1a1e]">Select Budget</option>
                      <option value="500"  className="bg-[#1a1a1e]">Economy (&lt; $1k)</option>
                      <option value="2500" className="bg-[#1a1a1e]">Business ($1k - $5k)</option>
                      <option value="5000" className="bg-[#1a1a1e]">First Class ($5k+)</option>
                      <option value="custom" className="bg-[#1a1a1e]">Other (Custom Amount)</option>
                    </select>
                  ) : (
                    <div className="relative border-b border-[#00a3cc] transition-all flex items-center">
                      <span className="text-white font-black italic mr-2">$</span>
                      <Controller
                        control={control}
                        name="budget.amount"
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            autoFocus
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const val = e.target.value === "" ? 0 : Number(e.target.value);
                              field.onChange(val);
                              setValue("budget.category", getBudgetCategory(val));
                            }}
                            placeholder="Enter Amount"
                            className="w-full bg-transparent py-2 text-white font-black italic uppercase outline-none"
                          />
                        )}
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsCustom(false);
                          setValue("budget.amount", 500);
                          setValue("budget.category", getBudgetCategory(500));
                        }}
                        className="text-[9px] font-bold text-gray-500 uppercase hover:text-white ml-2"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                  <span className="text-[9px] font-bold text-[#00a3cc] uppercase block mt-1">
                    {getBudgetCategory(currentAmount)}
                  </span>
                </div>
              </div>

              {/* OBJECTIVES */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                  <Target size={12} /> Objective Interests
                </label>
                <Controller
                  control={control}
                  name="interests"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {["beaches", "museums", "hiking", "food", "nightlife", "shopping"].map((interest) => {
                        const isSelected = field.value.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => {
                              const newValue = isSelected ? field.value.filter((i) => i !== interest) : [...field.value, interest];
                              field.onChange(newValue);
                            }}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
                              isSelected ? "bg-[#00a3cc] border-[#00a3cc] text-white" : "bg-transparent border-gray-800 text-gray-500 hover:border-gray-600"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button type="submit" className="w-full py-5 rounded-2xl bg-[#00a3cc] text-white font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#00c2f3] transition-all shadow-[0_15px_30px_rgba(0,163,204,0.3)]">
                  Generate Itinerary <Sparkles size={16} />
                </button>
                <button type="button" onClick={() => setStep(2)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <ChevronLeft size={14} /> Back
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </StepWrapper>
  );
}