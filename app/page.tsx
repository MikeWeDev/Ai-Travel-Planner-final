"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "./lib/auth";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Activity, AlertCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  let isMounted = true;

  async function init() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600)); // animation delay

      const result = await checkAuth();

      if (!isMounted) return;

      if (result.authenticated) {
        router.replace("/plan");
      } else {
        router.replace("/auth/auth-login");
      }
    } catch (err) {
      console.error(err);
      if (isMounted) {
        router.replace("/auth/auth-login"); // fallback
      }
    }
  }

  init();

  return () => { isMounted = false; };
}, [router]);
  // Show error screen if authentication fails
  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#0d0d0f] text-white p-6">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="mb-6 text-red-500">
            <AlertCircle size={64} />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">Authentication Error</h2>
          <p className="text-gray-400 mb-8">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#00a3cc] hover:bg-[#00b8e6] transition-colors rounded-lg font-medium flex items-center gap-2"
          >
            Retry Connection
          </button>

          <p className="text-xs text-gray-600 mt-8">
            Make sure your backend server is running
          </p>
        </div>
      </div>
    );
  }

  // Main loading screen (your original beautiful design)
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-[#0d0d0f] text-white">
      <div className="relative flex items-center justify-center mb-12">
        {/* Outer Pulsing Ring */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute w-32 h-32 border border-[#00a3cc] rounded-full"
        />
        
        {/* Rotating Geometric Spinner */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="relative w-20 h-20 border-t-2 border-r-2 border-[#00a3cc] rounded-full flex items-center justify-center"
        >
          <Sparkles size={24} className="text-[#00a3cc] animate-pulse" />
        </motion.div>
      </div>

      {/* Terminal-Style Status Readout */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-black italic uppercase tracking-[0.4em] text-white">
          System <span className="text-[#00a3cc]">Auth</span>
        </h2>
        
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ duration: 1.2 }}
              className="h-[1px] bg-white/10" 
            />
            <span className="text-[9px] font-black italic uppercase tracking-widest text-gray-600">
              Verifying Credentials
            </span>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ duration: 1.2 }}
              className="h-[1px] bg-white/10" 
            />
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[8px] font-bold text-[#00a3cc]/50 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={10} /> Secure Protocol
            </p>
            <p className="text-[8px] font-bold text-[#00a3cc]/50 uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={10} /> Encrypted
            </p>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Metadata */}
      <div className="absolute bottom-12">
        <p className="text-gray-800 font-black italic uppercase text-[10px] tracking-[0.6em]">
          Smart Travel AI // Node-01
        </p>
      </div>
    </div>
  );
}