"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, FormProvider } from "../context/FormContext";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Image from "next/image";
import { motion } from "framer-motion";

type Day = {
  day: number;
  title: string;
  activities: string[];
  image?: string;
};

type Itinerary = {
  title: string;
  days: Day[];
};


const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getFullImageUrl = (url: string): string => {
  if (!url) return "";

  // already absolute
  if (url.startsWith("http") || url.startsWith("data:")) {
    return url;
  }

  // ensure single /images path
  const cleanPath = url.replace(/^\/?images\//, "");

  return `${BACKEND_URL}/images/${cleanPath}`;
};
function isItinerary(obj: unknown): obj is Itinerary {
  return (
    !!obj &&
    typeof obj === "object" &&
    "title" in obj &&
    typeof (obj as any).title === "string" &&
    "days" in obj &&
    Array.isArray((obj as any).days)
  );
}

function ItineraryContent() {
  const { itinerary } = useFormContext();
  const [localItinerary, setLocalItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();
  // Inside ItineraryContent function
const [saving, setSaving] = useState(false);

const saveToDb = async () => {
  // 1. Guard Clause: Stop execution if data is null
  if (!data) {
    console.error("No itinerary data available to save.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to save your itinerary!");
    router.push("/auth/auth-login");
    return;
  }

  setSaving(true);
  try {
    const response = await fetch(`${BACKEND_URL}/api/itineraries/save`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      // 2. TypeScript now knows 'data' is defined here
      body: JSON.stringify({
        title: data.title,
        days: data.days,
      }),
    });

    if (response.ok) {
      alert("💾 Trip saved successfully!");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save");
    }
  } catch (err: any) {
    alert(err.message);
  } finally {
    setSaving(false);
  }
};

  const data: Itinerary | null =
    itinerary && isItinerary(itinerary) ? itinerary : localItinerary;

  const lowerSearch = search.toLowerCase();

  const filteredDays = useMemo(() => {
    if (!data) return [];
    return data.days.filter((day) => {
      const dayMatch = `${day.day}`.includes(lowerSearch);
      const titleMatch = day.title.toLowerCase().includes(lowerSearch);
      const activityMatch = day.activities.some((a) =>
        a.toLowerCase().includes(lowerSearch)
      );
      return dayMatch || titleMatch || activityMatch;
    });
  }, [data, lowerSearch]);

  useEffect(() => {
    const loadItinerary = () => {
      try {
        const saved = localStorage.getItem("lastItinerary");
        if (!saved) throw new Error("No itinerary found in localStorage.");
        const parsed = JSON.parse(saved);
        if (!isItinerary(parsed)) throw new Error("Itinerary data is invalid.");
        setLocalItinerary(parsed);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (!itinerary) {
      loadItinerary();
    } else {
      setLoading(false);
    }
  }, [itinerary]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-xl font-semibold text-indigo-300 select-none bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900">
        ⏳ Loading your itinerary...
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-tr from-red-900 via-red-800 to-red-900 ">
        <h2 className="text-3xl font-extrabold text-red-400 mb-4">⚠️ Failed to Load Itinerary</h2>
        <p className="mb-6 text-red-300 max-w-md">
          {error || "Your itinerary could not be found. Please try planning a new trip."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-4 focus:ring-red-500"
        >
          Start New Plan
        </button>
      </main>
    );
  }

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor("#5c3c92"); // dark purple text for title in PDF
    doc.text(data.title, 14, 20);
    let y = 30;

    data.days.forEach((day, index) => {
      doc.setFontSize(14);
      doc.setTextColor("#382d59"); // slightly lighter purple for day headings
      doc.text(`Day ${day.day}: ${day.title}`, 14, y);

      autoTable(doc, {
        startY: y + 5,
        head: [["Activities"]],
        body: day.activities.map((a) => [a]),
        theme: "striped",
        styles: { fontSize: 11 },
        margin: { left: 14, right: 14 },
        didDrawPage: (tableData) => {
          if (tableData.cursor) {
            y = tableData.cursor.y + 10;
          }
        },
      });

      if (index < data.days.length - 1 && y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("itinerary.pdf");
  };

  const downloadTxt = () => {
    let text = `${data.title}\n\n`;
    data.days.forEach((day) => {
      text += `Day ${day.day}: ${day.title}\n`;
      day.activities.forEach((a) => (text += `- ${a}\n`));
      text += "\n";
    });

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "itinerary.txt";
    link.click();
  };

  return (
    <main
      className="min-h-screen relative bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900 text-white px-8 py-12 max-w-7xl mx-auto select-none w-[100vw]"
      aria-live="polite"
    >
      {/* Background glowing circles */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div
          className="absolute top-20 left-[-100px] w-[280px] h-[280px] bg-pink-600 rounded-full filter blur-3xl opacity-50 animate-blob"
          style={{ animationDelay: "0s" }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-28 right-[-120px] w-[320px] h-[320px] bg-indigo-700 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000"
          aria-hidden="true"
          style={{ animationDelay: "2s" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[420px] h-[420px] bg-purple-800 rounded-full filter blur-4xl opacity-30 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"
          aria-hidden="true"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <h1 className="text-5xl font-extrabold text-center mb-12 drop-shadow-lg">
        {data.title}
      </h1>

      <input
        type="text"
        placeholder="🔍 Search day number, title or activity..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-3xl mx-auto mb-12 px-5 py-3 rounded-xl bg-white bg-opacity-25 placeholder-indigo-300 text-black focus:outline-none focus:ring-4 focus:ring-indigo-500 transition shadow-lg hover:bg-opacity-35"
        aria-label="Search itinerary"
      />

      {/* Grid of day cards */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
  {filteredDays.map((day) => (
    <motion.div
      key={day.day}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: day.day * 0.1 }}
      className="flex flex-col bg-black/30 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden cursor-pointer transition-transform transform duration-300 hover:scale-105 hover:shadow-2xl"
      aria-label={`Day ${day.day}: ${day.title}`}
    >
      {day.image && (
        <Image
          src={getFullImageUrl(day.image)}
          alt={`Day ${day.day} - ${day.title}`}
          className="w-full h-48 object-cover"
          width={800}
          height={320}
          priority={false}
          unoptimized={true}
        />
      )}
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-2xl font-semibold mb-3 text-white drop-shadow-md">
          Day {day.day}: {day.title}
        </h2>
        <ul className="list-disc list-inside space-y-1 flex-grow text-white/90 drop-shadow-sm">
          {day.activities.map((activity, i) => (
            <li key={i} className="leading-snug">
              {activity}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  ))}
</div>


      <div className="mt-16 flex flex-col items-center gap-6 max-w-md mx-auto">
        <button
          onClick={() => router.push("/")}
          className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 hover:from-purple-700 hover:to-pink-600 font-extrabold text-white shadow-lg transition duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-500"
        >
          Plan Another Trip
        </button>

        <div className="flex gap-6 w-full justify-center">
     
       <button
    onClick={saveToDb}
    disabled={saving}
    className="w-full px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition duration-300 disabled:opacity-50"
  >
    {saving ? "⏳ Saving..." : "💾 Save to Profile"}
  </button>

          <button
            onClick={downloadPDF}
            className="flex-1 px-4 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500"
            aria-label="Download itinerary as PDF"
          >
            ⬇️ PDF
          </button>
          <button
            onClick={downloadTxt}
            className="flex-1 px-4 py-3 rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-md transition duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400"
            aria-label="Download itinerary as TXT"
          >
            ⬇️ TXT
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ItineraryPage() {
  return (
    <FormProvider>
      <ItineraryContent />
    </FormProvider>
  );
}
