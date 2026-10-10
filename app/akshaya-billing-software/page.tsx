import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Wallet,
  Receipt,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Zap,
  IndianRupee,
  Smartphone,
  Banknote,
  FileText,
  Clock3,
  MessageSquare,
  Building,
  CreditCard,
  Lock,
  Phone,
  Mail,
  MapPin,
  Flame,
  Award,
  Check,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Akshaya Center Billing Software in Kerala — Thermal POS & Daybook | DenBooks",
  description:
    "Purpose-built billing and accounts software for Akshaya e-Kendras across Kerala. Isolate e-District pass-through fees, generate 58mm/80mm thermal slips, prevent cash drawer leakage, and send WhatsApp Khata reminders.",
  keywords: [
    "Akshaya billing software Kerala",
    "Akshaya center daybook app",
    "e-District Kerala fee isolation",
    "thermal printer billing software Akshaya",
    "Malappuram Akshaya POS software",
    "Kozhikode Akshaya center software",
    "Ernakulam Akshaya billing",
    "DenBooks Kerala",
  ],
  alternates: {
    canonical: "https://denbooks.in/akshaya-billing-software",
  },
  openGraph: {
    title: "Akshaya Center Billing Software in Kerala — Thermal POS & Daybook | DenBooks",
    description:
      "Purpose-built billing and accounts software for Akshaya e-Kendras across Kerala. Isolate e-District pass-through fees, 58mm/80mm thermal receipts, and counter staff PINs.",
    url: "https://denbooks.in/akshaya-billing-software",
    siteName: "DenBooks",
    images: [
      {
        url: "/brand-poster.png",
        width: 1200,
        height: 630,
        alt: "DenBooks for Akshaya Centers Kerala",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function AkshayaBillingPage() {
  const districts = [
    "Malappuram",
    "Kozhikode",
    "Kannur",
    "Kasaragod",
    "Wayanad",
    "Palakkad",
    "Thrissur",
    "Ernakulam",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Pathanamthitta",
    "Kollam",
    "Thiruvananthapuram",
  ];

  const faqs = [
    {
      q: "Why do generic accounting apps (Tally, Vyapar) fail for Kerala Akshaya Centers?",
      a: "Akshaya centers handle high-volume government fee pass-throughs (e.g. ₹1,500 for a fresh passport or ₹50 e-District revenue fee) deducted directly from your advance portal wallet, while your actual counter service charge is only ₹150–₹250. Standard apps calculate the full ₹1,750 as your shop revenue, causing misleading profit figures and complications with annual income tax audits. DenBooks strictly segregates portal wallet deductions from your actual counter take-home earnings.",
    },
    {
      q: "Does DenBooks work with 58mm and 80mm thermal printers used in Akshaya shops?",
      a: "Yes. DenBooks supports instant 58mm and 80mm roll printing, as well as A4/A5 receipts. It works right out of the box with TVS, Epson, Everycom, NGX, Posiflex, and generic USB or Bluetooth thermal printers without requiring complex third-party print drivers.",
    },
    {
      q: "Can my counter staff process applications without viewing the center's net profits?",
      a: "Yes. The staff counter interface (/staff) is secured with quick operator PINs. Counter clerks can issue customer queue tokens, generate receipts, log minor shop expenses, and print evening drawer reconciliation slips without having visibility into your owner financial balances or net monthly profit.",
    },
    {
      q: "How does the 14-day free trial work for Kerala centers?",
      a: "You can sign up and start billing immediately without entering any credit card or banking details. If you love the software, subscriptions start at just ₹125/month (annual plan) paid directly via zero-fee UPI QR.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DenBooks for Akshaya Centers",
    operatingSystem: "Web Browser, Windows, Android, iOS",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "125",
      priceCurrency: "INR",
    },
    description:
      "Purpose-built operating software for Akshaya e-Kendras across Kerala. Unifies counter billing, portal wallet tracking, and thermal receipts.",
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-cyan-400 selection:text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* TOP BAR */}
      <div className="border-b border-cyan-800/40 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 px-4 py-2 text-center text-xs text-slate-200">
        <span>⚡ Kerala Akshaya e-Kendra Special: Zero-Fee Direct UPI • 14-Day Full Free Trial</span>
      </div>

      {/* NAVBAR */}
      <nav className="border-b border-slate-800/80 bg-[#070b13]/85 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="DenBooks Logo"
              className="h-10 w-10 rounded-xl border border-cyan-500/30 object-cover shadow-lg shadow-cyan-500/25"
            />
            <span className="text-xl font-black tracking-tight text-white">DenBooks</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="text-xs font-bold text-slate-300 hover:text-cyan-300 transition hidden sm:inline"
            >
              Test Live Sandbox
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-bold text-cyan-300 mb-6">
          <Award size={14} className="text-cyan-400" />
          <span>Tailored for Kerala Akshaya e-Kendras</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Operating Software Built Specifically for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            Akshaya Centers in Kerala
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          അക്ഷയ കേന്ദ്രങ്ങളിലെ e-District, Passport, KSEB, സർവ്വകലാശാല സർവീസുകളുടെ സർക്കാർ വാലറ്റ് തുകയും യഥാർത്ഥ ഷോപ്പ് ലാഭവും തത്സമയം വേർതിരിക്കുന്ന ആദ്യത്തെ സ്മാർട്ട് ഡേബുക്ക് സിസ്റ്റം.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-cyan-300 transition shadow-xl shadow-cyan-400/30"
          >
            Start 14-Day Free Trial
          </Link>
          <a
            href="https://wa.me/917012584152?text=Hello%20DenBooks,%20I%20run%20an%20Akshaya%20Center%20in%20Kerala.%20Please%20share%20a%20demo."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-bold text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition"
          >
            <MessageSquare size={16} className="text-emerald-400" />
            <span>Chat on WhatsApp (+91 70125 84152)</span>
          </a>
        </div>

        {/* TRUST STATS */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4">
            <div className="text-2xl font-black text-cyan-400">100%</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Govt Fee Isolation</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4">
            <div className="text-2xl font-black text-emerald-400">58 & 80mm</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Instant Thermal Slips</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4">
            <div className="text-2xl font-black text-cyan-400">1-Click</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Evening Cash Tally</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4">
            <div className="text-2xl font-black text-emerald-400">₹0</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Direct UPI Gateway Fee</div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="px-4 sm:px-6 py-16 border-t border-slate-800/80 bg-[#090f1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Akshaya Workflows</h2>
            <p className="mt-2 text-3xl font-black text-white">Engineered for Daily Counter Operations</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-6">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-4">
                <Wallet size={20} />
              </div>
              <h3 className="text-base font-bold text-white">e-District & Portal Advance Wallets</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Track live balances across e-District Kerala, KSEB, MVD, and PAN wallets. Automatic low-balance warnings prevent transaction failures during peak morning rushes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4">
                <Printer size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Thermal Slips with QR Code</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Generate instant 58mm or 80mm slips with itemized breakup showing Govt Fee vs Service Charge, plus a dynamic UPI QR code for direct customer scanning.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-6">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-4">
                <Banknote size={20} />
              </div>
              <h3 className="text-base font-bold text-white">End-of-Shift Cash Drawer Tally</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Input your physical ₹500, ₹200, ₹100, and ₹50 notes at 8 PM. DenBooks compares total drawer cash with billed revenue to eliminate staff shortages instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KERALA DISTRICTS COVERAGE */}
      <section className="px-4 sm:px-6 py-14 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">
            Serving Akshaya Entrepreneurs Across All 14 Kerala Districts
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {districts.map((d, i) => (
              <span
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-200"
              >
                📍 {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-4 sm:px-6 py-16 border-t border-slate-800/80 bg-[#090f1a]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Questions & Answers</h2>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-white">Frequently Asked by Akshaya Owners</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-[#0e1625] p-5">
                <h3 className="text-sm font-bold text-white">{faq.q}</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="px-4 sm:px-6 py-16 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-[#0c1626] to-[#0f2138] p-8 sm:p-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Ready to Streamline Your Akshaya Counter?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300">
            Set up your center in under 2 minutes. 14 days full trial, zero credit card required.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-cyan-400 px-6 py-3 text-xs sm:text-sm font-black text-slate-950 hover:bg-cyan-300 transition shadow-lg shadow-cyan-400/25"
            >
              Start Free 14-Day Trial
            </Link>
            <Link
              href="/demo"
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs sm:text-sm font-bold text-slate-200 hover:border-cyan-400 transition"
            >
              Test Live Sandbox
            </Link>
          </div>
        </div>

        <div className="mt-12 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DenBooks. Engineered & Maintained by SRB Studios.</p>
          <div className="mt-2 flex justify-center gap-4 text-slate-400">
            <Link href="/" className="hover:text-cyan-400">Home</Link>
            <Link href="/terms" className="hover:text-cyan-400">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-cyan-400">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-cyan-400">Refund Policy</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
