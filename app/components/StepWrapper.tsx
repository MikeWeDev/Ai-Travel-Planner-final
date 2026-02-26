"use client";

import { motion } from "framer-motion";
import React from "react";

export default function StepWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full flex justify-center"
    >
      <div className="w-full max-w-3xl px-6 sm:px-10 mt-8">
        {children}
      </div>
    </motion.div>
  );
}