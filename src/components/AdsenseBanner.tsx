import React, { useState, useEffect } from "react";
import { ExternalLink, RefreshCw, X, Code } from "lucide-react";
import { Translations } from "../types";

interface AdsenseBannerProps {
  type: "top-banner" | "native-feed" | "links-row" | "sticky-bottom";
  lang: "en" | "bn";
  t: Translations;
}

export const AdsenseBanner: React.FC<AdsenseBannerProps> = ({ type, lang, t }) => {
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(true);
  const [adsenseLoaded, setAdsenseLoaded] = useState(false);

  useEffect(() => {
    try {
      // Safely try to initialize google adsense if script is on the page
      if (typeof window !== "undefined") {
        const adsbygoogle = (window as any).adsbygoogle;
        if (adsbygoogle) {
          adsbygoogle.push({});
          setAdsenseLoaded(true);
        }
      }
    } catch (e) {
      console.warn("AdSense push failed or script not loaded yet:", e);
    }
  }, [type]);

  if (!visible) return null;

  const handleAdClick = () => {
    setClicked(true);
    const sponsorUrl = "https://ai.studio/build";
    window.open(sponsorUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      setClicked(false);
    }, 4000);
  };

  const adTexts = {
    en: [
      {
        title: "Sponsor: Unreal OMR Pro Cloud",
        desc: "Evaluate 1,000+ sheets per minute with optical AI cloud grids. Secure, instant, robust.",
        cta: "Claim Free Trial"
      },
      {
        title: "Unreal Studio Creator Studio",
        desc: "Transform your Android mobile app mockups into lightweight React codebases instantly.",
        cta: "Learn More"
      },
      {
        title: "Affordable OMR Scanner Devices",
        desc: "Get certified hardware scanners directly compatible with mobile applications. 45% Off Today.",
        cta: "Shop Scanners"
      }
    ],
    bn: [
      {
        title: "স্পন্সর: আনরিয়েল ওএমআর প্রো ক্লাউড",
        desc: "অপটিক্যাল এআই ক্লাউড গ্রিডের সাহায্যে প্রতি মিনিটে ১০০০+ খাতা মূল্যায়ন করুন। সুরক্ষিত ও তাৎক্ষণিক।",
        cta: "ফ্রি ট্রায়াল নিন"
      },
      {
        title: "আনরিয়েল স্টুডিও ক্রিয়েটর স্যুট",
        desc: "আপনার অ্যান্ড্রয়েড মোবাইল অ্যাপ মকআপগুলো সহজেই রিয়্যাক্ট কোডবেজে রূপান্তর করুন।",
        cta: "বিস্তারিত দেখুন"
      },
      {
        title: "সাশ্রয়ী ওএমআর স্ক্যানার ডিভাইস",
        desc: "মোবাইলের সাথে সরাসরি ব্যবহারযোগ্য ওএমআর স্ক্যানার কিনুন ৪৫% ছাড়ে।",
        cta: "স্ক্যানার দেখুন"
      }
    ]
  };

  const currentAds = adTexts[lang];
  const activeAd = type === "top-banner" ? currentAds[0] : type === "native-feed" ? currentAds[1] : currentAds[2];

  // AdSense Mock Slots config - users can replace these easily
  const adsenseSlots = {
    "top-banner": { client: "ca-pub-XXXXXXXXXXXXXXXX", slot: "1111111111", format: "horizontal" },
    "native-feed": { client: "ca-pub-XXXXXXXXXXXXXXXX", slot: "2222222222", format: "fluid" },
    "links-row": { client: "ca-pub-XXXXXXXXXXXXXXXX", slot: "3333333333", format: "link" },
    "sticky-bottom": { client: "ca-pub-XXXXXXXXXXXXXXXX", slot: "4444444444", format: "auto" }
  };

  const currentSlot = adsenseSlots[type];

  if (type === "top-banner") {
    return (
      <div className="w-full bg-white/75 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 shadow-xs relative overflow-hidden transition-all hover:bg-white/95 mb-4 select-none">
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono tracking-wider mb-2">
          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest leading-none">
            {lang === "bn" ? "বিজ্ঞাপন" : "Adsense ready"}
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <Code className="h-2.5 w-2.5" />
            Active Unit: {currentSlot.slot}
          </span>
        </div>

        {/* Real Google AdSense Tag Wrapper */}
        <div className="adsense-real-container w-full overflow-hidden hidden" style={{ display: adsenseLoaded ? "block" : "none" }}>
          <ins 
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={currentSlot.client}
            data-ad-slot={currentSlot.slot}
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        </div>

        {/* Premium elegant Fallback fallback when adsense script is pending/not registered */}
        {!adsenseLoaded && (
          <div className="flex items-center justify-between gap-3 animate-fade">
            <div className="flex-1" onClick={handleAdClick}>
              <h4 className="text-xs font-bold text-slate-800 hover:text-indigo-600 cursor-pointer flex items-center gap-1">
                {activeAd.title}
                <ExternalLink className="h-3 w-3 text-slate-400 inline-block" />
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                {activeAd.desc}
              </p>
            </div>
            <button 
              onClick={handleAdClick}
              className="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-md shadow-xs hover:bg-indigo-700 whitespace-nowrap active:scale-95 transition-all cursor-pointer"
            >
              {activeAd.cta}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (type === "native-feed") {
    return (
      <div className="w-full bg-emerald-50/40 border border-emerald-100/80 rounded-2xl p-4 shadow-xs relative overflow-hidden transition-all hover:bg-emerald-50/60 mb-5 text-left">
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono tracking-wider mb-2">
          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm uppercase font-black text-[8px] tracking-widest leading-none">
            {lang === "bn" ? "স্পন্সরড কন্টেন্ট" : "Sponsored Feed"}
          </span>
          <span className="flex items-center gap-1 font-semibold">
            Slot: {currentSlot.slot}
          </span>
        </div>

        {/* Real AdSense In-feed Wrapper */}
        <div className="adsense-real-container w-full overflow-hidden hidden" style={{ display: adsenseLoaded ? "block" : "none" }}>
          <ins 
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={currentSlot.client}
            data-ad-slot={currentSlot.slot}
            data-ad-format="fluid"
            data-ad-layout-key="-gw-3+1f-3d+2z"
          />
        </div>

        {!adsenseLoaded && (
          <div className="flex gap-3 animate-fade">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
              <span className="font-extrabold text-[10px] text-indigo-700">Studio</span>
            </div>
            <div className="flex-1">
              <h4 
                onClick={handleAdClick}
                className="text-xs font-bold text-slate-800 hover:underline cursor-pointer flex items-center gap-1.5"
              >
                {activeAd.title}
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                {activeAd.desc}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button 
                  onClick={handleAdClick}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {activeAd.cta} →
                </button>
                <span className="text-[9px] text-slate-400 font-mono">Unreal Ads Network</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "links-row") {
    return (
      <div className="w-full bg-slate-100/50 backdrop-blur-xs border border-dashed border-slate-200 rounded-2xl p-2.5 mb-4 text-center">
        <span className="text-[8px] text-slate-400 font-mono uppercase block mb-1.5">
          {lang === "bn" ? "বিজ্ঞাপন লিংক" : "Sponsor Link Units by Adsense"}
        </span>

        {/* Real AdSense Link Unit wrapper */}
        <div className="adsense-real-container w-full overflow-hidden hidden" style={{ display: adsenseLoaded ? "block" : "none" }}>
          <ins 
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={currentSlot.client}
            data-ad-slot={currentSlot.slot}
            data-ad-format="link"
          />
        </div>

        {!adsenseLoaded && (
          <div className="flex flex-wrap justify-center gap-2 animate-fade">
            {["Best OMR Software 2026", "Download Free OMR Form", "Unreal Optical Scan SDK"].map((item, idx) => (
              <button
                key={idx}
                onClick={handleAdClick}
                className="text-[10px] text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 transition-all cursor-pointer"
              >
                {item}
                <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Sticky bottom hover ad banner
  return (
    <div className="fixed bottom-18 left-1/2 transform -translate-x-1/2 w-[92%] max-w-md z-30 bg-indigo-950/95 backdrop-blur-lg border border-slate-700 rounded-xl p-2.5 shadow-xl transition-all">
      <div className="flex items-center justify-between text-[8px] text-indigo-300 font-mono mb-1">
        <span className="bg-indigo-600 text-white px-1 py-0.5 rounded font-semibold uppercase">
          {lang === "bn" ? "অ্যাডসেন্স পপ-আপ" : "Adsense Overlap"}
        </span>
        <button 
          onClick={() => setVisible(false)}
          className="text-indigo-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Real AdSense Anchor wrapper */}
      <div className="adsense-real-container w-full overflow-hidden hidden" style={{ display: adsenseLoaded ? "block" : "none" }}>
        <ins 
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={currentSlot.client}
          data-ad-slot={currentSlot.slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {!adsenseLoaded && (
        <div className="flex items-center gap-2 justify-between animate-fade">
          <div className="flex-1" onClick={handleAdClick}>
            <p className="text-[10px] font-semibold text-slate-200 line-clamp-1 hover:underline cursor-pointer">
              {t.mockAdText}
            </p>
          </div>
          <button
            onClick={handleAdClick}
            className="bg-amber-400 hover:bg-amber-500 text-indigo-950 text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap transition-colors cursor-pointer"
          >
            {lang === "bn" ? "ক্লিক করুন" : "Click Here"}
          </button>
        </div>
      )}
    </div>
  );
};
