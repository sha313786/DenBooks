import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Clock, ShieldCheck, Mail, Building, Phone } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy | DenBooks 360",
  description: "Official cancellation, accidental transfer, duplicate payment, and refund policy for DenBooks 360 subscription services.",
};

export default function RefundPolicyPage() {
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
                Billing & Returns
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
            <RefreshCw size={13} />
            <span>Customer Protection & Fair Billing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-mono">
            Compliant with Consumer Protection (E-Commerce) Rules, 2020 • Last Updated: October 2026
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
              14-Day Risk-Free Trial Period
            </h2>
            <p>
              To ensure every CSC, Akshaya, E-Mitra, and cyber-center operator has sufficient opportunity to test thermal printer compatibility (58mm/80mm), offline queue tokens, and daybook fee isolation before paying any subscription fee, <b>DenBooks 360 provides a 14-Day Full Free Trial</b> on all newly registered centers.
            </p>
            <p>
              No credit card, advance deposit, or banking details are required to initiate the trial. You only pay if you find DenBooks 360 valuable for your daily shop operations.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                2
              </span>
              Duplicate Payments & Accidental Double Transfers
            </h2>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
              <h3 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs sm:text-sm">
                <AlertCircle size={15} /> 100% Guaranteed Refund on Duplicate Transactions
              </h3>
              <p className="text-xs text-slate-300">
                If your UPI app debited your bank account twice for the same billing cycle or if you inadvertently submitted multiple UPI transfers for a single subscription activation, <b>the duplicate amount will be refunded in full (100%) to your original paying UPI account / bank within 3 to 5 business days</b> after manual reconciliation.
              </p>
              <p className="text-xs text-slate-300">
                Simply share both 12-digit UTR numbers with our WhatsApp helpline (+91 70125 84152) or email support@denbooks.in.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                3
              </span>
              Accidental Transfers & Incorrect Tier Selection
            </h2>
            <p>
              If you mistakenly sent an incorrect amount (for example, sending ₹199 instead of ₹1,499 for an Annual License, or vice versa):
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <b>Prorated Upgrade Credit:</b> The paid amount will be immediately credited toward adjusting your billing cycle days or upgrading to the desired tier with zero penalty.
              </li>
              <li>
                <b>Excess Payment Refund:</b> If you overpaid relative to your intended tier, the excess amount can be reversed immediately upon request.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                4
              </span>
              Subscription Cancellation Policy
            </h2>
            <p>
              You may cancel or choose not to renew your monthly or annual subscription at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <b>No Auto-Debit Surprises:</b> Because payments are made directly via UPI QR without recurring mandate auto-debit deductions, your bank account will never be charged automatically. If you decide not to renew, simply stop making the manual UPI transfer when your cycle concludes.
              </li>
              <li>
                <b>Access Until Period End:</b> If you decide to cancel during an active billing cycle, your center maintains full access to your daybook, customer Khata, and counter POS until the final paid expiration date.
              </li>
              <li>
                <b>Permanent Data Export:</b> Before expiration, you can freely export all your sales invoices, customer balances, and daybook histories in CSV/Excel formats.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                5
              </span>
              Platform Unavailability & Prolonged Downtime SLA
            </h2>
            <p>
              DenBooks 360 is engineered with local-first offline fallback so counter billing never stops during internet failures. However, in the rare event of prolonged cloud synchronization failure attributable exclusively to our infrastructure exceeding 72 consecutive hours:
            </p>
            <p>
              Affected subscribers will receive an automatic <b>prorated subscription extension (free days credited)</b> or a prorated refund for the unused duration upon written request.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                6
              </span>
              Refund Request Process & Grievance Contact
            </h2>
            <p>
              To submit a cancellation or refund inquiry under the <b>Consumer Protection (E-Commerce) Rules, 2020</b>, please follow these simple steps:
            </p>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <ShieldCheck size={16} className="text-cyan-400" /> Grievance Redressal & Refund Desk
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  Turnaround: 48-Hour Acknowledgment
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block">Designated Officer:</span>
                  <span className="font-semibold text-slate-200">Muhammed Anees E K V</span>
                  <span className="block text-[11px] text-cyan-400">Lead Operations & Compliance</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone & WhatsApp:</span>
                  <a href="tel:+917012584152" className="font-semibold text-slate-200 hover:text-cyan-400">
                    +91 70125 84152
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Official Support & Refund Email:</span>
                  <a href="mailto:support@denbooks.in" className="font-semibold text-cyan-400 hover:underline">
                    support@denbooks.in
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Refund Settlement Timeline:</span>
                  <span className="font-semibold text-slate-200">3–5 Business Days to source UPI VPA</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Geographic Office Address:</span>
                  <span className="font-semibold text-slate-200">SRB Studios, Kerala, India</span>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-slate-800">
                  <span className="text-slate-500 block">Required for Claim:</span>
                  <span className="font-semibold text-slate-300">Center Name, Registered Phone & 12-digit UTR</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Link Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-cyan-400 transition">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-cyan-400 transition">
              Privacy Policy
            </Link>
          </div>
          <p>© {new Date().getFullYear()} DenBooks 360 • SRB Studios</p>
        </div>
      </main>
    </div>
  );
}
