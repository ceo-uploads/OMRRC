import React, { useState, useRef } from "react";
import { Download, Eye, FileText, CheckCircle, XCircle, Grid, HelpCircle, Loader2, RefreshCw, MoveHorizontal } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { OMRScanResult, Translations, OMRQuestion } from "../types";
import { UnrealStudioLogo } from "./UnrealStudioLogo";

interface ResultReportProps {
  result: OMRScanResult;
  lang: "en" | "bn";
  t: Translations;
}

export const ResultReport: React.FC<ResultReportProps> = ({ result, lang, t }) => {
  const [viewMode, setViewMode] = useState<"document" | "table">("document");
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Sync scroll percent dynamically if the user scrolls the sheet directly
  React.useEffect(() => {
    const container = reportContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) {
        setScrollPercent(0);
        return;
      }
      const pct = Math.round((container.scrollLeft / maxScroll) * 100);
      setScrollPercent(pct);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // States for student info so they are fully, accurately editable before PDF render
  const [studentName, setStudentName] = useState(result.studentName);
  const [rollNumber, setRollNumber] = useState(result.rollNumber);
  const [headerText, setHeaderText] = useState(result.headerText);
  const [otherInfo, setOtherInfo] = useState(result.otherInfo);
  const [questions, setQuestions] = useState<OMRQuestion[]>(result.questions);

  // Sync questions state if the incoming result prop changes
  React.useEffect(() => {
    setQuestions(result.questions);
    setStudentName(result.studentName);
    setRollNumber(result.rollNumber);
    setHeaderText(result.headerText);
    setOtherInfo(result.otherInfo);
  }, [result]);

  const totalNumOfQuestions = questions.length;
  const totalAnswered = questions.filter(q => q.studentAnswer && q.studentAnswer.trim() !== "").length;
  const correctAnswers = questions.filter(q => q.studentAnswer === q.actualAnswer).length;
  const scorePercentage = Math.round((correctAnswers / totalNumOfQuestions) * 100);
  const obtainedMark = correctAnswers;
  const maxMark = totalNumOfQuestions;

  // Helper function to convert OKLAB values to standard RGB/RGBA strings
  const convertOklabToRgb = (l: number, a: number, o_b: number, alpha?: number): string => {
    const l_lms = l + 0.3963377774 * a + 0.2158037573 * o_b;
    const m_lms = l - 0.1055613458 * a - 0.0638541728 * o_b;
    const s_lms = l - 0.0894841775 * a - 1.2914855480 * o_b;
    
    const l3 = l_lms * l_lms * l_lms;
    const m3 = m_lms * m_lms * m_lms;
    const s3 = s_lms * s_lms * s_lms;
    
    const r_l = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const g_l = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const b_l = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
    
    const gamma = (val: number): number => {
      return val <= 0.0031308
        ? 12.92 * val
        : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    };
    
    const r = Math.round(Math.max(0, Math.min(1, gamma(r_l))) * 255);
    const g = Math.round(Math.max(0, Math.min(1, gamma(g_l))) * 255);
    const r_b = Math.round(Math.max(0, Math.min(1, gamma(b_l))) * 255);
    
    if (alpha !== undefined && alpha !== null) {
      return `rgba(${r}, ${g}, ${r_b}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${r_b})`;
  };

  // Helper function to convert OKLCH values to standard RGB/RGBA strings
  const convertOklchToRgb = (l: number, c: number, h: number, alpha?: number): string => {
    const hRad = (h * Math.PI) / 180;
    const oklab_a = c * Math.cos(hRad);
    const oklab_b = c * Math.sin(hRad);
    return convertOklabToRgb(l, oklab_a, oklab_b, alpha);
  };

  // Substitution regex helper
  const substituteColorFunctions = (cssText: string): string => {
    if (!cssText) return "";
    let processed = cssText;
    
    // 1. Substitute oklch(...)
    processed = processed.replace(/oklch\(([^)]+)\)/gi, (match, inner) => {
      try {
        const cleanInner = inner.replace(/,/g, ' ').replace(/\//g, ' ');
        const parts = cleanInner.trim().split(/\s+/);
        if (parts.length < 3) return "rgb(99, 102, 241)"; // Indigo-500 fallback
        
        const lStr = parts[0];
        const cStr = parts[1];
        const hStr = parts[2];
        const aStr = parts[3];
        
        const l = lStr.endsWith("%") ? parseFloat(lStr) / 100 : parseFloat(lStr);
        const c = parseFloat(cStr);
        const h = parseFloat(hStr); // drops "deg" naturally
        
        let alpha = undefined;
        if (aStr) {
          alpha = aStr.endsWith("%") ? parseFloat(aStr) / 100 : parseFloat(aStr);
        }
        
        if (isNaN(l) || isNaN(c) || isNaN(h)) {
          return "rgb(99, 102, 241)";
        }
        
        return convertOklchToRgb(l, c, h, alpha);
      } catch (e) {
        return "rgb(99, 102, 241)";
      }
    });

    // 2. Substitute oklab(...)
    processed = processed.replace(/oklab\(([^)]+)\)/gi, (match, inner) => {
      try {
        const cleanInner = inner.replace(/,/g, ' ').replace(/\//g, ' ');
        const parts = cleanInner.trim().split(/\s+/);
        if (parts.length < 3) return "rgb(99, 102, 241)";
        
        const lStr = parts[0];
        const aStr = parts[1];
        const bStr = parts[2];
        const alphaStr = parts[3];
        
        const l = lStr.endsWith("%") ? parseFloat(lStr) / 100 : parseFloat(lStr);
        const o_a = parseFloat(aStr);
        const o_b = parseFloat(bStr);
        
        let alpha = undefined;
        if (alphaStr) {
          alpha = alphaStr.endsWith("%") ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
        }
        
        if (isNaN(l) || isNaN(o_a) || isNaN(o_b)) {
          return "rgb(99, 102, 241)";
        }
        
        return convertOklabToRgb(l, o_a, o_b, alpha);
      } catch (e) {
        return "rgb(99, 102, 241)";
      }
    });

    return processed;
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const originalGetComputedStyle = window.getComputedStyle;
    let element: HTMLDivElement | null = null;
    let originalPageStyles: { width: string; height: string; maxWidth: string; minHeight: string }[] = [];
    try {
      element = reportContainerRef.current;
      if (!element) return;

      // Create a Proxy map for style declarations to rewrite Oklch and Oklab values on the fly
      const styleProxyMap = new WeakMap<CSSStyleDeclaration, CSSStyleDeclaration>();
      const createStyleProxy = (styleDeclaration: CSSStyleDeclaration): CSSStyleDeclaration => {
        if (!styleDeclaration) return styleDeclaration;
        if (styleProxyMap.has(styleDeclaration)) {
          return styleProxyMap.get(styleDeclaration)!;
        }

        const proxy = new Proxy(styleDeclaration, {
          get(target, prop) {
            // Retrieve values directly on the target object to prevent native 'Illegal invocation' exceptions
            const val = target[prop as any] as any;
            if (typeof val === "function") {
              return function(this: CSSStyleDeclaration, ...args: any[]) {
                const res = val.apply(target, args);
                if (typeof res === "string" && (res.toLowerCase().includes("oklch") || res.toLowerCase().includes("oklab"))) {
                  return substituteColorFunctions(res);
                }
                return res;
              };
            }
            if (typeof prop === "string" && typeof val === "string") {
              if (val.toLowerCase().includes("oklch") || val.toLowerCase().includes("oklab")) {
                return substituteColorFunctions(val);
              }
            }
            return val;
          }
        });

        styleProxyMap.set(styleDeclaration, proxy);
        return proxy;
      };

      // Override the main window's getComputedStyle
      window.getComputedStyle = function(elt, pseudoElt) {
        return createStyleProxy(originalGetComputedStyle(elt, pseudoElt));
      } as any;

      // Extract and clean all styles from active stylesheets
      let combinedCss = "";
      try {
        for (let i = 0; i < document.styleSheets.length; i++) {
          const sheet = document.styleSheets[i];
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (rules) {
              for (let j = 0; j < rules.length; j++) {
                combinedCss += rules[j].cssText + "\n";
              }
            }
          } catch (e) {
            // Ignore cross-origin stylesheets
          }
        }
      } catch (globalErr) {
        console.error("Failed to compile global styles for PDF prep", globalErr);
      }

      // Pre-compile safe oklct/oklab free CSS
      const cleanCss = substituteColorFunctions(combinedCss);

      // Create a temporary `<style>` element containing our safe cleaned css
      const tempStyle = document.createElement("style");
      tempStyle.setAttribute("id", "pdf-temp-clean-styles");
      tempStyle.innerHTML = cleanCss;
      document.head.appendChild(tempStyle);

      const tempSheet = tempStyle.sheet;

      // Create a mock StyleSheetList representation returning ONLY this styleSheet
      const mockStyleSheets = {
        length: 1,
        0: tempSheet,
        item: (idx: number) => (idx === 0 ? tempSheet : null),
      } as unknown as StyleSheetList;

      // Redefine document.styleSheets with a dynamic getter to completely shield html2canvas from Tailwind oklab definitions
      Object.defineProperty(document, "styleSheets", {
        get: () => mockStyleSheets,
        configurable: true
      });

      // Define and temporarily freeze exact standard A4 physical sheet sizes during the capture
      const pages = element.querySelectorAll(".omr-pdf-page") as NodeListOf<HTMLElement>;
      originalPageStyles = [];
      
      pages.forEach((page) => {
        originalPageStyles.push({
          width: page.style.width || "",
          height: page.style.height || "",
          maxWidth: page.style.maxWidth || "",
          minHeight: page.style.minHeight || ""
        });
        page.style.width = "794px";
        page.style.height = "1122px";
        page.style.maxWidth = "794px";
        page.style.minHeight = "1122px";
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const pageEl = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2.2, // Boost rendering quality for high clarity print results
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          onclone: (clonedDoc) => {
            // Monkey-patch the cloned document context too, securing complete isolation
            Object.defineProperty(clonedDoc, "styleSheets", {
              get: () => mockStyleSheets,
              configurable: true
            });

            // Mock getComputedStyle for the cloned window context
            if (clonedDoc.defaultView) {
              const originalClonedGetComputedStyle = clonedDoc.defaultView.getComputedStyle;
              clonedDoc.defaultView.getComputedStyle = function(elt, pseudoElt) {
                return createStyleProxy(originalClonedGetComputedStyle(elt, pseudoElt));
              } as any;
            }

            // Strip references to external stylesheets inside the cloned iframe context
            const clonedLinks = Array.from(clonedDoc.getElementsByTagName("link"));
            clonedLinks.forEach(link => {
              if (link.rel === "stylesheet") link.remove();
            });

            const clonedStyles = Array.from(clonedDoc.getElementsByTagName("style"));
            clonedStyles.forEach(style => {
              if (style.getAttribute("id") !== "pdf-temp-clean-styles") {
                style.remove();
              }
            });

            // Append our pristine clean style block directly inside the clone
            const clonedCleanStyle = clonedDoc.createElement("style");
            clonedCleanStyle.innerHTML = cleanCss;
            clonedDoc.head.appendChild(clonedCleanStyle);

            // Purge inline styling color functions recursively
            const allClonedElements = clonedDoc.getElementsByTagName("*");
            for (let k = 0; k < allClonedElements.length; k++) {
              const el = allClonedElements[k] as HTMLElement;
              if (el.style && el.style.cssText) {
                const originalStyle = el.style.cssText;
                if (originalStyle.toLowerCase().includes("oklch") || originalStyle.toLowerCase().includes("oklab")) {
                  el.style.cssText = substituteColorFunctions(originalStyle);
                }
              }
            }
          }
        });

        const chunkImgData = canvas.toDataURL("image/png");
        pdf.addImage(chunkImgData, "PNG", 0, 0, imgWidth, pageHeight);
      }

      // Cleanup monkey patches and empty temporary tags immediately
      delete (document as any).styleSheets;
      tempStyle.remove();
      window.getComputedStyle = originalGetComputedStyle;

      // Restore original display styles for smooth UI representation on-screen
      pages.forEach((page, idx) => {
        page.style.width = originalPageStyles[idx].width;
        page.style.height = originalPageStyles[idx].height;
        page.style.maxWidth = originalPageStyles[idx].maxWidth;
        page.style.minHeight = originalPageStyles[idx].minHeight;
      });

      const safeName = studentName.trim().replace(/\s+/g, "_") || "student";
      pdf.save(`OMR_${safeName}_${rollNumber}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      // Ensure we restore default Document prototypes on catch failures too
      try {
        delete (document as any).styleSheets;
        window.getComputedStyle = originalGetComputedStyle;
        const ts = document.getElementById("pdf-temp-clean-styles");
        if (ts) ts.remove();
      } catch (cleanErr) {}
      alert(lang === "bn" ? "পিডিএফ তৈরি করতে ব্যর্থ হয়েছে।" : "Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
      window.getComputedStyle = originalGetComputedStyle;
      
      // Secondary fallback style restoration to prevent layout sticking
      try {
        const pages = element?.querySelectorAll(".omr-pdf-page") as NodeListOf<HTMLElement>;
        if (pages && originalPageStyles.length === pages.length) {
          pages.forEach((page, idx) => {
            page.style.width = originalPageStyles[idx].width;
            page.style.height = originalPageStyles[idx].height;
            page.style.maxWidth = originalPageStyles[idx].maxWidth;
            page.style.minHeight = originalPageStyles[idx].minHeight;
          });
        }
      } catch (cleanStylesErr) {}
    }
  };

  const handleForceAllCorrect = () => {
    setQuestions(prev => prev.map(q => ({
      ...q,
      studentAnswer: q.actualAnswer,
      isCorrect: true
    })));
  };

  const handleResetQuestions = () => {
    setQuestions(result.questions);
  };

  const handleBubbleClick = (qIndex: number, opt: string) => {
    if (!isEditing) return;
    setQuestions(prev => prev.map(q => {
      if (q.index === qIndex) {
        const studentAnswer = q.studentAnswer === opt ? "" : opt;
        return {
          ...q,
          studentAnswer,
          isCorrect: studentAnswer === q.actualAnswer
        };
      }
      return q;
    }));
  };

  // Logo for Unreal Studio (Unreal icon concept)
  const UnrealLogo = () => (
    <UnrealStudioLogo size={14} showText={true} />
  );

  return (
    <div className="space-y-4">
      {/* View Mode & Inline Information Correction Controls */}
      <div className="glass p-1.5 border border-white/80 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">
          {t.resultViewMode}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isEditing
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            {isEditing ? (lang === "bn" ? "সংশোধন বন্ধ করুন" : "Stop Editing") : (lang === "bn" ? "তথ্য সংশোধন" : "Edit Details")}
          </button>

          <button
            onClick={() => setViewMode("document")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "document"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {t.resultViewDocs}
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            {t.resultViewTable}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3.5 shadow-sm text-left">
          <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            {lang === "bn" ? "ওএমআর তথ্যাদি সংশোধন করুন" : "Verify & Rectify Sheet Metadata"}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {lang === "bn" ? "পরীক্ষার নাম (হেডার)" : "Exam Title (Header)"}
              </label>
              <input
                type="text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {lang === "bn" ? "অন্যান্য বিবরণ (শ্রেণি/বিষয়)" : "Other Meta (Class/Subject/Set)"}
              </label>
              <input
                type="text"
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {t.studentNameLabel}
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {t.rollNumberLabel}
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="border-t border-slate-200/50 pt-3 space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              {lang === "bn" ? "উত্তরপত্র মূল্যায়ন সংশোধন" : "Grades & Bubble Evaluation Rectification"}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleForceAllCorrect}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {lang === "bn" ? "সবগুলো সঠিক মেলান (১০০%)" : "Force 100% Correct Match"}
              </button>
              <button
                type="button"
                onClick={handleResetQuestions}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {lang === "bn" ? "আগের অবস্থায় ফিরিয়ে নিন" : "Reset to Scanned Answers"}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 font-medium italic">
              {lang === "bn" 
                ? "💡 নির্দেশিকা: নিচে ওএমআর কপির যেকোনো অক্ষরে ক্লিক করে সরাসরি ছাত্রের উত্তর পরিবর্তন বা সংশোধন করতে পারেন।"
                : "💡 Tip: You can also click directly on any letter bubble below to shade/unshade student's option manually!"}
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-200/50">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {lang === "bn" ? "সংরক্ষণ করুন" : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {/* Main Report Area to Print/Capture */}
      <div className="border border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-slate-100">
        <div 
          ref={reportContainerRef} 
          id="omr-report-card" 
          className="bg-slate-100 p-0 md:p-4 space-y-4 md:space-y-8 text-slate-800 select-none overflow-x-auto"
        >
          {(() => {
            const questionsPerPage = 45;
            const numPages = Math.ceil(questions.length / questionsPerPage) || 1;

            return Array.from({ length: numPages }).map((_, pageIdx) => {
              const startIdx = pageIdx * questionsPerPage;
              const pageQuestions = questions.slice(startIdx, startIdx + questionsPerPage);

              return (
                <React.Fragment key={pageIdx}>
                  <div
                    className="omr-pdf-page bg-white p-6 md:p-8 w-[794px] min-w-[794px] min-h-[1122px] h-[1122px] relative flex flex-col justify-between shadow-xs border border-slate-200/50 md:rounded-2xl mx-auto text-left animate-fade"
                  >
                  {/* PAGE TOP CONTENT CONTAINER */}
                  <div className="space-y-4">
                    {/* On Page 1 only: Render full institutional head and student credentials */}
                    {pageIdx === 0 ? (
                      <>
                        {/* Header Block mimicking actual sheet top */}
                        <div className="border-b-2 border-slate-950 pb-3 text-center space-y-1">
                          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
                            {headerText}
                          </h2>
                          <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                            {otherInfo}
                          </div>
                        </div>

                        {/* Student Profile Block */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-3.5 border border-slate-200/60 rounded-xl">
                          <div className="space-y-1 text-left">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {t.studentNameLabel}
                            </div>
                            <div className="text-xs font-extrabold text-slate-800 border-b border-dashed border-slate-300 pb-0.5">
                              {studentName}
                            </div>
                          </div>

                          <div className="space-y-1 text-left">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {t.rollNumberLabel}
                            </div>
                            <div className="text-xs font-mono font-black text-indigo-700 tracking-wider border-b border-dashed border-slate-300 pb-0.5">
                              {rollNumber}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Page > 1 minimal continued header layout line */
                      <div className="border-b border-dashed border-slate-200 pb-1.5 flex justify-between items-center bg-slate-50/40 px-2.5 py-1 rounded">
                        <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">
                          {lang === "bn" ? "ওএমআর মূল্যায়ন কপি (চলমান)" : "OMR Evaluation Sheet (Continued)"}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          {studentName} | Roll: {rollNumber}
                        </span>
                      </div>
                    )}

                    {/* DOCUMENT MODE: Grid with custom Checked Bubbles Sheet */}
                    {viewMode === "document" && (
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-1">
                          <FileText className="h-3.5 w-3.5 text-indigo-500" />
                          {lang === "bn" 
                            ? `বৃত্তাকার উত্তর প্রীতিচ্ছদ - পৃষ্ঠা ${pageIdx + 1}` 
                            : `Bubble Grids Feed - Page ${pageIdx + 1}`}
                        </h4>

                        <div className="grid border border-slate-100 p-2.5 rounded-2xl bg-zinc-50/20 gap-x-3 gap-y-1.5 grid-cols-3">
                          {pageQuestions.map(q => (
                            <div 
                              key={q.index} 
                              className={`flex items-center justify-between p-1 px-1.5 rounded-xl border leading-none transition-all ${
                                q.isCorrect 
                                  ? "bg-emerald-50/40 border-emerald-100 text-emerald-950" 
                                  : q.studentAnswer === ""
                                  ? "bg-amber-50/40 border-amber-100 text-amber-950"
                                  : "bg-rose-50/40 border-rose-100 text-rose-950"
                              }`}
                              style={{ height: "30px" }}
                            >
                              <span className="font-mono font-bold w-5 text-slate-400 text-[10px] text-center flex items-center justify-center leading-none">
                                {q.index.toString().padStart(2, "0")}
                              </span>

                              <div className="flex items-center gap-0.5 shrink-0 justify-center">
                                {["A", "B", "C", "D"].map(opt => {
                                  const isStudentMarked = q.studentAnswer === opt;
                                  const isCorrectKey = q.actualAnswer === opt;
                                  
                                  let bubbleStyle = "bg-white border-slate-300 text-slate-500";
                                  if (isStudentMarked) {
                                    bubbleStyle = q.isCorrect 
                                      ? "bg-emerald-600 border-emerald-600 text-white font-black" 
                                      : "bg-rose-600 border-rose-600 text-white font-black";
                                  } else if (isCorrectKey) {
                                    bubbleStyle = "bg-emerald-100 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400/30 font-bold";
                                  }

                                  return (
                                    <button 
                                      key={opt} 
                                      type="button"
                                      disabled={!isEditing}
                                      onClick={() => handleBubbleClick(q.index, opt)}
                                      style={{
                                        width: "20px",
                                        height: "20px",
                                        minWidth: "20px",
                                        minHeight: "20px",
                                        padding: "0px",
                                        margin: "0px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}
                                      className={`rounded-full border text-[9px] flex items-center justify-center font-mono font-bold shrink-0 p-0 text-center leading-none transition-all ${bubbleStyle} ${
                                        isEditing 
                                          ? "cursor-pointer hover:scale-110 active:scale-95 shadow-xs border-indigo-400/70" 
                                          : ""
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="shrink-0 flex items-center justify-center">
                                {q.isCorrect ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TABULAR MODE: structured layout tables */}
                    {viewMode === "table" && (
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200">
                              <th className="py-2 px-3 text-left font-bold">{t.tableHeaderIndex}</th>
                              <th className="py-2 px-3 text-center font-bold">{t.tableHeaderStudent}</th>
                              <th className="py-2 px-3 text-center font-bold">{t.tableHeaderActual}</th>
                              <th className="py-2 px-3 text-right font-bold">{t.tableHeaderStatus}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {pageQuestions.map(q => (
                              <tr key={q.index} className="hover:bg-slate-50/50">
                                <td className="py-1.5 px-3 font-mono font-bold text-slate-500">
                                  {q.index}
                                </td>
                                <td className="py-1.5 px-3 text-center">
                                  <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded ${
                                    q.studentAnswer === ""
                                      ? "text-slate-400 bg-slate-100"
                                      : q.isCorrect
                                      ? "text-emerald-700 bg-emerald-50"
                                      : "text-rose-700 bg-rose-50"
                                  }`}>
                                    {q.studentAnswer || t.blank}
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-center">
                                  <span className="inline-block font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                    {q.actualAnswer}
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-right">
                                  <span className={`inline-flex items-center gap-1 font-bold text-[9px] uppercase rounded-full px-2 py-0.5 ${
                                    q.isCorrect 
                                      ? "font-black bg-emerald-105 text-emerald-800" 
                                      : "font-black bg-rose-105 text-rose-850"
                                  }`}>
                                    {q.isCorrect ? t.correct : t.incorrect}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* PAGE FOOTER SECURE WRAPPER - Always anchored at the actual bottom of page */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 bg-white">
                    {pageIdx === numPages - 1 ? (
                      <>
                        {/* Assessment Aggregate Footer Block */}
                        <div className="border border-slate-200 grid grid-cols-4 gap-2 text-center bg-slate-50/60 p-2.5 rounded-xl">
                          <div className="flex flex-col items-center justify-center text-center p-1">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1 text-center">{t.totalQuestions}</div>
                            <div className="text-xs font-mono font-black text-slate-800 leading-none text-center">{totalNumOfQuestions}</div>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center p-1">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1 text-center">{t.totalAnswered}</div>
                            <div className="text-xs font-mono font-black text-slate-800 leading-none text-center">{totalAnswered}</div>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center p-1">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1 text-center">{lang === "bn" ? "সঠিক উত্তর" : "Correct Answers"}</div>
                            <div className="text-xs font-mono font-black text-emerald-600 leading-none text-center">{correctAnswers}</div>
                          </div>
                          <div className="bg-indigo-600 text-white rounded-lg p-1.5 flex flex-col items-center justify-center text-center">
                            <div className="text-[8px] font-bold uppercase tracking-wider text-indigo-150 leading-none mb-1 text-center">{t.obtainedMarkLabel}</div>
                            <div className="text-xs font-bold font-mono leading-none text-center w-full">
                              {obtainedMark} / {maxMark}
                            </div>
                          </div>
                        </div>

                        {/* Report Footer branding */}
                        <div className="flex flex-row items-center justify-between gap-3 text-[10px] text-slate-400 pt-1 w-full">
                          <div className="flex items-center gap-1.5 justify-center">
                            <span className="font-mono leading-none flex items-center">Generated from OMR Result Extractor - by</span>
                            <div className="inline-flex items-center justify-center h-4">
                              <UnrealLogo />
                            </div>
                          </div>
                          <div className="font-semibold text-slate-500 leading-none flex items-center">
                            {new Date(result.timestamp).toLocaleString(undefined, {
                              year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                            } as any)}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Simple pagination lines for earlier pages */
                      <div className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-50/50 px-3 py-1.5 rounded-lg">
                        <span className="font-bold uppercase tracking-wider text-indigo-500 text-[8px]">
                          {lang === "bn" ? "পরবর্তী পাতায় চলমান..." : "Continued on next page..."}
                        </span>
                        <span className="font-mono font-black text-slate-500">
                          {lang === "bn" ? `পৃষ্ঠা ${pageIdx + 1} / ${numPages}` : `Page ${pageIdx + 1} of ${numPages}`}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* MOBILITY HORIZONTAL SLIDER HELPERS FOR RESPONSIVE MOBILE DEVICE WIDTHS */}
                  <div className="no-print block md:hidden sticky left-0 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-xs mt-3 w-full select-none">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5 px-1">
                      <span className="flex items-center gap-1.5 uppercase tracking-wide">
                        <MoveHorizontal className="h-4 w-4 text-indigo-600 animate-pulse" />
                        {lang === "bn" ? "মোবাইল স্ক্রোল স্লাইডার" : "Mobile Scroll Slider"}
                      </span>
                      <span className="font-mono text-indigo-700 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
                        {scrollPercent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{lang === "bn" ? "বাম" : "Left"}</span>
                      <div className="relative flex-1 flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={scrollPercent}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setScrollPercent(val);
                            if (reportContainerRef.current) {
                              const container = reportContainerRef.current;
                              const maxScroll = container.scrollWidth - container.clientWidth;
                              if (maxScroll > 0) {
                                container.scrollLeft = (val / 100) * maxScroll;
                              }
                            }
                          }}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          style={{
                            background: `linear-gradient(to right, rgb(79, 70, 229) 0%, rgb(79, 70, 229) ${scrollPercent}%, rgb(241, 245, 249) ${scrollPercent}%, rgb(241, 245, 249) 100%)`
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{lang === "bn" ? "ডান" : "Right"}</span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
              );
            });
          })()}
        </div>
      </div>

      {/* Exporter triggers */}
      <button
        onClick={handleDownloadPdf}
        disabled={isExporting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-xs p-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {t.downloadPdfBtn}
      </button>
    </div>
  );
};
