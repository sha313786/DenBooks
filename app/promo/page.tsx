"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Share2,
  CheckCircle2,
  Printer,
  Wallet,
  Banknote,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";

export default function PromoVideoPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [aspectRatio, setAspectRatio] = useState<"vertical" | "horizontal">("vertical");
  const [lang, setLang] = useState<"ml" | "en">("ml");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);

  const durationMs = 36000; // 36 seconds promo reel
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle web audio sound effects
  const playSound = (freq: number, type: OscillatorType = "sine", duration: number = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext might be restricted
    }
  };

  // Timeline driver
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = prev + (100 / (durationMs / 100));
          return next > 100 ? 100 : next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, durationMs]);

  // Scene Mapping (0 to 100%)
  // Scene 0: 0% - 20% (The Hook & Brand)
  // Scene 1: 20% - 45% (The Big Problem: Pass-Through Fee Confusion)
  // Scene 2: 45% - 70% (The Solution: DenBooks Isolation & Thermal POS)
  // Scene 3: 70% - 90% (Cash Drawer & WhatsApp Khata)
  // Scene 4: 90% - 100% (Call to Action & Trial)
  useEffect(() => {
    let scene = 0;
    if (progress < 20) scene = 0;
    else if (progress < 45) scene = 1;
    else if (progress < 70) scene = 2;
    else if (progress < 90) scene = 3;
    else scene = 4;

    if (scene !== currentScene) {
      setCurrentScene(scene);
      playSound(scene === 2 ? 650 : scene === 4 ? 800 : 440, "triangle", 0.2);
    }
  }, [progress, currentScene]);

  const handleRestart = () => {
    setProgress(0);
    setCurrentScene(0);
    setIsPlaying(true);
    playSound(520, "sine", 0.15);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
  };

  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* HEADER BAR */}
      <header className="border-b border-slate-800/80 bg-[#070b13]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between z-30">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="DenBooks Logo" className="h-8 w-8 rounded-lg border border-cyan-500/30 object-cover" />
          <span className="text-lg font-black tracking-tight text-white">DenBooks</span>
          <span className="rounded-full bg-cyan-950/80 border border-cyan-700/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
            PROMO REEL
          </span>
        </Link>

        {/* Video Mode Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-0.5 text-xs font-bold">
            <button
              onClick={() => setLang("ml")}
              className={`px-2.5 py-1 rounded-lg transition ${lang === "ml" ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              മലയാളം
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-lg transition ${lang === "en" ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              English
            </button>
          </div>

          {/* Ratio Toggle */}
          <div className="hidden sm:flex items-center rounded-xl border border-slate-800 bg-slate-900 p-0.5 text-xs font-bold">
            <button
              onClick={() => setAspectRatio("vertical")}
              className={`p-1.5 rounded-lg transition ${aspectRatio === "vertical" ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
              title="9:16 Vertical Reel (Instagram / WhatsApp)"
            >
              <Smartphone size={16} />
            </button>
            <button
              onClick={() => setAspectRatio("horizontal")}
              className={`p-1.5 rounded-lg transition ${aspectRatio === "horizontal" ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
              title="16:9 Widescreen (YouTube / PC)"
            >
              <Monitor size={16} />
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border border-slate-800 transition ${soundEnabled ? "bg-cyan-950 text-cyan-300 border-cyan-700" : "bg-slate-900 text-slate-400"}`}
            title={soundEnabled ? "Mute Sfx" : "Enable Sound Effects"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
        {/* VIDEO FRAME */}
        <div
          className={`relative overflow-hidden rounded-3xl border-2 border-cyan-500/30 bg-[#070d18] shadow-2xl shadow-cyan-500/10 transition-all duration-300 ${
            aspectRatio === "vertical"
              ? "w-full max-w-[390px] aspect-[9/16] max-h-[85vh]"
              : "w-full max-w-4xl aspect-[16/9]"
          }`}
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/25 via-[#070d18] to-black" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,220,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* SCENE 0: HOOK & LOGO REVEAL (0 - 20%) */}
          {currentScene === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
                <img
                  src="/logo.png"
                  alt="DenBooks"
                  className="relative h-24 w-24 rounded-2xl border-2 border-cyan-400/60 shadow-2xl shadow-cyan-400/40 object-cover"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/70 px-3 py-1 text-xs font-bold text-cyan-300 mb-3">
                <Sparkles size={13} className="text-cyan-400 animate-spin" />
                <span>AKSHAYA & CSC OPERATING SUITE</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {lang === "ml"
                  ? "വൈകുന്നേരത്തെ ഡേബുക്ക് കണക്കുകൂട്ടൽ മടുത്തോ?"
                  : "Tired of evening CSC daybook calculations?"}
              </h1>

              <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xs leading-relaxed">
                {lang === "ml"
                  ? "അക്ഷയ, CSC സെന്ററുകൾക്കായി നിർമ്മിച്ച ഒരേയൊരു സ്മാർട്ട് സോഫ്റ്റ്‌വെയർ."
                  : "The first operating software designed specifically for citizen service hubs."}
              </p>
            </div>
          )}

          {/* SCENE 1: THE CORE PROBLEM (20 - 45%) */}
          {currentScene === 1 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/50 px-3 py-1 text-xs font-bold text-red-300 mb-4">
                <span>❌ സാധാരണ ആപ്പുകളുടെ വലിയ പിഴവ്</span>
              </div>

              <div className="w-full max-w-xs rounded-2xl border border-red-500/30 bg-[#120a10] p-4 text-left shadow-lg shadow-red-950/50 mb-4">
                <div className="text-xs font-bold text-red-400 uppercase tracking-wider">പാസ്‌പോർട്ട് അപേക്ഷ (Passport Fee)</div>
                <div className="mt-2 text-2xl font-black text-white">₹1,750 <span className="text-xs text-slate-400 font-normal">കസ്റ്റമർ നൽകിയത്</span></div>
                <div className="mt-2 border-t border-red-900/50 pt-2 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>ഗവൺമെന്റ് വാലറ്റ് ചാർജ്:</span>
                    <span className="font-bold text-red-300">-₹1,500</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>യഥാർത്ഥ ഷോപ്പ് ലാഭം:</span>
                    <span className="font-bold text-emerald-400">₹250</span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 font-bold max-w-xs">
                {lang === "ml"
                  ? "Tally / Vyapar ഇതിനെ ₹1,750 മുഴുവൻ നിങ്ങളുടെ വരുമാനമായി കണക്കാക്കുന്നു!"
                  : "Standard billing apps count all ₹1,750 as your shop revenue, breaking your income tax and real profit records."}
              </p>
            </div>
          )}

          {/* SCENE 2: THE DENBOOKS SOLUTION & THERMAL POS (45 - 70%) */}
          {currentScene === 2 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-3 py-1 text-xs font-bold text-emerald-300 mb-3">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>DENBOOKS വഴി 1-ക്ലിക്കിൽ വേർതിരിക്കാം</span>
              </div>

              {/* Thermal Slip Mockup */}
              <div className="w-full max-w-[260px] rounded-2xl border border-cyan-400/40 bg-white text-slate-900 p-4 text-left shadow-2xl shadow-cyan-400/20 transform hover:scale-105 transition">
                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                  <div className="text-xs font-black tracking-tight">AKSHAYA E-KENDRA</div>
                  <div className="text-[9px] text-slate-500">Token #42 • 58mm Thermal Receipt</div>
                </div>
                <div className="py-2 text-[10px] space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Pass-Through Govt Fee:</span>
                    <span className="font-bold">₹1,500.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Net Shop Service Fee:</span>
                    <span>₹250.00</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 flex justify-between font-black text-xs">
                    <span>TOTAL BILLED:</span>
                    <span>₹1,750.00</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-dashed border-slate-300 text-center">
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    ✓ Wallet Isolated Automatically
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-cyan-300 font-bold max-w-xs">
                {lang === "ml"
                  ? "58mm / 80mm പ്രിന്ററിൽ തത്സമയം ക്ലീൻ തെർമൽ സ്ലിപ്പ് ലഭിക്കും!"
                  : "Instant 58mm & 80mm thermal slips with isolated wallet breakdown!"}
              </p>
            </div>
          )}

          {/* SCENE 3: CASH DRAWER & WHATSAPP KHATA (70 - 90%) */}
          {currentScene === 3 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-4">
                <div className="rounded-2xl border border-cyan-400/30 bg-[#0e1625] p-3 text-left">
                  <Banknote size={20} className="text-cyan-400 mb-1" />
                  <div className="text-[11px] font-bold text-white">Cash Drawer Tally</div>
                  <div className="text-[9px] text-slate-400 mt-1">₹500 x 10, ₹200 x 5 = ₹6,000 കൃത്യമായി ഒത്തുനോക്കാം.</div>
                </div>
                <div className="rounded-2xl border border-emerald-400/30 bg-[#0c1a16] p-3 text-left">
                  <MessageSquare size={20} className="text-emerald-400 mb-1" />
                  <div className="text-[11px] font-bold text-white">WhatsApp Khata</div>
                  <div className="text-[9px] text-slate-400 mt-1">ബാക്കി തുകയുള്ള കസ്റ്റമേഴ്സിന് 1-ക്ലിക്കിൽ വാട്സാപ്പ് ഓർമ്മപ്പെടുത്തൽ.</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2 text-xs font-bold text-slate-200">
                🔒 സ്റ്റാഫിന് മെയിൻ പ്രോഫിറ്റ് കാണാതെ PIN ബില്ലിംഗ് മോഡ്
              </div>

              <p className="mt-3 text-xs sm:text-sm text-slate-200 font-medium max-w-xs">
                {lang === "ml"
                  ? "കൗണ്ടറിലെ ക്യാഷ് ചോർച്ചയും മറന്നുപോയ കടങ്ങളും ഇല്ലാതാക്കൂ!"
                  : "Eliminate cash register leakage and forgotten credit balances."}
              </p>
            </div>
          )}

          {/* SCENE 4: CALL TO ACTION (90 - 100%) */}
          {currentScene === 4 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="relative mb-3">
                <img src="/logo.png" alt="DenBooks" className="h-16 w-16 rounded-xl border border-cyan-400 object-cover shadow-xl shadow-cyan-400/30" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">
                DenBooks 🚀
              </h2>

              <p className="mt-1 text-xs text-cyan-300 font-bold">
                {lang === "ml"
                  ? "ഇന്ന് തന്നെ സൗജന്യമായി ട്രയൽ ചെയ്തു നോക്കൂ!"
                  : "Start Your 14-Day Full Free Trial Today!"}
              </p>

              <div className="mt-4 space-y-2 w-full max-w-xs">
                <div className="rounded-xl bg-cyan-400 py-3 text-center text-xs font-black text-slate-950 shadow-lg shadow-cyan-400/30">
                  👉 https://denbooks.in
                </div>
                <div className="text-[10px] text-slate-400">
                  ക്രെഡിറ്റ് കാർഡ് ആവശ്യമില്ല • സീറോ ഗേറ്റ്‌വേ ചാർജ്ജ്
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-bold">
                <MessageSquare size={13} />
                <span>WhatsApp: +91 70125 84152</span>
              </div>
            </div>
          )}

          {/* PROGRESS TIMELINE OVERLAY */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-1.5 z-20">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300">
              <span className="text-cyan-400">
                SCENE {currentScene + 1}/5:{" "}
                {currentScene === 0 ? "INTRO" : currentScene === 1 ? "PROBLEM" : currentScene === 2 ? "SOLUTION" : currentScene === 3 ? "FEATURES" : "GET STARTED"}
              </span>
              <span>{Math.round((progress / 100) * 36)}s / 36s</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleScrub}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* BOTTOM VIDEO CONTROLS & SCREEN RECORD GUIDE */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Pause Video" : "Play Reel"}</span>
          </button>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-cyan-400 transition"
          >
            <RotateCcw size={14} />
            <span>Restart</span>
          </button>

          <Link
            href="/signup"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:border-emerald-400 transition"
          >
            <span>Visit App</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* SCREEN RECORDING INSTRUCTIONS CARD */}
        <div className="mt-6 w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b101c] p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
            <Smartphone size={14} />
            <span>How to Record & Share on WhatsApp / Instagram:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
            <li>On Windows, press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Win + Alt + R</kbd> to start recording your screen.</li>
            <li>Click <strong>"Restart"</strong> above to play the 36-second reel in full.</li>
            <li>Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Win + Alt + R</kbd> again to stop and save your MP4 video!</li>
            <li>Upload directly to WhatsApp Status, Groups, or Instagram Reels!</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
