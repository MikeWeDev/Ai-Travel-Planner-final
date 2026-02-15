"use client";

import { FormProvider, useFormContext } from "../context/FormContext";
import Step1 from "../components/steps/Step1";
import Step2 from "../components/steps/Step2";
import Step3 from "../components/steps/Step3";
import ReviewStep from "../components/steps/ReviewStep";
import { AnimatePresence } from "framer-motion";

function StepRenderer() {
  const { step } = useFormContext();

  return (
    <AnimatePresence mode="wait">
      <div aria-live="polite" role="region" aria-label="Trip planning steps">
        {step === 1 && <Step1 key="step1" />}
        {step === 2 && <Step2 key="step2" />}
        {step === 3 && <Step3 key="step3" />}
        {step === 4 && <ReviewStep key="review" />}
      </div>
    </AnimatePresence>
  );
}

export default function PlanPage() {
  return (
    <FormProvider>
      <main
        className="relative min-h-screen flex flex-col items-center justify-start px-4 py-12 overflow-hidden bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900 text-white selection:bg-pink-400 selection:text-white"
        role="main"
      >
        {/* Expansive animated background blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
        >
          <div
            className="absolute top-16 left-[-150px] w-[350px] h-[350px] bg-pink-600 rounded-full filter blur-3xl opacity-40 animate-blob"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute bottom-24 right-[-180px] w-[400px] h-[400px] bg-indigo-700 rounded-full filter blur-4xl opacity-30 animate-blob"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-800 rounded-full filter blur-4xl opacity-20 -translate-x-1/2 -translate-y-1/2 animate-blob"
            style={{ animationDelay: "4s" }}
          />
        </div>

       <h1 className="text-4xl font-extrabold text-center w-full mb-1">
  ✈️ Plan Your Dream Trip
</h1>
<StepRenderer />

      </main>
    </FormProvider>
  );
}
