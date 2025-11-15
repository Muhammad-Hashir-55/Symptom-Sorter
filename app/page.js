// File: app/page.js
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ClipboardList, AlertTriangle } from "lucide-react";

// --- Helper Components --- //
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
    <p className="text-lg text-gray-300">Analyzing your symptoms...</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="bg-red-900/40 border border-red-600 text-red-300 px-4 py-3 rounded-lg shadow-md">
    <strong className="font-bold">⚠ Oops! </strong>
    <span className="block sm:inline">{message}</span>
  </div>
);

// --- Enhanced Analysis Result --- //
const AnalysisResult = ({ analysis }) => {
  // Extract sections using regex (FIXED FOR 4 SECTIONS)
  const conditionsBlock = analysis.match(/1\..*?(?=2\.)/s)?.[0] || "";
  const quickActionsBlock = analysis.match(/2\..*?(?=3\.)/s)?.[0] || "";
  const stepsBlock = analysis.match(/3\..*?(?=4\.)/s)?.[0] || "";
  const disclaimerBlock = analysis.match(/4\..*/s)?.[0] || "";

  // Clean + split into bullet points
  const cleanList = (block, min = 3, max = 6) => {
    let lines = block
      .split("\n")
      .map((l) => l.replace(/^\d+\.|\-|\*/g, "").trim())
      .filter((l) => l.length > 0);

    if (lines.length < min) {
      while (lines.length < min) lines.push("Not provided by AI");
    }
    if (lines.length > max) lines = lines.slice(0, max);

    return lines;
  };

  const conditions = cleanList(conditionsBlock, 3, 8);
  const quick = cleanList(quickActionsBlock, 2, 6);
  const steps = cleanList(stepsBlock, 3, 5);

  const disclaimer =
    disclaimerBlock
      .replace(/^4\.\s*/, "")
      .replace(/^[“"]|[”"]$/g, "")
      .trim() ||
    "This information is for educational purposes only and does not constitute a medical diagnosis. Please consult a licensed healthcare provider for professional evaluation.";

  return (
    <div className="space-y-6">

      {/* Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/60 p-6 rounded-xl shadow-lg border border-gray-700 backdrop-blur-md"
      >
        <h2 className="text-2xl font-bold text-blue-300 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-400" />
          Possible Related Conditions
        </h2>
        <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-300">
          {conditions.map((c, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {c}
            </motion.li>
          ))}
        </ul>
      </motion.div>


      {/* Quick Actions (NEW SECTION FIXED) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="bg-gray-800/60 p-6 rounded-xl shadow-lg border border-gray-700 backdrop-blur-md"
      >
        <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
          ⚡ Quick Actions
        </h2>
        <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-300">
          {quick.map((q, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {q}
            </motion.li>
          ))}
        </ul>
      </motion.div>


      {/* Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800/60 p-6 rounded-xl shadow-lg border border-gray-700 backdrop-blur-md"
      >
        <h2 className="text-2xl font-bold text-teal-300 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-teal-400" />
          Recommended Next Steps
        </h2>
        <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-300">
          {steps.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {s}
            </motion.li>
          ))}
        </ul>
      </motion.div>


      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-red-900/20 border border-red-600/40 p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Disclaimer
        </h2>
        <p className="mt-2 text-sm text-gray-300">{disclaimer}</p>
      </motion.div>
    </div>
  );
};


// --- Main Component --- //
export default function SymptomSorterPage() {
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAnalysis("");

    const input = symptoms.trim();
    if (!input) {
      setError("Please describe your symptoms before analyzing.");
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `
You are a medically responsible triage AI. Your role is to assist users in understanding potential health concerns based on reported symptoms. You must never provide a diagnosis.

Input: Symptoms: "${input}"

Your Output Must Include Only the Following Sections:

1. 🧠 Possible Related Conditions
List 7–8 plausible conditions associated with these symptoms.

2. ⚡ Quick Actions
Give simple, safe home-level steps (rest, hydration, compress, avoid triggers, etc.)

3. 👩‍⚕️ Recommended Next Steps
Suggest 5 appropriate actions with reasoning.

4. ⚠️ Disclaimer
"This information is for educational purposes only and does not constitute a medical diagnosis. Please consult a licensed healthcare provider for a professional evaluation."
`;

      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.NEXT_PUBLIC_GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Unknown error");

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      setAnalysis(text);
    } catch (err) {
      console.error("Gemini API error:", err);
      setError(err.message || "Failed to get analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white font-sans">
      <div className="w-full max-w-3xl mx-auto space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 animate-pulse">
            Symptom Sorter AI
          </h1>
          <p className="text-lg text-gray-400">
            Get safe, AI-powered insights about your health symptoms.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700 shadow-lg space-y-6"
        >
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full h-36 p-4 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-gray-200 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none placeholder-gray-500"
            placeholder="Describe your symptoms in detail..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 
              disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg px-6 py-3 transition-all shadow-lg hover:shadow-blue-500/50"
          >
            {isLoading ? "Analyzing..." : "Analyze My Symptoms"}
          </button>
        </form>

        <section className="min-h-[150px] space-y-6">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          <AnimatePresence>
            {analysis && <AnalysisResult analysis={analysis} />}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
