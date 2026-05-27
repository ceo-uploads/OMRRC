import React, { useState, useEffect } from "react";
import { ExternalLink, X, Award, Shield, Sparkles } from "lucide-react";
import { Translations } from "../types";

interface AdsenseBannerProps {
  type: "top-banner" | "native-feed" | "links-row" | "sticky-bottom";
  lang: "en" | "bn";
  t: Translations;
}

export const AdsenseBanner: React.FC<AdsenseBannerProps> = ({ type, lang, t }) => {
  const [visible, setVisible] = useState(true);

  // Adsterra Configuration
  const smartlinkUrl = "https://www.effectivecpmnetwork.com/rqdgipw7wh?key=03d73d2cd05c7a2ec95bdbc933e5453c";

  useEffect(() => {
    try {
      // 1. Inject Popunder global script once for user monetization
      const popunderScriptId = "adsterra-popunder-script";
      if (typeof window !== "undefined" && !document.getElementById(popunderScriptId)) {
        const script = document.createElement("script");
        script.id = popunderScriptId;
        script.src = "https://pl29561992.effectivecpmnetwork.com/66/66/24/6666241adf38bd674b5444fb7e307b3d.js";
        script.async = true;
        document.body.appendChild(script);
      }

      // 2. Inject Social Bar global script once for active overlap overlays
      const socialScriptId = "adsterra-socialbar-script";
      if (typeof window !== "undefined" && !document.getElementById(socialScriptId)) {
        const script = document.createElement("script");
        script.id = socialScriptId;
        script.src = "https://pl29561995.effectivecpmnetwork.com/c5/72/53/c57253bdddc5a456ea9e233f93348634.js";
        script.async = true;
        document.body.appendChild(script);
      }

      // 3. Inject In-page Banner script for the container
      if (type === "top-banner") {
        const containerScriptId = "adsterra-container-script";
        if (typeof window !== "undefined" && !document.getElementById(containerScriptId)) {
          const script = document.createElement("script");
          script.id = containerScriptId;
          script.src = "https://pl29561993.effectivecpmnetwork.com/4fcc4a52d53e415500ceca70ff44cc09/invoke.js";
          script.async = true;
          script.setAttribute("data-cfasync", "false");
          document.body.appendChild(script);
        }
      }
    } catch (e) {
      console.warn("Failed to mount Adsterra scripts:", e);
    }
  }, [type]);

  if (!visible) return null;

  const handleAdClick = () => {
    window.open(smartlinkUrl, "_blank", "noopener,noreferrer");
  };

  const adTexts = {
    en: [
      {
        title: "⭐️ Sponsor: Unreal OMR Pro Cloud ⭐️",
        desc: "Evaluate 1,000+ sheets per minute with optical AI cloud grids. Secure, instant & robust.",
        cta: "Claim Free Trial"
      },
      {
        title: "🚀 Unreal Studio Creator Studio",
        desc: "Transform your Android mobile app mockups into lightweight React codebases instantly.",
        cta: "Learn More"
      },
      {
        title: "⚡ Affordable OMR Scanner Devices",
        desc: "Get certified hardware scanners directly compatible with mobile applications. 45% Off Today.",
        cta: "Shop Scanners"
      }
    ],
    bn: [
      {
        title: "⭐️ স্পন্সর: আনরিয়েল ওএমআর প্রো ক্লাউড ⭐️",
        desc: "অপটিক্যাল এআই ক্লাউড গ্রিডের সাহায্যে প্রতি মিনিটে ১০০০+ খাতা মূল্যায়ন করুন। সুরক্ষিত ও তাৎক্ষণিক।",
        cta: "ফ্রি ট্রায়াল নিন"
      },
      {
        title: "🚀 আনরিয়েল স্টুডিও ক্রিয়েটর স্যুট",
        desc: "অ্যান্ড্রয়েড মোবাইল অ্যাপ মকআপগুলো সহজেই রিয়্যাক্ট কোডবেজে রূপান্তর করুন।",
        cta: "বিস্তারিত দেখুন"
      },
      {
        title: "⚡ সাশ্রয়ী ওএমআর স্ক্যানার ডিভাইস",
        desc: "মোবাইলের সাথে সরাসরি ব্যবহারযোগ্য ওএমআর স্ক্যানার কিনুন ৪৫% ছাড়ে।",
        cta: "স্ক্যানার দেখুন"
      }
    ]
  };

  const currentAds = adTexts[lang];
  const activeAd = type === "top-banner" ? currentAds[0] : type === "native-feed" ? currentAds[1] : currentAds[2];

  if (type === "top-banner") {
    return (
      <div className="w-full bg-white/75 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2.5 xs:p-3 shadow-xs relative overflow-hidden transition-all hover:bg-white/95 mb-4 select-none">
        <style dangerouslySetInnerHTML={{__html: `
          #container-4fcc4a52d53e415500ceca70ff44cc09 {
            max-width: 100% !important;
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            overflow: hidden !important;
          }
          #container-4fcc4a52d53e415500ceca70ff44cc09 iframe,
          #container-4fcc4a52d53e415500ceca70ff44cc09 a,
          #container-4fcc4a52d53e415500ceca70ff44cc09 img,
          #container-4fcc4a52d53e415500ceca70ff44cc09 div {
            max-width: 100% !important;
            height: auto !important;
            margin: 0 auto !important;
          }
        `}} />
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono tracking-wider mb-2">
          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest leading-none">
            {lang === "bn" ? "স্পনসরড লিংক" : "Sponsored Unit"}
          </span>
          <span className="flex items-center gap-1 font-semibold text-indigo-500">
            <Sparkles className="h-2.5 w-2.5" />
            Adsterra Network
          </span>
        </div>

        {/* Real Adsterra Native Banner Container */}
        <div className="w-full flex justify-center mb-1.5 overflow-hidden">
          <div id="container-4fcc4a52d53e415500ceca70ff44cc09" className="w-full"></div>
        </div>

        {/* Fallback to direct Smartlink */}
        <div className="flex items-center justify-between gap-2.5 mt-1.5 animate-fade border-t border-slate-100 pt-2 cursor-pointer" onClick={handleAdClick}>
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-bold text-slate-800 hover:text-indigo-600 flex items-center gap-1 truncate">
              {activeAd.title}
              <ExternalLink className="h-2.5 w-2.5 text-indigo-500 inline-block shrink-0" />
            </h4>
            <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5 leading-tight">
              {activeAd.desc}
            </p>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAdClick();
            }}
            className="text-[9px] font-bold bg-indigo-600 text-white px-2 py-1 rounded shadow-2xs hover:bg-indigo-700 whitespace-nowrap active:scale-95 transition-all cursor-pointer shrink-0"
          >
            {activeAd.cta}
          </button>
        </div>
      </div>
    );
  }

  if (type === "native-feed") {
    return (
      <div 
        className="w-full bg-emerald-50/40 border border-emerald-100/80 rounded-2xl p-4 shadow-xs relative overflow-hidden transition-all hover:bg-emerald-50/60 mb-5 text-left cursor-pointer"
        onClick={handleAdClick}
      >
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono tracking-wider mb-2">
          <span className="bg-emerald-100 text-emerald-850 px-1.5 py-0.5 rounded-sm uppercase font-black text-[8px] tracking-widest leading-none">
            {lang === "bn" ? "স্পন্সরড কন্টেন্ট" : "Sponsored Feed"}
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            Adsterra Feed
          </span>
        </div>

        <div className="flex gap-3 animate-fade">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
            <Award className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800 hover:underline flex items-center gap-1.5">
              {activeAd.title}
              <ExternalLink className="h-3 w-3 text-indigo-500" />
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              {activeAd.desc}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdClick();
                }}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {activeAd.cta} →
              </button>
              <span className="text-[9px] text-slate-400 font-mono">Unreal Ads Network</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "links-row") {
    return (
      <div className="w-full bg-slate-100/50 backdrop-blur-xs border border-dashed border-slate-200 rounded-2xl p-2.5 mb-4 text-center">
        <span className="text-[8px] text-indigo-600 font-mono font-bold uppercase block mb-1.5 tracking-wider">
          {lang === "bn" ? "বিশেষ স্পন্সর লিংক" : "Sponsor Adsterra Direct Links"}
        </span>

        <div className="flex flex-wrap justify-center gap-2 animate-fade">
          {[
            lang === "bn" ? "সেরা অনলাইন ওএমআর সফটওয়্যার" : "Best OMR Software 2026",
            lang === "bn" ? "ফ্রি ওএমআর ফরম ডাউনলোড" : "Download Free OMR Form",
            lang === "bn" ? "স্মার্ট অপটিক্যাল স্ক্যানার" : "Unreal Optical Scan SDK"
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={handleAdClick}
              className="text-[10px] text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            >
              {item}
              <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Sticky bottom hover ad banner
  return (
    <div className="fixed bottom-18 left-1/2 transform -translate-x-1/2 w-[92%] max-w-md z-30 bg-indigo-950/95 backdrop-blur-lg border border-slate-700 rounded-xl p-2.5 shadow-xl transition-all">
      <div className="flex items-center justify-between text-[8px] text-indigo-300 font-mono mb-1">
        <span className="bg-indigo-600 text-white px-1 py-0.5 rounded font-semibold uppercase flex items-center gap-1">
          <Shield className="h-2 w-2" />
          {lang === "bn" ? "বিজ্ঞাপনদাতা" : "Adsterra Smartlink"}
        </span>
        <button 
          type="button"
          onClick={() => setVisible(false)}
          className="text-indigo-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 justify-between animate-fade cursor-pointer" onClick={handleAdClick}>
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-slate-200 line-clamp-1 hover:underline">
            {t.mockAdText || (lang === "bn" ? "ওএমআর শিট সঠিকভাবে স্ক্যান করার ও এআই রেজাল্ট ডাউনলোড করতে ক্লিক করুন" : "Click here to download premium OMR answer templates and guides with smart AI")}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleAdClick();
          }}
          className="bg-amber-400 hover:bg-amber-500 text-indigo-950 text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap transition-colors cursor-pointer"
        >
          {lang === "bn" ? "ক্লিক করুন" : "Click Here"}
        </button>
      </div>
    </div>
  );
};
