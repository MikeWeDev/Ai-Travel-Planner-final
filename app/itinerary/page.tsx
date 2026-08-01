"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, FormProvider } from "../context/FormContext";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ChevronLeft, 
  Download, 
  Save, 
  FileText, 
  Search, 
  AlertTriangle,
  ThumbsDown,
  X,
  Star,
  CheckCircle2
} from "lucide-react";

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

type Itinerary = {
  title: string;
  days: Day[];
};
type BudgetRecommendation = {
  suggestedDuration: number;
  requiredBudget: number;
  dailyAverage: number;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

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

function ItineraryContent() {
  const { itinerary, setItinerary } = useFormContext(); 
  const [localItinerary, setLocalItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing Manifest...");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [recommendation, setRecommendation] = useState<BudgetRecommendation | null>(null);
 const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  // =========================================================================
  // ⚡ REVIEW & ACTION OVERLAY CONTEXT STATES
  // =========================================================================
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [savedItineraryId, setSavedItineraryId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const data: Itinerary | null = itinerary && isItinerary(itinerary) ? itinerary : localItinerary;
  const lowerSearch = search.toLowerCase();

  const filteredDays = useMemo(() => {
    if (!data || !data.days) return [];
    return data.days.filter((day: Day) => {
      const dayNum = day.day?.toString() ?? "";
      const dayMatch = dayNum.includes(lowerSearch);
      const titleMatch = (day.title ?? "").toLowerCase().includes(lowerSearch);
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
        body: JSON.stringify({ title: data.title, days: data.days }),
      });
      const resData = await response.json();
      if (response.ok && resData._id) { 
        setSavedItineraryId(resData._id);
        setShowRatingModal(true); 
      } else { 
        throw new Error(resData.message || "Failed to save"); 
      }
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setSaving(false); 
    }
  };

  // =========================================================================
  // ⚡ REVIEW HANDLER PIPELINES
  // =========================================================================
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedItineraryId || rating === 0) return;

    const token = localStorage.getItem("token");
    try {
      await fetch(`${BACKEND_URL}/api/itineraries/rate/${savedItineraryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, ratingComment }),
      });
    } catch (err) {
      console.error("Independent review submission failure context:", err);
    } finally {
      setShowRatingModal(false);
      setShowSuccessAlert(true);
      resetReviewStates();
    }
  };

  const handleReviewSkip = () => {
    setShowRatingModal(false);
    setShowSuccessAlert(true);
    resetReviewStates();
  };

  const resetReviewStates = () => {
    setRating(0);
    setHoverRating(0);
    setRatingComment("");
  };

  const submitRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim() || !data) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Your session has expired. Please log in again to submit feedback.");
      router.push("/auth/auth-login");
      return;
    }

    setSubmittingReject(true);
    setShowRejectModal(false);
    
    setLoadingMessage("Regenerating itinerary based on your feedback, please wait...");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/itineraries/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalTitle: data.title,
          itineraryData: data.days,
          reason: rejectReason,            
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Failed to synchronize metrics.");
      }

      const storedInputs = localStorage.getItem("lastTripRequestInputParameters");
      if (!storedInputs) {
        throw new Error("Missing structural search context parameters to refresh layout configuration. Returning home.");
      }

      const parsedParameters = JSON.parse(storedInputs);

      const backendPayload = {
        city: parsedParameters.city || "",
        country: parsedParameters.country || "",
        interests: parsedParameters.interests || [],
        duration: parsedParameters.duration || parsedParameters.days || 1,
        budget: typeof parsedParameters.budget === "object" && parsedParameters.budget !== null
          ? parsedParameters.budget.amount 
          : parsedParameters.budget || 0
      };

      const regenResponse = await fetch(`${BACKEND_URL}/api/ai-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(backendPayload) 
      });

      const cleanRegenData = await regenResponse.json();

      if (!regenResponse.ok) {
        throw new Error(cleanRegenData.message || "Engine regeneration cycle timed out.");
      }

      localStorage.setItem("lastItinerary", JSON.stringify(cleanRegenData));
      setLocalItinerary(cleanRegenData);
      if (setItinerary) setItinerary(cleanRegenData);

      setRejectReason("");
      alert("✨ Itinerary re-calibrated and fully updated successfully!");

    } catch (err: any) {
      alert(err.message || "Error handling internal adaptive processing loop.");
      setError(err.message || "Failed dynamic processing lifecycle.");
    } finally {
      setSubmittingReject(false);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const loadItinerary = () => {
      try {
        const saved = localStorage.getItem("lastItinerary");
        if (!saved) throw new Error("No itinerary found in localStorage.");
        const parsed = JSON.parse(saved);

        if (parsed && parsed.status === "REJECTED") {
          setError(parsed.message || "Insufficient Budget");
          setRecommendation(parsed.recommendations || null);
          setLoading(false);
          return; 
        }

        if (!isItinerary(parsed)) {
          throw new Error("Itinerary data is invalid.");
        }

        setLocalItinerary(parsed);
      } catch (err) { 
        setError(err instanceof Error ? err.message : "Unknown error."); 
      } finally { 
        setLoading(false); 
      }
    };

    if (!itinerary) loadItinerary(); 
    else setLoading(false);
  }, [itinerary]);

const downloadPDF = async () => {
  if (!data) return;

  setDownloadingPDF(true);

  try {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor("#00a3cc");
    doc.text(data.title, 14, 20);

    let y = 30;

    data.days.forEach((day: Day, index: number) => {
      doc.setFontSize(14);

      doc.text(
        `Day ${day.day}: ${day.title}`,
        14,
        y
      );

      autoTable(doc, {
        startY: y + 5,
        head: [["Activities"]],
        body: day.activities.map((a: Activity) => [a.name]),
        theme: "striped",
        didDrawPage: (t) => {
          if (t.cursor) y = t.cursor.y + 10;
        },
      });

      if (
        index < data.days.length - 1 &&
        y > 250
      ) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("itinerary.pdf");

  } finally {
    setDownloadingPDF(false);
  } catch(error){
 alert("Failed generating PDF");
}
}
  const downloadTxt = () => {
    if (!data) return;
    let text = `${data.title}\n\n`;
    data.days.forEach((day: Day) => {
      text += `Day ${day.day}: ${day.title}\n`;
      day.activities.forEach((a: Activity) => (text += `- ${a.name}\n`));
      text += "\n";
    });
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "itinerary.txt";
    link.click();
  };

  if (loading) return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0f] text-white p-6 text-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <Sparkles size={48} className="text-[#00a3cc]" />
      </motion.div>
      <p className="mt-6 font-black italic uppercase tracking-widest text-sm text-gray-400 max-w-sm leading-relaxed">
        {loadingMessage}
      </p>
    </main>
  );

  if (error || !data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0f] text-white p-6">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-[#1a1a1e] border border-white/5 rounded-[40px] p-12 text-center"
        >
          {recommendation ? (
            <>
              <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
                <AlertTriangle size={40} className="text-orange-500" />
              </div>
              <h2 className="text-4xl font-black italic uppercase text-white mb-4 leading-none">Budget Calibration</h2>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-10 px-4">
                {error}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Option A: Reduce Days</p>
                    <p className="text-3xl font-black italic text-[#00a3cc]">{recommendation.suggestedDuration} <span className="text-sm">DAYS</span></p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Option B: Increase Budget</p>
                    <p className="text-3xl font-black italic text-[#00a3cc]">${recommendation.requiredBudget} <span className="text-sm">TOTAL</span></p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-black italic uppercase text-red-500 mb-2 leading-none">Manifest Error</h2>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-10">{error || "Data Corruption Detected"}</p>
            </>
          )}

          <button 
            onClick={() => router.push("/")} 
            className="w-full py-5 bg-white text-black rounded-2xl font-black italic uppercase hover:bg-[#00a3cc] hover:text-white transition-all flex items-center justify-center gap-3 text-xs"
          >
            <ChevronLeft size={18} /> Reconfigure Parameters
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white pb-24">
      {/* HEADER SECTION */}
      <div className="w-full bg-[#1a1a1e] border-b border-white/5 pt-16 pb-12 px-8 mb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex-1">
            <div className="w-12 h-1 bg-[#00a3cc] mb-4" />
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              {data.title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "text-[#00a3cc]" : ""}>{word} </span>
              ))}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={saveToDb} disabled={saving} className="h-12 px-6 rounded-xl bg-[#00a3cc] text-white font-black italic uppercase text-[10px] flex items-center gap-2 hover:bg-[#00c2f3] transition-all">
              <Save size={14} /> {saving ? "Saving..." : "Save to Profile"}
            </button>
            
            <button 
              onClick={() => setShowRejectModal(true)} 
              className="h-12 px-6 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 font-black italic uppercase text-[10px] flex items-center gap-2 hover:bg-red-900/40 transition-all"
            >
              <ThumbsDown size={14} /> Reject Plan
            </button>

          <button
  onClick={downloadPDF}
  disabled={downloadingPDF}
  className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-black italic uppercase text-[10px] flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
>
  <Download size={14} />

  {downloadingPDF 
    ? "Generating..." 
    : "PDF"
  }
</button>
            <button onClick={downloadTxt} className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-black italic uppercase text-[10px] flex items-center gap-2 hover:bg-white/10 transition-all">
              <FileText size={14} /> TXT
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {/* SEARCH BAR */}
        <div className="relative mb-16 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00a3cc] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search Objective, Activity, or Day..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-16 py-6 text-white font-black italic uppercase outline-none focus:border-[#00a3cc] transition-all"
          />
          <p className="mt-4 text-xs text-gray-500 font-bold uppercase tracking-widest">
  Showing {filteredDays.length} of {data.days.length} travel days
</p>
        </div>

        {/* ITINERARY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredDays.map((day: Day) => (
              <motion.div
                layout
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1a1a1e] border border-white/5 rounded-[40px] overflow-hidden group hover:border-[#00a3cc]/30 transition-all flex flex-col"
              >
               {day.image && (
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={getFullImageUrl(day.image)}
                    alt={day.title || `Visual for Day ${day.day}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1e] via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <span className="bg-[#00a3cc] text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase italic tracking-widest">
                      Phase {day.day}
                    </span>
                  </div>
                </div>
              )}

                <div className="p-8 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black italic uppercase text-white mb-6 group-hover:text-[#00a3cc] transition-colors leading-tight">
                    {day.title}
                  </h2>
                  
                  <div className="space-y-4 flex-1">
                    {day.activities.map((activity, i) => (
                      <div key={i} className="flex gap-4 items-start group/act">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-700 group-hover/act:bg-[#00a3cc] transition-colors" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-300 uppercase leading-relaxed tracking-tight">
                            {activity.name}
                          </p>
                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-tighter mt-1">
                            GPS: {activity.lat.toFixed(4)} / {activity.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* BOTTOM NAV */}
        <div className="mt-24 border-t border-white/5 pt-12 flex flex-col items-center">
          <button 
            onClick={() => router.push("/")} 
            className="group flex items-center gap-4 text-gray-500 hover:text-white transition-all font-black italic uppercase text-xs"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            New Operation
            <div className="w-12 h-[1px] bg-gray-800" />
          </button>
        </div>
      </div>

      {/* REJECTION INPUT OVERLAY DIALOG */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
onClick={() => {
  if (!submittingReject) {
    setShowRejectModal(false);
  }
}}              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#1a1a1e] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden"
            >
              <button 
onClick={() => {
  if (!submittingReject) {
    setShowRejectModal(false);
  }
}}                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                <ThumbsDown size={22} className="text-red-500" />
              </div>

              <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2">Reject Parameters</h3>
              <p className="text-xs text-gray-400 mb-6 font-medium">
                Help tune our learning models. Tell us exactly why this generation fell short of expectations.
              </p>

              <form onSubmit={submitRejection} className="space-y-6">
                <textarea
                  required
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g., The activities are too packed, or I want to avoid Yared School of Music entirely..."
                  className="w-full bg-[#0d0d0f] border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-red-500 transition-all font-semibold placeholder:text-gray-600 resize-none"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
      onClick={() => {
  if (!submittingReject) {
    setShowRejectModal(false);
  }
}}                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl font-black italic uppercase text-[10px] tracking-wider hover:bg-white/10 transition-all"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black italic uppercase text-[10px] tracking-wider transition-all"
                  >
                    Submit & Regenerate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
         ⭐ OPTIONAL RATING MODAL OVERLAY
      ========================================================================= */}
      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleReviewSkip}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#1a1a1e] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-[#00a3cc]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#00a3cc]/20 mx-auto">
                <Sparkles size={22} className="text-[#00a3cc]" />
              </div>

              <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2">Rate This Itinerary</h3>
              <p className="text-xs text-gray-400 mb-8 font-medium">
                How well did the system configure this trip deployment? You can skip this step at any time.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((index) => {
                    const isActive = index <= (hoverRating || rating);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setRating(index)}
                        onMouseEnter={() => setHoverRating(index)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-gray-600 hover:scale-110 transition-transform focus:outline-none p-1"
                      >
                        <Star 
                          size={28} 
                          className={isActive ? "fill-[#00a3cc] text-[#00a3cc]" : "text-gray-700"} 
                        />
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Add additional remarks regarding this manifest (Optional)..."
                  className="w-full bg-[#0d0d0f] border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#00a3cc] transition-all font-semibold placeholder:text-gray-600 resize-none"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReviewSkip}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-400 rounded-xl font-black italic uppercase text-[10px] tracking-wider hover:bg-white/10 hover:text-white transition-all"
                  >
                    Skip & Save
                  </button>
                  <button
                    type="submit"
                    disabled={rating === 0}
                    className="flex-1 py-4 bg-[#00a3cc] hover:bg-[#00c2f3] text-white rounded-xl font-black italic uppercase text-[10px] tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
         ⭐ SAVE SUCCESS FEEDBACK ALERT MODAL
      ========================================================================= */}
      <AnimatePresence>
        {showSuccessAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setShowSuccessAlert(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#1a1a1e] border border-emerald-500/20 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center"
            >
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 text-emerald-400"
              >
                <CheckCircle2 size={36} />
              </motion.div>

              <h4 className="text-xl font-black italic uppercase text-white mb-2">
  Trip Saved Successfully
</h4>

<p className="text-xs text-gray-400 font-medium mb-6">
  Your itinerary has been saved. Continue to your dashboard to manage your travel plans.
</p>
            <button
  onClick={() => router.push("/dashboard")}
  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black italic uppercase text-[10px] tracking-widest transition-all"
>
  Acknowledge
</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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