"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Map, Calendar, Sparkles, Camera, Globe, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from 'next/link';

const features = [
  { 
    icon: <Map size={20} className="text-[#00a3cc]" />, 
    label: "Explore Destinations", 
    desc: "Uncover global hotspots and hidden corners with AI precision." 
  },
  { 
    icon: <Calendar size={20} className="text-[#00a3cc]" />, 
    label: "Custom Itineraries", 
    desc: "Tailor-made schedules that respect your pace and parameters." 
  },
  { 
    icon: <Zap size={20} className="text-[#00a3cc]" />, 
    label: "Smart Suggestions", 
    desc: "Our neural engine learns your preferences to suggest perfect stops." 
  },
  { 
    icon: <Camera size={20} className="text-[#00a3cc]" />, 
    label: "Hidden Gems", 
    desc: "Go beyond the tourist traps with local-only secret spots." 
  },
];

const About = () => {
  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white selection:bg-[#00a3cc]/30">
      {/* 1. Hero Section with Cyberpunk Aesthetic */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden border-b border-white/5 " >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072"
            alt="Digital Neural Network"
            fill
            className="object-cover opacity-20 grayscale"
            priority
          />
          {/* Grid Overlay for technical feel */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d0f]/80 to-[#0d0d0f]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mt-14 px-4 py-1.5 rounded-full bg-[#00a3cc]/10 border border-[#00a3cc]/20 text-[#00a3cc] text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <Globe size={12} /> System Protocol v2.0
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black italic tracking-tighter mb-8 uppercase leading-none"
          >
            REDEFINING THE <br /> 
            <span className="text-[#00a3cc] drop-shadow-[0_10px_30px_rgba(0,163,204,0.3)]">NEXT EXPEDITION.</span>
          </motion.h1>
        </div>
      </section>

      {/* 2. Content Grid */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Side: Story */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="w-12 h-1 bg-[#00a3cc]" />
            <h2 className="text-4xl md:text-5xl font-black italic uppercase leading-[0.9] tracking-tighter">
              MERGING <span className="text-[#00a3cc]">RAW CURIOSITY</span> <br /> 
              WITH NEURAL LOGIC.
            </h2>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-widest leading-relaxed max-w-md">
              Smart Travel AI isn't just a planner—it's your digital scout. We analyze millions of data points to ensure your adventure isn't just a generic list, but a calculated masterpiece.
            </p>
            <Link href="/plan" className="inline-flex items-center gap-4 bg-[#00a3cc] text-white px-10 py-5 rounded-2xl font-black italic uppercase tracking-widest hover:bg-[#00c2f3] transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(0,163,204,0.2)]">
              Initialize Plan <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Right Side: Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 bg-[#1a1a1e] border border-white/5 rounded-[40px] hover:border-[#00a3cc]/40 transition-all group"
              >
                <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:bg-[#00a3cc] group-hover:text-white transition-all">
                  {f.icon}
                </div>
                <h3 className="text-lg font-black italic uppercase tracking-tight mb-3 group-hover:text-[#00a3cc] transition-colors">
                  {f.label}
                </h3>
                <p className="text-gray-600 font-bold uppercase text-[9px] leading-relaxed tracking-widest">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Status Bar Footer */}
      <footer className="border-t border-white/5 py-16 bg-[#0d0d0f]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-700 font-black italic uppercase text-[10px] tracking-[0.5em]">
            // SYSTEM STATUS: OPERATIONAL
          </p>
          <div className="flex gap-8 text-gray-700 font-black italic uppercase text-[10px] tracking-[0.3em]">
            <span>No Spreadsheets</span>
            <span className="text-[#00a3cc]">●</span>
            <span>Pure Exploration</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default About;