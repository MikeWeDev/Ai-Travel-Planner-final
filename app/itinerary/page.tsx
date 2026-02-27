"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, FormProvider } from "../context/FormContext";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Image from "next/image";
import { motion } from "framer-motion";

/* =====================================================
   TYPES (Fixed and Completed)
===================================================== */
type Activity = {
  name: string;
  lat: number;
  lng: number;
};

type Day = {
  day: number;
  title: string;
  activities: Activity[];
  image?: string;
};

// Added missing Itinerary type definition
type Itinerary = {
  title: string;
  days: Day[];
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getFullImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
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

/* =====================================================
   MAIN CONTENT COMPONENT
===================================================== */
function ItineraryContent() {
  const { itinerary } = useFormContext();
  const [localItinerary, setLocalItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const data: Itinerary | null = itinerary && isItinerary(itinerary) ? itinerary : localItinerary;

  const lowerSearch = search.toLowerCase();

 const filteredDays = useMemo(() => {
    if (!data || !data.days) return [];
    
    return data.days.filter((day: Day) => {
      // 1. Ensure day exists and handle day number conversion
      const dayNum = day.day?.toString() ?? "";
      const dayMatch = dayNum.includes(lowerSearch);

      // 2. Safely handle title (use optional chaining)
      const titleMatch = (day.title ?? "").toLowerCase().includes(lowerSearch);

      // 3. Safely handle activities array and activity names
      const activityMatch = (day.activities ?? []).some((a: Activity) =>
        (a.name ?? "").toLowerCase().includes(lowerSearch)
      );

      return dayMatch || titleMatch || activityMatch;
    });
  }, [data, lowerSearch]);

  const saveToDb = async () => {
    if (!data) return;
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
          "Authorization": `Bearer ${token}`,
        },
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

  const downloadPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor("#5c3c92");
    doc.text(data.title, 14, 20);
    let y = 30;

    data.days.forEach((day: Day, index: number) => { // Added Types
      doc.setFontSize(14);
      doc.setTextColor("#382d59");
      doc.text(`Day ${day.day}: ${day.title}`, 14, y);

      autoTable(doc, {
        startY: y + 5,
        head: [["Activities"]],
        body: day.activities.map((a: Activity) => [a.name]), // Added Activity type
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
    if (!data) return;
    let text = `${data.title}\n\n`;
    data.days.forEach((day: Day) => { // Added Day type
      text += `Day ${day.day}: ${day.title}\n`;
      day.activities.forEach((a: Activity) => (text += `- ${a.name}\n`)); // Added Activity type
      text += "\n";
    });

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "itinerary.txt";
    link.click();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-xl font-semibold text-indigo-300 bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900">
        ⏳ Loading your itinerary...
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-tr from-red-900 via-red-800 to-red-900">
        <h2 className="text-3xl font-extrabold text-red-400 mb-4">⚠️ Failed to Load Itinerary</h2>
        <p className="mb-6 text-red-300 max-w-md">{error || "Itinerary not found."}</p>
        <button onClick={() => router.push("/")} className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold shadow-lg">
          Start New Plan
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900 text-white px-8 py-12 max-w-7xl mx-auto w-[100vw]">
      <h1 className="text-5xl font-extrabold text-center mb-12 drop-shadow-lg">{data.title}</h1>

      <input
        type="text"
        placeholder="🔍 Search day number, title or activity..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-3xl mx-auto mb-12 block px-5 py-3 rounded-xl bg-white bg-opacity-25 text-black placeholder-indigo-300 shadow-lg"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {filteredDays.map((day: Day) => ( // Added Day type
          <motion.div
            key={day.day}
            className="flex flex-col bg-black/30 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden hover:scale-105 transition-transform"
          >
            {day.image && (
             <Image
  src={getFullImageUrl(day.image)}
  alt={day.title || `Image for Day ${day.day}`} // Fallback string
  className="w-full h-48 object-cover"
  width={800}
  height={320}
  unoptimized
/>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-3">Day {day.day}: {day.title}</h2>
              <ul className="list-disc list-inside space-y-1">
                {day.activities.map((activity: Activity, i: number) => ( // Added Activity and number type
                  <li key={i} className="leading-snug">
                    {activity.name}
                    <span className="text-[10px] opacity-50 ml-2">
                      ({activity.lat.toFixed(2)}, {activity.lng.toFixed(2)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-6 max-w-md mx-auto">
        <button onClick={() => router.push("/")} className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 font-extrabold shadow-lg">
          Plan Another Trip
        </button>
        <div className="flex gap-6 w-full">
          <button onClick={saveToDb} disabled={saving} className="flex-1 px-6 py-3 rounded-2xl bg-indigo-600 font-bold shadow-lg disabled:opacity-50">
            {saving ? "⏳ Saving..." : "💾 Save to Profile"}
          </button>
          <button onClick={downloadPDF} className="flex-1 px-4 py-3 rounded-2xl bg-green-600 font-semibold shadow-md">
            ⬇️ PDF
          </button>
          <button onClick={downloadTxt} className="flex-1 px-4 py-3 rounded-2xl bg-yellow-500 font-semibold shadow-md">
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