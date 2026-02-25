"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Menu, X, PlaneTakeoff, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for token to update UI state
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/auth/auth-login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <PlaneTakeoff className="text-pink-500 group-hover:rotate-12 transition-transform" size={32} />
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">
            SmartTravel
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/plan" className="hover:text-pink-400 transition">Plan Trip</Link>
          <Link href="/about" className="hover:text-pink-400 transition">About</Link>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4 border-l border-white/20 pl-6">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 bg-indigo-600/50 hover:bg-indigo-600 px-4 py-2 rounded-full transition border border-white/10"
              >
                <User size={18} />
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="text-white/60 hover:text-red-400 transition">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              href="/auth/auth-login" 
              className="bg-white text-indigo-900 px-6 py-2 rounded-full font-bold hover:bg-indigo-100 transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-indigo-950 border-b border-white/10 px-6 py-8 flex flex-col gap-6"
          >
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="text-left text-red-400">Logout</button>
            ) : (
              <Link href="/auth/auth-login">Login</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}