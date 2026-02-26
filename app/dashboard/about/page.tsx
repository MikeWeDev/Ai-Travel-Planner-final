"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Map, Calendar, Sparkles, Camera, Globe, ArrowRight } from "lucide-react";
import Link  from 'next/link'
const features = [
  { 
    icon: <Map className="text-pink-500" />, 
    label: "Explore Destinations", 
    desc: "Uncover global hotspots and hidden corners with AI precision." 
  },
  { 
    icon: <Calendar className="text-indigo-400" />, 
    label: "Custom Itineraries", 
    desc: "Tailor-made schedules that respect your pace and preferences." 
  },
  { 
    icon: <Sparkles className="text-yellow-400" />, 
    label: "Smart Suggestions", 
    desc: "Our AI learns what you love to suggest the perfect stops." 
  },
  { 
    icon: <Camera className="text-cyan-400" />, 
    label: "Hidden Gems", 
    desc: "Go beyond the tourist traps with local-only secret spots." 
  },
];

const About = () => {
  return (
    <main className="min-h-screen bg-[#030305] text-white selection:bg-pink-500/30">
      {/* 1. Hero Section with Parallax Background */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072"
            alt="Digital Travel"
            fill
            className="object-cover opacity-40 grayscale-[20%]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030305]/80 to-[#030305]" />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Globe size={14} /> The Future of Travel
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-500"
          >
            Redefining Your <br /> Next Expedition.
          </motion.h1>
        </div>
      </section>

      {/* 2. Content Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Story */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold leading-tight">
              We combine <span className="text-pink-500">Human Curiosity</span> with <span className="text-indigo-400">Artificial Intelligence</span>.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Smart Travel AI isn't just a planner—it's your digital scout. We analyzed millions of data points to ensure that when you ask for an adventure, you don't get a generic list; you get a lived experience.
            </p>
            <Link href="/plan" className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-pink-500 hover:text-white transition-all transform hover:scale-105">
              Start Planning <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Right Side: Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-white/[0.03] border border-white/10 rounded-[2rem] hover:bg-white/[0.06] transition-all group"
              >
                <div className="mb-4 p-3 bg-black/40 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{f.label}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Footer Statement */}
      <footer className="border-t border-white/5 py-12 text-center">
        <p className="text-gray-600 text-sm italic">
          Crafted for the modern traveler. No more spreadsheets. Just exploration.
        </p>
      </footer>
    </main>
  );
};

export default About;