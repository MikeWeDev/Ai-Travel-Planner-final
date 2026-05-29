"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Menu, X, Compass, LayoutDashboard, LogOut, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/auth/auth-login");
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
      {/* Pill-shaped Navbar Container */}
      <div className="w-full max-w-5xl h-[60px] flex items-center justify-between px-6 rounded-2xl bg-[#1a1a1e]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        
        {/* Logo - Matches WANDERAI // HQ Style */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-[#00a3cc] p-1.5 rounded-full">
            <Compass className="text-white group-hover:rotate-45 transition-transform" size={18} />
          </div>
          <span className="text-sm font-black italic tracking-[0.2em] text-white uppercase">
            Travel <span className="text-white/30 font-normal ml-1">// HQ</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.15em]">
            <Link href="/plan" className="text-white/70 hover:text-[#00a3cc] transition">Plan Trip</Link>
            <Link href="/dashboard/about" className="text-white/70 hover:text-[#00a3cc] transition">About</Link>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition border border-white/5"
                >
                  <User size={14} className="text-[#00a3cc]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-white/40 hover:text-red-400 transition">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              /* Light Mode styled Login Button */
              <Link 
                href="/auth/auth-login" 
                className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-gray-200 transition"
              >
                <Sun size={12} fill="black" />
                Login / Light Mode
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-20 left-6 right-6 md:hidden bg-[#1a1a1e] border border-white/10 rounded-[30px] p-8 flex flex-col gap-6 shadow-2xl"
          >
            <Link href="/plan" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-white">Plan Trip</Link>
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <LayoutDashboard size={18} className="text-[#00a3cc]" /> Dashboard
            </Link>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="text-left text-xs font-bold uppercase tracking-widest text-red-500">Logout</button>
            ) : (
              <Link href="/auth/auth-login" className="text-sm font-bold uppercase tracking-widest text-[#00a3cc]">Login</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}