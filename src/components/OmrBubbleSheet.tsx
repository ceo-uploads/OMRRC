import React, { useState } from "react";
import { Check, Hash, Save, Trash2, HelpCircle } from "lucide-react";
import { AnswerPreset, Translations } from "../types";

interface OmrBubbleSheetProps {
  lang: "en" | "bn";
  t: Translations;
  onSavePreset: (preset: AnswerPreset) => void;
  existingPresets: AnswerPreset[];
  onDeletePreset: (id: string) => void;
}

export const OmrBubbleSheet: React.FC<OmrBubbleSheetProps> = ({
  lang,
  t,
  onSavePreset,
  existingPresets,
  onDeletePreset
}) => {
  const [presetName, setPresetName] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [validationError, setValidationError] = useState("");
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);

  const options = ["A", "B", "C", "D"];

  const handleOptionClick = (qIndex: number, option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));
    setValidationError("");
  };

  const handleSave = () => {
    if (!presetName.trim()) {
      setValidationError(lang === "bn" ? "অনুগ্রহ করে প্রিসেটের একটি নাম লিখুন!" : "Please provide a name for the preset!");
      return;
    }

    // Verify all questions are answered
    const unanswered: number[] = [];
    for (let i = 1; i <= questionCount; i++) {
      if (!selectedAnswers[i]) {
        unanswered.push(i);
      }
    }

    if (unanswered.length > 0) {
      setValidationError(
        lang === "bn" 
          ? `সব প্রশ্ন পূরণ করতে হবে! অপূর্ণ প্রশ্ন: ${unanswered.slice(0, 5).join(", ")}${unanswered.length > 5 ? "..." : ""}`
          : `All questions must have a configured answer! Unanswered items: ${unanswered.slice(0, 5).join(", ")}${unanswered.length > 5 ? "..." : ""}`
      );
      return;
    }

    const newPreset: AnswerPreset = {
      id: "preset_" + Date.now(),
      name: presetName,
      questionCount,
      answers: selectedAnswers
    };

    onSavePreset(newPreset);
    
    // Reset state
    setPresetName("");
    setQuestionCount(30);
    setSelectedAnswers({});
    setValidationError("");
  };

  const autofillRandom = () => {
    const autofilled: Record<number, string> = {};
    for (let i = 1; i <= questionCount; i++) {
      autofilled[i] = options[Math.floor(Math.random() * options.length)];
    }
    setSelectedAnswers(autofilled);
    setValidationError("");
  };

  const renderBubbleRow = (index: number) => {
    const selected = selectedAnswers[index] || "";
    return (
      <div 
        key={index} 
        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors"
      >
        <span className="text-xs font-mono font-bold text-slate-500 w-8">
          {index.toString().padStart(2, "0")}
        </span>
        <div className="flex items-center gap-3">
          {options.map(option => {
            const isChosen = selected === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleOptionClick(index, option)}
                className={`h-7 w-7 rounded-full text-xs font-bold transition-all duration-150 flex items-center justify-center border ${
                  isChosen
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm scale-110"
                    : "bg-white text-slate-600 hover:bg-slate-200 border-slate-300"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Configuration Header Bento style */}
      <div className="glass p-5 border border-white/80 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-indigo-600" />
          {t.presetsTitle}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === "bn" ? "প্রিসেটের নাম" : "Preset Display Name"}
            </label>
            <input
              type="text"
              placeholder={lang === "bn" ? "যেমন: গণিত পরীক্ষা" : "e.g., Physics Midterm"}
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t.numQuestions} (1-100)
            </label>
            <div className="relative">
              <Hash className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="number"
                min="1"
                max="100"
                value={questionCount}
                onChange={e => {
                  const val = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                  setQuestionCount(val);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 pl-8 focus:outline-hidden focus:border-indigo-500 font-bold"
              />
            </div>
          </div>
        </div>

        {validationError && (
          <div className="p-2.5 bg-red-50 text-[11px] text-red-600 rounded-lg font-medium border border-red-100">
            {validationError}
          </div>
        )}

        {/* Bubble sheet grid */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{lang === "bn" ? "ওএমআর শিট ভিউ" : "OMR Key Matrix"}</span>
            <button
              type="button"
              onClick={autofillRandom}
              className="text-indigo-600 hover:underline hover:text-indigo-800 text-[10px] font-semibold"
            >
              {lang === "bn" ? "দ্বৈবচয়ন অটোফিল" : "Quick Autofill Model Key"}
            </button>
          </div>

          {/* Render columns of rows */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 select-none border border-slate-100 p-2 rounded-xl bg-slate-50/50">
            {Array.from({ length: questionCount }).map((_, index) => 
              renderBubbleRow(index + 1)
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs p-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
        >
          <Save className="h-4 w-4" />
          {t.savePreset}
        </button>
      </div>

      {/* Preset List Database Bento style */}
      {existingPresets.length > 0 && (
        <div className="glass p-5 border border-white/80 space-y-2.5">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === "bn" ? "সংরক্ষিত ওএমআর প্রিসেটসমূহ" : "Configured Key Presets"}
          </h4>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {existingPresets.map(preset => (
              <div 
                key={preset.id} 
                className="relative flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 overflow-hidden"
              >
                {deletingPresetId === preset.id ? (
                  <div className="absolute inset-0 bg-red-500 flex items-center justify-between px-3 text-white z-10 animate-fade">
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {lang === "bn" ? "ডিলিট করতে চান?" : "Delete keys preset?"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onDeletePreset(preset.id);
                          setDeletingPresetId(null);
                        }}
                        className="bg-white text-red-650 hover:bg-slate-50 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase"
                      >
                        {lang === "bn" ? "হ্যাঁ" : "Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPresetId(null)}
                        className="bg-transparent border border-white/60 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase hover:bg-white/15"
                      >
                        {lang === "bn" ? "বাতিল" : "Cancel"}
                      </button>
                    </div>
                  </div>
                ) : null}
                <div>
                  <h5 className="text-xs font-bold text-slate-700">{preset.name}</h5>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {preset.questionCount} {lang === "bn" ? "টি প্রশ্ন মডেল কী" : "MCQ model answers"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingPresetId(preset.id)}
                  aria-label="Delete preset"
                  className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
