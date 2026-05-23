import React, { useState, useRef } from "react";
import { Upload, File, FileCode, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Layers, Trash2 } from "lucide-react";
import { AnswerPreset, Translations } from "../types";

interface ScannerTabProps {
  lang: "en" | "bn";
  t: Translations;
  presets: AnswerPreset[];
  onScanStart: (payload: {
    studentFile: File;
    answerKeyFile?: File;
    presetId?: string;
    questionCount?: number;
  }) => void;
  isLoading: boolean;
  onDeletePreset: (id: string) => void;
}

export const ScannerTab: React.FC<ScannerTabProps> = ({
  lang,
  t,
  presets,
  onScanStart,
  isLoading,
  onDeletePreset
}) => {
  // File states
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [studentFile, setStudentFile] = useState<File | null>(null);

  // Preset state if they skip Answer Key file
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");

  // Scan question count configuration state
  const [questionCount, setQuestionCount] = useState<number>(0);

  // Alert state
  const [mismatchError, setMismatchError] = useState<string | null>(null);

  // Drag states
  const [dragOverRef, setDragOverRef] = useState(false);
  const [dragOverStud, setDragOverStud] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const answerInputRef = useRef<HTMLInputElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);

  // Supported Extensions list
  const allowedExtensions = [
    "pdf", "docx", "jpg", "jpeg", "png", "heic", "heif", "webp", "raw", "cr2", "nef"
  ];

  const validateAndGetFile = (file: File): File | null => {
    const ext = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setMismatchError(t.invalidFileFormat + ` (${file.name})`);
      return null;
    }
    setMismatchError(null);
    return file;
  };

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = validateAndGetFile(e.target.files[0]);
      if (file) {
        setAnswerKeyFile(file);
        setSelectedPresetId(""); // Clear preset selection since they provided a real sheet
      }
    }
  };

  const handleStudentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = validateAndGetFile(e.target.files[0]);
      if (file) {
        setStudentFile(file);
      }
    }
  };

  // Drag over handlers
  const handleDragOverRef = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverRef(true);
  };
  const handleDragLeaveRef = () => setDragOverRef(false);
  const handleDropRef = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverRef(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = validateAndGetFile(e.dataTransfer.files[0]);
      if (file) {
        setAnswerKeyFile(file);
        setSelectedPresetId("");
      }
    }
  };

  const handleDragOverStud = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStud(true);
  };
  const handleDragLeaveStud = () => setDragOverStud(false);
  const handleDropStud = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStud(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = validateAndGetFile(e.dataTransfer.files[0]);
      if (file) {
        setStudentFile(file);
      }
    }
  };

  const executeExtraction = () => {
    if (!studentFile) return;
    onScanStart({
      studentFile,
      answerKeyFile: answerKeyFile || undefined,
      presetId: selectedPresetId || undefined,
      questionCount: selectedPresetId ? undefined : questionCount
    });
  };

  return (
    <div className="space-y-4">
      {/* Mismatch Alert Modal style */}
      {mismatchError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3 shadow-xs animate-shake">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-rose-800 uppercase tracking-wide">
              {t.mismatchAlert}
            </h4>
            <p className="text-[11px] text-rose-600 font-medium leading-relaxed">
              {mismatchError}
            </p>
            <button
              onClick={() => setMismatchError(null)}
              className="text-[10px] font-bold text-rose-800 underline block hover:text-rose-950 mt-1"
            >
              {lang === "bn" ? "ঠিক আছে, বন্ধ করুন" : "Dismiss Warning"}
            </button>
          </div>
        </div>
      )}

      {/* Uploader Box layout with Bento Grid styling */}
      <div className="glass p-5 border border-white/80 space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-indigo-600" />
          {t.uploadSectionTitle}
        </h3>

        {/* 1. Answer Key File Selector (Only if no preset chosen) */}
        {!selectedPresetId && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              (01) {t.uploadRefText}
            </label>
            <div
              onDragOver={handleDragOverRef}
              onDragLeave={handleRefUpload}
              onDrop={handleDropRef}
              onClick={() => answerInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                answerKeyFile
                  ? "bg-slate-50 border-emerald-400"
                  : dragOverRef
                  ? "bg-indigo-50 border-indigo-500 scale-[1.01]"
                  : "bg-slate-50 hover:bg-slate-100/70 border-slate-200"
              }`}
            >
              <input
                ref={answerInputRef}
                type="file"
                className="hidden"
                onChange={handleRefUpload}
                accept=".pdf,.docx,.jpg,.jpeg,.png,.heic,.heif,.webp,.raw"
              />
              {answerKeyFile ? (
                <div className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <span className="text-[11px] font-extrabold text-slate-700 line-clamp-1">
                    {answerKeyFile.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {(answerKeyFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                  <Upload className="h-6 w-6 text-indigo-500" />
                  <p className="text-[11px] font-semibold">
                    {lang === "bn" ? "উত্তরপত্রের ফাইল এখানে ড্রপ বা সিলেক্ট করুন" : "Drag reference answer key sheet here, or browse"}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    {t.formatNote}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Number of Questions block */}
        {!selectedPresetId && (
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {lang === "bn" ? "পরীক্ষার প্রশ্ন সংখ্যা নির্ধারণ করুন" : "Set Question Count to Scan"}
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value={0}>
                {lang === "bn" ? "✨ ওএমআর শিট থেকে স্বয়ংক্রিয় সনাক্তকরণ (Auto)" : "✨ Auto-Detect from OMR Sheet (Auto)"}
              </option>
              {[10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 100].map((num) => (
                <option key={num} value={num}>
                  {num} {lang === "bn" ? "টি প্রশ্ন মূল্যায়ন হবে" : "Questions to evaluate"}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Separator / Alternative to Image: Presets dropdown */}
        {!answerKeyFile && presets.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="h-[1px] bg-slate-200 flex-1"></span>
              <span>{t.orUsePreset}</span>
              <span className="h-[1px] bg-slate-200 flex-1"></span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {lang === "bn" ? "প্রস্তুতকৃত উত্তর প্রিসেট সিলেক্ট করুন" : "Select Predefined Answer Key"}
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedPresetId}
                  onChange={e => setSelectedPresetId(e.target.value)}
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="">{t.presetSelectPlaceholder}</option>
                  {presets.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.questionCount} {lang === "bn" ? "টি প্রশ্ন" : "questions"})
                    </option>
                  ))}
                </select>
                {selectedPresetId && !showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title={lang === "bn" ? "প্রিসেট ডিলিট করুন" : "Delete Selected Preset"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {selectedPresetId && showDeleteConfirm && (
                  <div className="flex items-center gap-1.5 shrink-0 bg-red-50 border border-red-200 p-1 rounded-lg animate-fade">
                    <button
                      type="button"
                      onClick={() => {
                        onDeletePreset(selectedPresetId);
                        setSelectedPresetId("");
                        setShowDeleteConfirm(false);
                      }}
                      className="px-2 py-1 bg-red-650 hover:bg-red-700 text-white text-[10px] font-black rounded uppercase transition cursor-pointer"
                    >
                      {lang === "bn" ? "হ্যাঁ, ডিলিট" : "Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded uppercase transition cursor-pointer"
                    >
                      {lang === "bn" ? "বাতিল" : "Cancel"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Examined Student Sheet Upload */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            (02) {t.uploadExaminedText}
          </label>
          <div
            onDragOver={handleDragOverStud}
            onDragLeave={handleDragLeaveStud}
            onDrop={handleDropStud}
            onClick={() => studentInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              studentFile
                ? "bg-slate-50 border-indigo-400"
                : dragOverStud
                ? "bg-indigo-50 border-indigo-500 scale-[1.01]"
                : "bg-slate-50 hover:bg-slate-100/70 border-slate-200"
            }`}
          >
            <input
              ref={studentInputRef}
              type="file"
              className="hidden"
              onChange={handleStudentUpload}
              accept=".pdf,.docx,.jpg,.jpeg,.png,.heic,.heif,.webp,.raw"
            />
            {studentFile ? (
              <div className="flex flex-col items-center gap-1">
                <FileCode className="h-6 w-6 text-indigo-500 animate-bounce" />
                <span className="text-[11px] font-extrabold text-slate-700 line-clamp-1">
                  {studentFile.name}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {(studentFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-400">
                <Upload className="h-6 w-6 text-indigo-500" />
                <p className="text-[11px] font-semibold">
                  {lang === "bn" ? "শিক্ষার্থীর উত্তরপত্র এখানে ড্রপ বা সিলেক্ট করুন" : "Drag exam student sheet here, or browse"}
                </p>
                <p className="text-[9px] text-slate-400">
                  {t.formatNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call to action trigger */}
        <button
          onClick={executeExtraction}
          disabled={!studentFile || (!answerKeyFile && !selectedPresetId) || isLoading}
          className={`w-full text-xs font-black p-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
            studentFile && (answerKeyFile || selectedPresetId)
              ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {t.runAnalysisBtn}
        </button>

        <p className="text-[9px] text-slate-400 font-mono text-center flex items-center justify-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {t.noInternetWarning}
        </p>
      </div>
    </div>
  );
};
