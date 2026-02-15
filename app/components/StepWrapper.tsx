"use client";

import { motion } from "framer-motion";
import React from "react";

export default function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto p-6 sm:p-10"
      style={{ minHeight: "calc(100vh - 4rem)" }} // optionally keep min height for consistent vertical layout
    >
      {children}
    </motion.div>
  );
}
