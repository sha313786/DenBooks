import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle, Scale, Building, Mail, MapPin } from "lucide-react";

export const metadata = {
  title: "Terms of Service | DenBooks 360",
  description: "Terms and conditions governing the use of DenBooks 360 platform, subscription billing, and multi-tenant services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 selection:bg-cyan-400 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070b13]/85 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 font-black text-slate-950 shadow-md shadow-cyan-500/20">
              D
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-cyan-400 transition">
                DenBooks <span className="text-cyan-400">360</span>
              </span>
              <span className="block text-[9px] uppercase font-mono font-bold tracking-widest text-slate-500">
                Legal & Compliance
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition"
          >
            <ArrowLeft size={13} />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full mb-3">
            <Scale size={13} />
            <span>Statutory Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-mono">
            Last Updated: October 2026 • Compliant with Information Technology Act, 2000 & Consumer Protection (E-Commerce) Rules, 2020 (India)
          </p>
        </div>

        {/* Content Card */}
        <div className="space-y-8 rounded-3xl border border-slate-800 bg-[#0d1424] p-6 sm:p-10 text-slate-300 text-xs sm:text-sm leading-relaxed shadow-xl">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                1
              </span>
              Acceptance of Terms
            </h2>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern the access and use of the <b>DenBooks 360</b> cloud platform, desktop web applications, counter point-of-sale (POS) modules, and associated digital services operated by <b>SRB Studios</b> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
            </p>
            <p>
              By accessing, creating an account on, or subscribing to DenBooks 360, you (&ldquo;User&rdquo;, &ldquo;Tenant&rdquo;, or &ldquo;Center Operator&rdquo;) agree to be legally bound by these Terms and our Privacy Policy. If you do not agree to these terms, you must discontinue using the platform immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                2
              </span>
              Service Scope & Intended Use
            </h2>
            <p>
              DenBooks 360 is specialized accounting, token management, and point-of-sale software engineered specifically for <b>Citizen Service Centers</b> (including Common Service Centers [CSC], e-District kiosks, Akshaya Centers, E-Mitra, Jan Seva Kendras, and Cyber Cafes across India).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <b>Pass-Through Fee Isolation:</b> The platform distinguishes government and utility pass-through statutory fees (which are non-revenue advances) from net shop processing margins.
              </li>
              <li>
                <b>Local-First Resilience:</b> Front-desk operators can queue tokens and issue thermal slips even during intermittent shop broadband outages; entries synchronize once internet connection is re-established.
              </li>
              <li>
                <b>Independent Software Provider:</b> DenBooks 360 is an independent administrative software platform and is <i>not</i> affiliated with, endorsed by, or an official agency of CSC e-Governance Services India Limited, state government portals, or any municipal authority.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                3
              </span>
              Subscriptions, Billing & Verified Merchant Payments
            </h2>
            <p>
              DenBooks 360 offers subscription tiers (Single Counter, Pro Center Hub, and Multi-Branch) on both monthly and annual billing cycles, starting with a <b>14-Day Full Free Trial</b> without requiring upfront payment information.
            </p>
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
              <h3 className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs sm:text-sm">
                <CheckCircle size={15} /> Direct Verified UPI Merchant Settlement (0% Markup)
              </h3>
              <p className="text-xs text-slate-300">
                To keep software operational costs sustainable for small kiosk entrepreneurs, subscription payments are settled directly via our verified UPI merchant account (PhonePe / Google Pay / Paytm for Business) without 2–3% intermediary gateway commissions.
              </p>
              <p className="text-xs text-slate-300">
                Upon completing payment, operators must submit the genuine <b>12-digit UPI Transaction Reference (UTR)</b>. Subscriptions are verified and activated within <b>5 to 15 minutes</b> during standard operating hours.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                4
              </span>
              Tenant Isolation & Data Ownership
            </h2>
            <p>
              All daybook transactions, citizen customer names, phone numbers, Udhar / Khata balances, and staff PINs recorded on your center&rsquo;s account are protected via row-level security and strict multi-tenant isolation.
            </p>
            <p>
              <b>You retain 100% ownership of your shop data.</b> We do not sell, rent, or monetize your center&rsquo;s customer records or citizen transaction history to third-party advertising brokers or data aggregators.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                5
              </span>
              User Obligations & Prohibited Actions
            </h2>
            <p>
              As a center operator, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Maintain confidentiality of master owner credentials and staff operator PINs.</li>
              <li>Provide accurate center identity details during signup and subscription verification.</li>
              <li>Refrain from attempting unauthorized access, tampering with database endpoints, or reverse-engineering platform source code.</li>
              <li>Ensure all citizen customer data entered complies with applicable Indian data protection laws and local guidelines.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                6
              </span>
              &ldquo;As-Is&rdquo; Operational Disclaimer & Liability Shield
            </h2>
            <p>
              DenBooks 360 is administrative software provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <b>No Physical Cash-Drawer or Wallet Guarantee:</b> DenBooks does not guarantee that computed daybook totals or drawer tallies will match physical currency in your shop cash-box or external balance ledgers on government portals. The center owner remains exclusively responsible for auditing staff entries, verifying portal advance deductions, and counting physical cash.
              </li>
              <li>
                <b>Liability Cap:</b> To the fullest extent permitted by Indian law, our total cumulative financial liability to any customer for all claims arising from platform interruptions, synchronization failures, or data loss is strictly capped at the <b>amount paid by the customer over the preceding 1 to 3 months (or ₹1,000, whichever is lower)</b>.
              </li>
              <li>
                <b>Government Portal & Third-Party Outages:</b> SRB Studios is not liable for indirect damages, statutory fines, or lost business revenue caused by downtime on CSC Digital Seva, e-District, BBPS, UTIITSL/NSDL, or third-party telecom broadband providers.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                7
              </span>
              WhatsApp Khata Messaging & No Telemarketing Liability
            </h2>
            <p>
              DenBooks 360 includes features that allow operators to trigger formatted receipts and Customer Khata (Udhar) balance alerts directly to citizen WhatsApp numbers via their device&rsquo;s WhatsApp client:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <b>Owner-Initiated Dispatch:</b> Message dispatches are initiated solely at the center operator&rsquo;s discretion and action. DenBooks does not initiate unsolicited bulk marketing, telemarketing, or promotional robocalls.
              </li>
              <li>
                <b>Citizen Consent Responsibility:</b> The center owner is exclusively responsible for ensuring that citizen customers have provided requisite verbal or written consent to receive operational transactional receipts and payment balance reminders under applicable Indian telecom and data protection regulations.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                8
              </span>
              Grievance Redressal Mechanism
            </h2>
            <p>
              In accordance with the <b>Consumer Protection (E-Commerce) Rules, 2020</b> and Rule 5(4) of the <b>Information Technology (Intermediary Guidelines) Rules</b>, our appointed Grievance Redressal Officer details are published below:
            </p>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Building size={15} className="text-cyan-400" /> SRB Studios Grievance Office
                </span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800/40">
                  SLA: 48-Hour Acknowledgment
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block">Designated Officer:</span>
                  <span className="font-semibold text-slate-200">Muhammed Anees E K V</span>
                  <span className="block text-[11px] text-cyan-400">Lead Operations & Compliance</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone:</span>
                  <a href="tel:+917012584152" className="font-semibold text-slate-200 hover:text-cyan-400">
                    +91 70125 84152
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Official Support & Grievance Email:</span>
                  <a href="mailto:support@denbooks.in" className="font-semibold text-cyan-400 hover:underline">
                    support@denbooks.in
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Direct Merchant Helpline:</span>
                  <a href="https://wa.me/917012584152" className="font-semibold text-emerald-400 hover:underline">
                    +91 70125 84152 (WhatsApp)
                  </a>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Geographic Office Address:</span>
                  <span className="font-semibold text-slate-200">SRB Studios, Kerala, India</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Complaints will be acknowledged within <b>48 hours</b> and redressed within <b>1 month</b> of receipt as per statutory requirements.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Link Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-cyan-400 transition">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-cyan-400 transition">
              Refund & Cancellation Policy
            </Link>
          </div>
          <p>© {new Date().getFullYear()} DenBooks 360 • SRB Studios</p>
        </div>
      </main>
    </div>
  );
}
