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
        className="relative flex flex-col items-center justify-start px-6 pb-12 
             min-h-screen overflow-hidden pt-[15vh]
             /* The base image: High contrast beach sunset */
             bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop')] 
             bg-cover bg-center bg-no-repeat bg-fixed
             text-white selection:bg-[#00a3cc] selection:text-white"
        role="main"
      >
        {/* LAYER 1: THE ATMOSPHERIC DARKENING 
            This mimics the lighting in your image—darkening everything 
            while letting the horizon glow slightly.
        */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        {/* LAYER 2: THE BLUE/TEAL GRADIENT 
            Notice how the right side of your image is very blue/dark teal. 
            This adds that color cast back in.
        */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-teal-900/40 pointer-events-none" />

        {/* LAYER 3: VIGNETTE & FOCUS
            This pushes the brightness to the left (horizon) and makes 
            the corners deep and moody.
        */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_transparent_0%,_black_80%)] opacity-70 pointer-events-none" />

        {/* LAYER 4: GLASS BLUR 
            This softens the background details so they don't distract.
        */}
        <div className="absolute inset-0 backdrop-blur-[1.5px] pointer-events-none" />

        {/* Main Content Area */}
        <div className="relative z-10 w-full flex flex-col items-center">
          <StepRenderer />
        </div>
      </main>
    </FormProvider>
  );
}