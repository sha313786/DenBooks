"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Mic,
  MicOff,
  CheckCircle2,
  Printer,
  Wallet,
  Banknote,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Award,
  Copy,
  Check,
  FileText,
  Clock,
} from "lucide-react";

export default function PromoVideoPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [aspectRatio, setAspectRatio] = useState<"vertical" | "horizontal">("vertical");
  const [lang, setLang] = useState<"ml" | "en">("ml");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const durationMs = 60000; // Exactly 60 seconds (1 minute)
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Full scene voiceover narration scripts (1 Minute Timeline)
  const voiceoverScripts = [
    {
      scene: 1,
      time: "0:00 - 0:12",
      title: "The Hook",
      ml: "അക്ഷയ, സി.എസ്.സി, സൈബർ കഫേ നടത്തുന്നവരാണോ? രാത്രി ഷോപ്പ് അടക്കുമ്പോൾ ഡേബുക്ക് കണക്കുകൾ കൂട്ടിമുട്ടിക്കാൻ നിങ്ങൾ ബുദ്ധിമുട്ടാറുണ്ടോ?",
      en: "Are you running an Akshaya or CSC center? Every evening at 8 PM, do you struggle to balance your daybook accounts and cash drawer?",
    },
    {
      scene: 2,
      time: "0:12 - 0:25",
      title: "The Big Problem",
      ml: "ഒരു പാസ്‌പോർട്ട് അല്ലെങ്കിൽ ഇ-ഡിസ്ട്രിക്റ്റ് അപേക്ഷ നോക്കൂ: കസ്റ്റമർ തന്ന 1,750 രൂപയിൽ 1,500 രൂപയും സർക്കാർ വാലറ്റിലേക്കാണ് പോകുന്നത്. സാധാരണ ആപ്പുകൾ മുഴുവൻ തുകയും നിങ്ങളുടെ വരുമാനമായി കണ്ട് അക്കൗണ്ട് തകിടം മറിക്കുന്നു!",
      en: "Take a Passport application: the customer pays 1,750 rupees. But 1,500 rupees is immediately deducted from your government portal wallet! Standard retail software counts all 1,750 as your shop revenue, ruining your tax and profit records.",
    },
    {
      scene: 3,
      time: "0:25 - 0:38",
      title: "The DenBooks Solution & Thermal POS",
      ml: "ഇവിടെയാണ് ഡെൻബുക്സ് വരുന്നത്. ഒറ്റ ക്ലിക്കിൽ ഗവൺമെന്റ് വാലറ്റ് ഫീസ് വേർതിരിച്ച് നിങ്ങളുടെ യഥാർത്ഥ 250 രൂപ ലാഭം കൃത്യമായി രേഖപ്പെടുത്താം. ഒപ്പം 58mm, 80mm തെർമൽ പ്രിന്ററിൽ ക്ലീൻ റെസീപ്റ്റും പ്രിന്റ് ചെയ്യാം.",
      en: "DenBooks solves this in one click. Government wallet deductions are automatically isolated from your real 250 rupees service fee. Plus, generate instant 58mm and 80mm thermal receipts with payment QR codes!",
    },
    {
      scene: 4,
      time: "0:38 - 0:50",
      title: "Cash Drawer & WhatsApp Khata",
      ml: "ഷോപ്പ് ക്ലോസ് ചെയ്യുമ്പോൾ കൗണ്ടറിലെ നോട്ടുകളുടെ എണ്ണം നിമിഷങ്ങൾക്കുള്ളിൽ ഒത്തുനോക്കൂ. സ്റ്റാഫ് പിൻ ബില്ലിംഗ് സെക്യൂരിറ്റിയും, മറന്നുപോയ കടങ്ങൾക്ക് ഒറ്റ ക്ലിക്കിൽ വാട്സാപ്പ് ഓർമ്മപ്പെടുത്തലും ഡെൻബുക്സ് നൽകുന്നു.",
      en: "At closing time, count your 500, 200, and 100 rupee notes in seconds. Reconcile physical drawer cash against billed revenue, protect master profits with staff operator PINs, and send one-click WhatsApp reminders for pending customer credit.",
    },
    {
      scene: 5,
      time: "0:50 - 1:00",
      title: "Call to Action",
      ml: "ഇന്ന് തന്നെ നിങ്ങളുടെ സെന്റർ ഡിജിറ്റലാക്കൂ. 14 ദിവസത്തെ പൂർണ്ണ സൗജന്യ ട്രയലിനായി denbooks.in സന്ദർശിക്കൂ. വാട്സാപ്പ് ഹെൽപ്പ്‌ലൈൻ: +91 70125 84152.",
      en: "Transform your citizen counter today. Get started with a full 14-day free trial on denbooks.in. Zero credit card needed. Contact our team on WhatsApp today!",
    },
  ];

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
      // AudioContext restricted
    }
  };

  // Trigger Native Browser Voiceover Speech Synthesis
  const speakScene = useCallback((sceneIndex: number, targetLang: "ml" | "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (!voiceoverEnabled) return;

    const textToSpeak = voiceoverScripts[sceneIndex]?.[targetLang];
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = targetLang === "ml" ? 0.95 : 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (targetLang === "ml") {
      const mlVoice = voices.find(v => v.lang.startsWith("ml") || v.lang.includes("Malayalam"));
      if (mlVoice) {
        utterance.voice = mlVoice;
      } else {
        const inVoice = voices.find(v => v.lang === "en-IN" || v.lang.includes("hi-IN"));
        if (inVoice) utterance.voice = inVoice;
      }
    } else {
      const enVoice = voices.find(v => v.lang === "en-IN" || v.lang.includes("en-IN") || v.lang.includes("en_IN"));
      if (enVoice) utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [voiceoverEnabled, voiceoverScripts]);

  // Timeline driver for exactly 60 seconds (60,000 ms)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            return 100;
          }
          const next = prev + (100 / (durationMs / 100));
          return next > 100 ? 100 : next;
        });
      }, 100);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, durationMs]);

  // Scene Mapping across 60 seconds:
  // Scene 0: 0% - 20% (0s - 12s) - The Hook
  // Scene 1: 20% - 42% (12s - 25s) - The Problem
  // Scene 2: 42% - 64% (25s - 38s) - Solution & Thermal POS
  // Scene 3: 64% - 84% (38s - 50s) - Cash Drawer & Khata
  // Scene 4: 84% - 100% (50s - 60s) - CTA
  useEffect(() => {
    let scene = 0;
    if (progress < 20) scene = 0;
    else if (progress < 42) scene = 1;
    else if (progress < 64) scene = 2;
    else if (progress < 84) scene = 3;
    else scene = 4;

    if (scene !== currentScene) {
      setCurrentScene(scene);
      playSound(scene === 2 ? 650 : scene === 4 ? 800 : 440, "triangle", 0.2);
      if (isPlaying) {
        speakScene(scene, lang);
      }
    }
  }, [progress, currentScene, isPlaying, lang, speakScene]);

  // Language switch triggers voiceover in new language
  const handleLanguageChange = (newLang: "ml" | "en") => {
    setLang(newLang);
    if (isPlaying) {
      speakScene(currentScene, newLang);
    }
  };

  const handleRestart = () => {
    setProgress(0);
    setCurrentScene(0);
    setIsPlaying(true);
    playSound(520, "sine", 0.15);
    speakScene(0, lang);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
  };

  const copyFullScript = () => {
    const fullText = voiceoverScripts
      .map((s) => `[${s.time}] ${s.title}:\n${lang === "ml" ? s.ml : s.en}`)
      .join("\n\n");
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const currentSeconds = Math.round((progress / 100) * 60);

  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* HEADER BAR */}
      <header className="border-b border-slate-800/80 bg-[#070b13]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between z-30">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="DenBooks Logo" className="h-8 w-8 rounded-lg border border-cyan-500/30 object-cover" />
          <span className="text-lg font-black tracking-tight text-white">DenBooks</span>
          <span className="rounded-full bg-cyan-950/80 border border-cyan-700/60 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
            60s PROMO REEL
          </span>
        </Link>

        {/* Video Mode Controls */}
        <div className="flex items-center gap-2">
          {/* Voiceover Toggle */}
          <button
            onClick={() => {
              const next = !voiceoverEnabled;
              setVoiceoverEnabled(next);
              if (next) speakScene(currentScene, lang);
              else if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              voiceoverEnabled
                ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-xs shadow-emerald-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
            title="Toggle Voiceover Audio"
          >
            {voiceoverEnabled ? <Mic size={14} className="text-emerald-400 animate-pulse" /> : <MicOff size={14} />}
            <span className="hidden sm:inline">{voiceoverEnabled ? "Voice: ON" : "Voice: OFF"}</span>
          </button>

          {/* Language Toggle */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-0.5 text-xs font-bold">
            <button
              onClick={() => handleLanguageChange("ml")}
              className={`px-2.5 py-1 rounded-lg transition ${lang === "ml" ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              മലയാളം
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
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

          {/* Sound FX Toggle */}
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
              ? "w-full max-w-[400px] aspect-[9/16] max-h-[84vh]"
              : "w-full max-w-4xl aspect-[16/9]"
          }`}
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/25 via-[#070d18] to-black" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,220,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,220,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* SCENE 0: HOOK & LOGO REVEAL (0s - 12s) */}
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

              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/70 px-3.5 py-1 text-xs font-bold text-cyan-300 mb-3">
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
                  ? "അക്ഷയ, CSC, സൈബർ കഫേകൾക്കായി പ്രത്യേകം തയ്യാറാക്കിയ സ്മാർട്ട് ഓപ്പറേറ്റിംഗ് സിസ്റ്റം."
                  : "Every evening at 8 PM, do you struggle to balance your advance wallets and cash drawer?"}
              </p>
            </div>
          )}

          {/* SCENE 1: THE CORE PROBLEM (12s - 25s) */}
          {currentScene === 1 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/50 px-3.5 py-1 text-xs font-bold text-red-300 mb-4">
                <span>❌ സാധാരണ ആപ്പുകളുടെ വലിയ പിഴവ്</span>
              </div>

              <div className="w-full max-w-xs rounded-2xl border border-red-500/30 bg-[#120a10] p-4 text-left shadow-lg shadow-red-950/50 mb-4">
                <div className="text-xs font-bold text-red-400 uppercase tracking-wider">പാസ്‌പോർട്ട് അപേക്ഷ (Passport Application)</div>
                <div className="mt-2 text-2xl font-black text-white">₹1,750 <span className="text-xs text-slate-400 font-normal">കസ്റ്റമർ നൽകിയത്</span></div>
                <div className="mt-2 border-t border-red-900/50 pt-2 text-xs space-y-1.5">
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

              <p className="text-xs sm:text-sm text-slate-200 font-bold max-w-xs leading-relaxed">
                {lang === "ml"
                  ? "Tally / Vyapar മുഴുവൻ ₹1,750 നിങ്ങളുടെ വരുമാനമായി കണക്കാക്കി ഇൻകം ടാക്സും ലാഭവും തെറ്റിക്കുന്നു!"
                  : "Standard billing apps count all ₹1,750 as shop profit, destroying your income tax and true profit records!"}
              </p>
            </div>
          )}

          {/* SCENE 2: THE DENBOOKS SOLUTION & THERMAL POS (25s - 38s) */}
          {currentScene === 2 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-3.5 py-1 text-xs font-bold text-emerald-300 mb-3">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>DENBOOKS വഴി 1-ക്ലിക്കിൽ വേർതിരിക്കാം</span>
              </div>

              {/* Thermal Slip Mockup */}
              <div className="w-full max-w-[270px] rounded-2xl border border-cyan-400/40 bg-white text-slate-900 p-4 text-left shadow-2xl shadow-cyan-400/20 transform hover:scale-105 transition">
                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                  <div className="text-xs font-black tracking-tight">AKSHAYA E-KENDRA</div>
                  <div className="text-[9px] text-slate-500 font-mono">Token #42 • 58mm & 80mm Slip</div>
                </div>
                <div className="py-2 text-[10px] space-y-1.5 font-mono">
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
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    ✓ Wallet Isolated Automatically
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-cyan-300 font-bold max-w-xs leading-relaxed">
                {lang === "ml"
                  ? "58mm / 80mm തെർമൽ പ്രിന്ററിൽ ക്ലീൻ റെസീപ്റ്റും UPI QR കോഡും ഒപ്പം ലഭിക്കുന്നു!"
                  : "Instant 58mm & 80mm thermal slips with itemized government fee separation and payment QR!"}
              </p>
            </div>
          )}

          {/* SCENE 3: CASH DRAWER & WHATSAPP KHATA (38s - 50s) */}
          {currentScene === 3 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-4">
                <div className="rounded-2xl border border-cyan-400/30 bg-[#0e1625] p-3 text-left">
                  <Banknote size={22} className="text-cyan-400 mb-1" />
                  <div className="text-[11px] font-bold text-white">Cash Drawer Tally</div>
                  <div className="text-[9px] text-slate-400 mt-1">₹500 x 10, ₹200 x 5 = ₹6,000 കൃത്യമായി ഒത്തുനോക്കാം.</div>
                </div>
                <div className="rounded-2xl border border-emerald-400/30 bg-[#0c1a16] p-3 text-left">
                  <MessageSquare size={22} className="text-emerald-400 mb-1" />
                  <div className="text-[11px] font-bold text-white">WhatsApp Khata</div>
                  <div className="text-[9px] text-slate-400 mt-1">ബാക്കി തുകയുള്ള കസ്റ്റമേഴ്സിന് 1-ക്ലിക്കിൽ വാട്സാപ്പ് ഓർമ്മപ്പെടുത്തൽ.</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2 text-xs font-bold text-slate-200">
                🔒 സ്റ്റാഫിന് മെയിൻ ലാഭം കാണാതെ PIN ബില്ലിംഗ് സെക്യൂരിറ്റി
              </div>

              <p className="mt-3 text-xs sm:text-sm text-slate-200 font-medium max-w-xs leading-relaxed">
                {lang === "ml"
                  ? "കൗണ്ടറിലെ ക്യാഷ് ചോർച്ചയും മറന്നുപോയ കടങ്ങളും ഇല്ലാതാക്കൂ!"
                  : "Eliminate cash drawer shortages, protect owner profits with staff PINs, and recover customer credit!"}
              </p>
            </div>
          )}

          {/* SCENE 4: CALL TO ACTION (50s - 60s) */}
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
                  ? "14 ദിവസത്തെ പൂർണ്ണ സൗജന്യ ട്രയൽ ഇപ്പോൾ തന്നെ പരീക്ഷിക്കൂ!"
                  : "Start Your 14-Day Full Free Trial Today!"}
              </p>

              <div className="mt-4 space-y-2 w-full max-w-xs">
                <div className="rounded-xl bg-cyan-400 py-3 text-center text-xs font-black text-slate-950 shadow-lg shadow-cyan-400/30">
                  👉 https://denbooks.in
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  ക്രെഡിറ്റ് കാർഡ് ആവശ്യമില്ല • സീറോ ഗേറ്റ്‌വേ ചാർജ്ജ്
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-bold">
                <MessageSquare size={14} />
                <span>WhatsApp: +91 70125 84152</span>
              </div>
            </div>
          )}

          {/* VOICE OVER SUBTITLES BANNER */}
          <div className="absolute top-3 left-3 right-3 p-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-200 flex items-start gap-2 shadow-lg z-20">
            <Mic size={14} className={`shrink-0 mt-0.5 ${voiceoverEnabled ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
            <div className="flex-1 line-clamp-2 leading-relaxed">
              <span className="font-bold text-cyan-300 mr-1.5">[VOICEOVER]</span>
              {voiceoverScripts[currentScene]?.[lang]}
            </div>
          </div>

          {/* PROGRESS TIMELINE OVERLAY */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-1.5 z-20">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300">
              <span className="text-cyan-400">
                SCENE {currentScene + 1}/5: {voiceoverScripts[currentScene]?.title.toUpperCase()}
              </span>
              <span className="text-emerald-300 font-bold">{currentSeconds}s / 60s (1 MIN)</span>
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

        {/* BOTTOM VIDEO CONTROLS */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-lg">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Pause 60s Reel" : "Play 60s Reel"}</span>
          </button>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-cyan-400 transition"
          >
            <RotateCcw size={14} />
            <span>Restart</span>
          </button>

          <button
            onClick={() => setShowScriptModal(!showScriptModal)}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:border-cyan-400 transition"
          >
            <FileText size={14} />
            <span>View 1-Min Script</span>
          </button>

          <Link
            href="/signup"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:border-emerald-400 transition"
          >
            <span>Visit App</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 1-MINUTE SCRIPT & RECORDING INSTRUCTIONS */}
        {showScriptModal && (
          <div className="mt-6 w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0e1625] p-5 shadow-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 font-bold text-white">
                <Clock size={16} className="text-cyan-400" />
                <span>Full 60-Second Voiceover Script ({lang === "ml" ? "മലയാളം" : "English"})</span>
              </div>
              <button
                onClick={copyFullScript}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/40 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-400/20"
              >
                {copiedScript ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedScript ? "Copied!" : "Copy Script"}</span>
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {voiceoverScripts.map((s, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 mb-1">
                    <span>SCENE {s.scene}: {s.title}</span>
                    <span className="font-mono text-slate-400">{s.time}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {lang === "ml" ? s.ml : s.en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN RECORDING INSTRUCTIONS CARD */}
        <div className="mt-6 w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0b101c] p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
            <Smartphone size={14} />
            <span>How to Record & Share on WhatsApp / Instagram:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
            <li>Ensure <strong>"Voice: ON"</strong> is enabled at the top right to hear the automated voiceover narration.</li>
            <li>Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Win + Alt + R</kbd> on your keyboard to start recording your screen.</li>
            <li>Click <strong>"Restart"</strong> above to play the full 60-second video with real-time speech.</li>
            <li>Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Win + Alt + R</kbd> to finish. The MP4 video is ready in your Videos folder!</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
