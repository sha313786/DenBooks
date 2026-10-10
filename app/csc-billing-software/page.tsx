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
  title: "CSC Digital Seva Billing Software — VLE Daybook & Thermal POS | DenBooks",
  description:
    "All-in-one billing and daybook software for CSC Digital Seva Kendras and Cyber Cafés across India. Pass-through portal wallet separation, 58mm/80mm thermal receipts, DigiPay cash tracking, and evening drawer tally.",
  keywords: [
    "CSC billing software India",
    "CSC Digital Seva daybook app",
    "CSC VLE accounts software",
    "Cyber Cafe thermal billing",
    "DigiPay cash drawer tally",
    "CSC wallet balance tracking",
    "DenBooks CSC software",
  ],
  alternates: {
    canonical: "https://denbooks.in/csc-billing-software",
  },
  openGraph: {
    title: "CSC Digital Seva Billing Software — VLE Daybook & Thermal POS | DenBooks",
    description:
      "All-in-one billing and daybook software for CSC Digital Seva Kendras and Cyber Cafés across India. Isolate wallet fees from shop profit and print instant thermal slips.",
    url: "https://denbooks.in/csc-billing-software",
    siteName: "DenBooks",
    images: [
      {
        url: "/brand-poster.png",
        width: 1200,
        height: 630,
        alt: "DenBooks for CSC Digital Seva Kendras",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function CscBillingPage() {
  const faqs = [
    {
      q: "How does DenBooks handle pass-through portal wallet fees for CSC VLEs?",
      a: "When a customer comes for a Passport application (₹1,500 govt fee + ₹250 your service fee), standard accounting apps record the full ₹1,750 as your shop revenue. This inflates your turnover and distorts tax accounting. DenBooks automatically records ₹1,500 as wallet pass-through and ₹250 as your real shop profit.",
    },
    {
      q: "Does it work with DigiPay cash deposits and withdrawals?",
      a: "Yes. DenBooks tracks counter cash flow so DigiPay cash payouts (giving physical cash to citizens) and BBPS utility bill collections match your evening cash drawer balance down to the last rupee.",
    },
    {
      q: "Can I print receipts on my existing 58mm or 80mm thermal printer?",
      a: "Yes. DenBooks works over standard browser printing with all ESC/POS thermal printers (TVS, NGX, Epson, Everycom, Bluetooth and USB printers) with zero third-party software installations.",
    },
    {
      q: "Can I manage multiple counter clerks or branch kiosks?",
      a: "Yes. The Pro Hub and Multi-Branch plans support multiple operator logins secured by PINs. Staff can issue receipts and log tokens without access to your master bank balance or owner profits.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DenBooks for CSC Kendras",
    operatingSystem: "Web Browser, Windows, Android, iOS",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "125",
      priceCurrency: "INR",
    },
    description:
      "Operating suite for CSC Digital Seva Kendras and Cyber Cafés in India. Daybook accounting, thermal slips, and cash drawer reconciliation.",
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-cyan-400 selection:text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* TOP BAR */}
      <div className="border-b border-cyan-800/40 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 px-4 py-2 text-center text-xs text-slate-200">
        <span>🇮🇳 CSC Digital Seva Special: 14-Day Free Trial • 0% UPI Gateway Markup • 58mm/80mm Ready</span>
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
          <span>Purpose-Built for CSC VLEs Across India</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Smart Daybook & Thermal Billing for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            CSC Digital Seva Kendras
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop calculating wallet fees on paper at night. DenBooks isolates CSC portal wallet deductions from your actual shop service charge, tracks DigiPay cash, and tallies your cash drawer in 1 click.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-cyan-300 transition shadow-xl shadow-cyan-400/30"
          >
            Start 14-Day Free Trial
          </Link>
          <a
            href="https://wa.me/917012584152?text=Hello%20DenBooks,%20I%20run%20a%20CSC%20Digital%20Seva%20Kendra.%20Please%20share%20a%20demo."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-bold text-slate-200 hover:border-emerald-500 hover:text-emerald-400 transition"
          >
            <MessageSquare size={16} className="text-emerald-400" />
            <span>Chat on WhatsApp (+91 70125 84152)</span>
          </a>
        </div>

        {/* TRUST METRICS */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4">
            <div className="text-2xl font-black text-cyan-400">Zero</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Wallet Fee Confusion</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4">
            <div className="text-2xl font-black text-emerald-400">Instant</div>
            <div className="text-xs text-slate-300 font-medium mt-1">58mm & 80mm Slips</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4">
            <div className="text-2xl font-black text-cyan-400">PIN Locked</div>
            <div className="text-xs text-slate-300 font-medium mt-1">Staff Counter Security</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-4">
            <div className="text-2xl font-black text-emerald-400">1-Click</div>
            <div className="text-xs text-slate-300 font-medium mt-1">WhatsApp Khata Alerts</div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="px-4 sm:px-6 py-16 border-t border-slate-800/80 bg-[#090f1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">CSC Workflow Suite</h2>
            <p className="mt-2 text-3xl font-black text-white">Built for High-Volume Citizen Counters</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-6">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-4">
                <Wallet size={20} />
              </div>
              <h3 className="text-base font-bold text-white">CSC Digital Seva Wallet Isolation</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Seamlessly separates portal advance deductions from your actual counter take-home earnings so your tax accounting and net profit remain 100% accurate.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4">
                <Printer size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Clean Thermal Customer Slips</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Generate professional receipts with your center name, GSTIN (optional), token number, service details, and an instant UPI QR for counter payments.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0e1625] p-6">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-4">
                <Banknote size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Daily Cash Drawer Reconciliation</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Enter your physical note tally at the end of the day. DenBooks verifies cash drawer balance against daybook collections to eliminate staff discrepancies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-4 sm:px-6 py-16 border-t border-slate-800/80 bg-[#090f1a]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Questions & Answers</h2>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-white">Frequently Asked by CSC VLEs</p>
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
            Ready to Take Control of Your CSC Accounts?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300">
            Join hundreds of citizen service centers simplifying their daybook accounting.
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
