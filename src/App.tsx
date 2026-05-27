import React, { useState, useEffect } from "react";
import { 
  Scan, 
  History, 
  Settings as SettingsIcon, 
  Award, 
  Layers, 
  HelpCircle, 
  FileCheck, 
  Globe, 
  BookOpen, 
  ShieldAlert, 
  Facebook, 
  Instagram, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { OMRScanResult, AnswerPreset, AppTab, AppLanguage } from "./types";
import { translations } from "./translations";
import { AdsenseBanner } from "./components/AdsenseBanner";
import { OmrBubbleSheet } from "./components/OmrBubbleSheet";
import { ScannerTab } from "./components/ScannerTab";
import { ResultReport } from "./components/ResultReport";
import { OpenCvScanTerminal } from "./components/OpenCvScanTerminal";
import { UnrealStudioLogo } from "./components/UnrealStudioLogo";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>("scanner");
  const [lang, setLang] = useState<AppLanguage>("en");

  // Local Storage Data states
  const [results, setResults] = useState<OMRScanResult[]>([]);
  const [presets, setPresets] = useState<AnswerPreset[]>([]);
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);

  // Active Selected result to show in Results Tab
  const [activeResult, setActiveResult] = useState<OMRScanResult | null>(null);

  // Pagination constraints for History
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 20;

  // Global scanner loading parameters
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [activeScanPayload, setActiveScanPayload] = useState<{
    studentFile: File;
    answerKeyFile?: File;
    presetId?: string;
    questionCount?: number;
  } | null>(null);

  // Manual Preset Creator visibility Toggle
  const [showPresetCreator, setShowPresetCreator] = useState(false);

  const t = translations[lang];

  // Prepopulate with a helpful mock preset on first mount if none exists
  useEffect(() => {
    const cachedScans = localStorage.getItem("omr_scans");
    if (cachedScans) {
      setResults(JSON.parse(cachedScans));
    }

    const cachedPresets = localStorage.getItem("omr_presets");
    if (cachedPresets) {
      setPresets(JSON.parse(cachedPresets));
    } else {
      const defaultPreset: AnswerPreset = {
        id: "default_preset_1",
        name: "General Science Term Key",
        questionCount: 25,
        answers: {
          1: "A", 2: "B", 3: "C", 4: "D", 5: "A",
          6: "B", 7: "C", 8: "D", 9: "A", 10: "B",
          11: "C", 12: "D", 13: "A", 14: "B", 15: "C",
          16: "D", 17: "A", 18: "B", 19: "C", 20: "D",
          21: "A", 22: "B", 23: "C", 24: "D", 25: "A"
        }
      };
      setPresets([defaultPreset]);
      localStorage.setItem("omr_presets", JSON.stringify([defaultPreset]));
    }
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const saveNewPreset = (preset: AnswerPreset) => {
    const updated = [preset, ...presets];
    setPresets(updated);
    localStorage.setItem("omr_presets", JSON.stringify(updated));
    setShowPresetCreator(false);
  };

  const deleteExistingPreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem("omr_presets", JSON.stringify(updated));
  };

  const deleteScanHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingHistoryId(id);
  };

  // Main OMR processor triggered from ScannerTab
  const handleScanStart = async (payload: {
    studentFile: File;
    answerKeyFile?: File;
    presetId?: string;
    questionCount?: number;
  }) => {
    setScanning(true);
    setScannerError(null);
    setActiveScanPayload(payload);
  };

  // Pagination filtering
  const paginatedResults = results.slice(
    (historyPage - 1) * itemsPerPage,
    historyPage * itemsPerPage
  );
  const totalPages = Math.ceil(results.length / itemsPerPage) || 1;

  // Header mockup stats panel
  const totalCompletedScans = results.length;
  const highestScoreObj = results.reduce((prev, current) => 
    (prev.correctAnswers / prev.totalNumOfQuestions) > (current.correctAnswers / current.totalNumOfQuestions) ? prev : current
  , results[0] || null);

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-100 flex flex-col items-center justify-center p-0 md:p-6 text-slate-800 font-sans leading-normal selection:bg-indigo-100 antialiased overflow-hidden">
      
      {/* Visual background ambient blobs for luxury aesthetics */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-200/40 to-indigo-100/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-gradient-to-tr from-emerald-100/30 to-teal-50/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Frame wrapper mimicking clean modern Android UI scale layout styled as a Bento Grid Glass card */}
      <div className="w-full max-w-md glass border border-white/90 md:rounded-[40px] md:shadow-2xl h-full md:h-[840px] md:max-h-[96vh] flex flex-col justify-between relative overflow-hidden">

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 space-y-4">
          
          {/* Main App Title Logo structure */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Scan className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">
                  {t.appName}
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[8px] font-semibold text-slate-400 tracking-wide uppercase">
                    by
                  </span>
                  <UnrealStudioLogo size={10} showText={true} />
                </div>
              </div>
            </div>

            {/* Language Quick Toggle */}
            <button
              onClick={() => setLang(prev => prev === "en" ? "bn" : "en")}
              className="bg-white/90 border border-slate-200 rounded-lg py-1 px-2.5 text-[10px] font-extrabold flex items-center gap-1 text-slate-600 hover:border-indigo-400 transition-colors shadow-2xs"
            >
              <Globe className="h-3 w-3 text-indigo-600" />
              {lang === "en" ? "বাংলা" : "English"}
            </button>
          </div>

          {/* Tab switching renderer */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              
              {/* SCANNER TAB */}
              {activeTab === "scanner" && (
                <div className="space-y-4">
                  {/* Quick System Stats Widget styled as Bento panels */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="glass p-3 border border-white/90 flex items-center gap-3">
                      <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <FileCheck className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                          {lang === "bn" ? "মোট স্ক্যান" : "Total Graded"}
                        </div>
                        <div className="text-sm font-black text-slate-800 font-mono mt-0.5">
                          {totalCompletedScans} {lang === "bn" ? "টি খাতা" : "sheets"}
                        </div>
                      </div>
                    </div>

                    <div className="glass p-3 border border-white/90 flex items-center gap-3">
                      <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                        <Award className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                          {lang === "bn" ? "সেরা স্কোর" : "Top Record"}
                        </div>
                        <div className="text-xs font-black text-slate-800 truncate mt-0.5">
                          {highestScoreObj 
                            ? `${highestScoreObj.correctAnswers}/${highestScoreObj.totalNumOfQuestions}` 
                            : "—/—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API scan error banner */}
                  {scannerError && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block uppercase text-[10px] tracking-wider mb-0.5">Analysis Failed</span>
                        {scannerError}
                      </div>
                    </div>
                  )}

                  {/* Real-time OpenCv Computer Vision Scanning Terminal State */}
                  {scanning && activeScanPayload && (
                    <OpenCvScanTerminal
                      studentFile={activeScanPayload.studentFile}
                      answerKeyFile={activeScanPayload.answerKeyFile}
                      presetId={activeScanPayload.presetId}
                      questionCount={activeScanPayload.questionCount}
                      presets={presets}
                      lang={lang}
                      onComplete={(freshScanResult) => {
                        const updatedResults = [freshScanResult, ...results];
                        setResults(updatedResults);
                        localStorage.setItem("omr_scans", JSON.stringify(updatedResults));
                        setActiveResult(freshScanResult);
                        setScanning(false);
                        setActiveScanPayload(null);
                        setActiveTab("results");
                      }}
                      onCancel={() => {
                        setScanning(false);
                        setActiveScanPayload(null);
                      }}
                    />
                  )}

                  {/* Primary control form */}
                  {!scanning && (
                    <ScannerTab 
                      lang={lang} 
                      t={t} 
                      presets={presets} 
                      onScanStart={handleScanStart} 
                      isLoading={scanning} 
                      onDeletePreset={deleteExistingPreset}
                    />
                  )}

                  {/* Preset manual toggler fold container */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowPresetCreator(prev => !prev)}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-indigo-600" />
                        {t.createPresetBtn}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {presets.length} {lang === "bn" ? "টি প্রিসেট" : "saved"}
                      </span>
                    </button>

                    {showPresetCreator && (
                      <OmrBubbleSheet 
                        lang={lang} 
                        t={t} 
                        existingPresets={presets} 
                        onSavePreset={saveNewPreset} 
                        onDeletePreset={deleteExistingPreset} 
                      />
                    )}
                  </div>

                  {/* Sponsored native ad layout below controls */}
                  <AdsenseBanner type="native-feed" lang={lang} t={t} />
                </div>
              )}

              {/* RESULTS TAB */}
              {activeTab === "results" && (
                <div className="space-y-4">
                  {activeResult ? (
                    <ResultReport result={activeResult} lang={lang} t={t} />
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs text-slate-400 space-y-3">
                      <Layers className="h-10 w-10 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {lang === "bn" ? "কোনো ফলাফল পাওয়া যায়নি" : "No result to show"}
                      </p>
                      <p className="text-[11px] leading-relaxed max-w-xs mx-auto">
                        {lang === "bn" ? "ওএমআর আপলোড করে স্ক্যান করুন বা ওএমআর ইতিহাস থেকে কোনো খাতা নির্বাচন করুন।" : "Please perform a scan in the Scanner tab or select a previously graded file in the History menu."}
                      </p>
                      <button
                        onClick={() => setActiveTab("scanner")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-lg mt-2 transition-colors active:scale-95 shadow-sm"
                      >
                        {lang === "bn" ? "ওএমআর স্ক্যানার খুলুন" : "Go to Scanner"}
                      </button>
                    </div>
                  )}

                  <AdsenseBanner type="links-row" lang={lang} t={t} />
                </div>
              )}

              {/* HISTORY TAB */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      {t.previousResults}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {results.length} {lang === "bn" ? "টি গ্র্যান্ড ফল" : "entries"}
                    </span>
                  </div>

                  {results.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs text-slate-400 space-y-2">
                      <Clock className="h-8 w-8 text-slate-300 mx-auto animate-pulse" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {lang === "bn" ? "কোন ইতিহাস নেই" : "No history records"}
                      </p>
                      <p className="text-[11px] leading-tight">
                        {t.noHistory}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Grid lists of files */}
                      {paginatedResults.map(item => {
                        const isSelected = activeResult?.id === item.id;
                        const scorePerc = Math.round((item.correctAnswers / item.totalNumOfQuestions) * 100);
                        
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setActiveResult(item);
                              setActiveTab("results");
                            }}
                            className={`relative p-3 glass border select-none cursor-pointer transition-all flex items-center justify-between gap-3 overflow-hidden ${
                              isSelected 
                                ? "border-indigo-600 ring-2 ring-indigo-400/20 bg-white/95" 
                                : "border-white/80 hover:bg-white/90"
                            }`}
                          >
                            {deletingHistoryId === item.id ? (
                              <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="absolute inset-0 bg-red-500 flex items-center justify-between px-3 text-white z-10 animate-fade"
                              >
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  {lang === "bn" ? "ডিলিট করতে চান?" : "Delete scan result?"}
                                </span>
                                <div className="flex items-center gap-1.5 font-mono">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = results.filter(r => r.id !== item.id);
                                      setResults(updated);
                                      localStorage.setItem("omr_scans", JSON.stringify(updated));
                                      if (activeResult?.id === item.id) {
                                        setActiveResult(updated.length > 0 ? updated[0] : null);
                                      }
                                      setDeletingHistoryId(null);
                                    }}
                                    className="bg-white text-red-650 hover:bg-slate-50 text-[10px] font-extrabold px-2.5 py-1 uppercase rounded cursor-pointer"
                                  >
                                    {lang === "bn" ? "ডিলিট" : "Delete"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingHistoryId(null);
                                    }}
                                    className="bg-transparent border border-white/60 text-white text-[10px] font-bold px-2.5 py-1 uppercase rounded hover:bg-white/15 cursor-pointer"
                                  >
                                    {lang === "bn" ? "বাতিল" : "Cancel"}
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            {/* Score visual thumbnail preview panel as requested inside 05 */}
                            <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-50 border border-slate-200/70 overflow-hidden flex flex-col justify-between p-1 shadow-2xs">
                              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none text-center block pt-0.5">
                                OMR
                              </span>
                              <div className="text-[14px] font-black tracking-tighter text-indigo-700 text-center font-mono leading-none">
                                {scorePerc}%
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500" 
                                  style={{ width: `${scorePerc}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Center parameters */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-extrabold uppercase truncate max-w-[130px]">
                                  {item.headerText}
                                </span>
                                <span className="text-[8px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                                  {new Date(item.timestamp).toLocaleDateString(undefined, {month: "numeric", day: "numeric"})}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-700 truncate mt-1">
                                {item.studentName}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium font-mono">
                                ROLL: {item.rollNumber} | {item.totalNumOfQuestions} Ques
                              </p>
                            </div>

                            {/* Delete action button */}
                            <button
                              onClick={(e) => deleteScanHistoryItem(item.id, e)}
                              className="p-1 px-2 text-slate-400 rounded-md hover:text-red-500 hover:bg-red-50/50 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="text-[9px] font-black uppercase tracking-wider">
                                {lang === "bn" ? "ডিলিট" : "Delete"}
                              </span>
                            </button>
                          </div>
                        );
                      })}

                      {/* Pagination Controls inside 05 */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white/75 p-2 rounded-xl border border-slate-100 mt-4 shadow-3xs">
                          <button
                            onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                            disabled={historyPage === 1}
                            className="p-1 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <span className="text-xs font-bold text-slate-500">
                            {t.pageText} {historyPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setHistoryPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={historyPage === totalPages}
                            className="p-1 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <AdsenseBanner type="top-banner" lang={lang} t={t} />
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    {t.settingsTitle}
                  </h3>

                  {/* Language switch bento style */}
                  <div className="glass p-5 border border-white/80 space-y-3.5">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Globe className="h-4.5 w-4.5 text-indigo-600" />
                      {t.languageLabel}
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setLang("en")}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          lang === "en"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        English (EN)
                      </button>
                      <button
                        onClick={() => setLang("bn")}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          lang === "bn"
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        বাংলা (BN)
                      </button>
                    </div>
                  </div>

                  {/* Security Statement bento style */}
                  <div className="glass p-5 border border-white/80 space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                      {t.securityTitle}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
                      {t.securityContent}
                    </p>
                  </div>

                  {/* Terms and Condition bento style */}
                  <div className="glass p-5 border border-white/80 space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                      <BookOpen className="h-4.5 w-4.5 text-indigo-600" />
                      {t.termsTitle}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
                      {t.termsContent}
                    </p>
                  </div>

                  {/* Social media links bento style */}
                  <div className="glass p-5 border border-white/80 space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-800">
                      {t.socialFollow}
                    </h4>
                    <div className="flex gap-2">
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-blue-50 border border-blue-100 hover:bg-blue-100/60 p-2.5 rounded-xl text-xs font-bold text-blue-800 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </a>
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-pink-50 border border-pink-100 hover:bg-pink-100/60 p-2.5 rounded-xl text-xs font-bold text-pink-800 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Global Footer ad banner, highly responsive for mobile widths */}
          <div className="pt-2 border-t border-slate-200/50 mt-4 shrink-0">
            <AdsenseBanner type="top-banner" lang={lang} t={t} />
          </div>

        </main>

        {/* Global Floating Adsense widget */}
        <AdsenseBanner type="sticky-bottom" lang={lang} t={t} />

        {/* Mock Android Home Gesture Indicator Bar */}
        <div className="hidden md:block w-32 h-1 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0"></div>

        {/* bottom nav bar, fully glassmorphic bento block, and smoothly animated */}
        <nav className="absolute bottom-3 left-4 right-4 glass py-2.5 px-3 border border-white/90 shadow-xl flex items-center justify-between z-20 select-none">
          
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex flex-col items-center flex-1 justify-center relative cursor-pointer group py-1 ${
              activeTab === "scanner" ? "text-indigo-600 font-bold" : "text-slate-400 font-medium"
            }`}
          >
            {activeTab === "scanner" && (
              <motion.span 
                layoutId="active-indicator" 
                className="absolute inset-0 bg-indigo-50/70 rounded-xl -z-10 border border-indigo-100/40"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <Scan className="h-4.5 w-4.5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] tracking-tight">{t.bottomNavScanner}</span>
          </button>

          <button
            onClick={() => setActiveTab("results")}
            className={`flex flex-col items-center flex-1 justify-center relative cursor-pointer group py-1 ${
              activeTab === "results" ? "text-indigo-600 font-bold" : "text-slate-400 font-medium"
            }`}
          >
            {activeTab === "results" && (
              <motion.span 
                layoutId="active-indicator" 
                className="absolute inset-0 bg-indigo-50/70 rounded-xl -z-10 border border-indigo-100/40"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <Layers className="h-4.5 w-4.5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] tracking-tight">{t.bottomNavResults}</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center flex-1 justify-center relative cursor-pointer group py-1 ${
              activeTab === "history" ? "text-indigo-600 font-bold" : "text-slate-400 font-medium"
            }`}
          >
            {activeTab === "history" && (
              <motion.span 
                layoutId="active-indicator" 
                className="absolute inset-0 bg-indigo-50/70 rounded-xl -z-10 border border-indigo-100/40"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <History className="h-4.5 w-4.5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] tracking-tight">{t.bottomNavHistory}</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center flex-1 justify-center relative cursor-pointer group py-1 ${
              activeTab === "settings" ? "text-indigo-600 font-bold" : "text-slate-400 font-medium"
            }`}
          >
            {activeTab === "settings" && (
              <motion.span 
                layoutId="active-indicator" 
                className="absolute inset-0 bg-indigo-50/70 rounded-xl -z-10 border border-indigo-100/40"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <SettingsIcon className="h-4.5 w-4.5 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] tracking-tight">{t.bottomNavSettings}</span>
          </button>

        </nav>

      </div>
    </div>
  );
}
