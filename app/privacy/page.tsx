import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, CheckCircle, Database, Smartphone, Mail, Building } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | DenBooks 360",
  description: "Privacy policy detailing data isolation, local storage, citizen records security, and statutory compliance on DenBooks 360.",
};

export default function PrivacyPage() {
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
                Privacy & Data Security
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
            <Shield size={13} />
            <span>Data Protection Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-mono">
            Last Updated: October 2026 • Compliant with Digital Personal Data Protection Act (DPDPA), 2023 & Consumer Protection Rules, 2020 (India)
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
              Overview & Privacy Commitment
            </h2>
            <p>
              At <b>DenBooks 360</b> (operated by <b>SRB Studios</b>), we respect and protect the privacy of citizen service kiosk entrepreneurs, cyber center owners, and the citizens whose service records are managed through our point-of-sale platform.
            </p>
            <p>
              This Privacy Policy explains how information is collected, stored, processed, and safeguarded when using the DenBooks 360 web applications and cloud services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                2
              </span>
              Data We Collect
            </h2>
            <p>
              Depending on your subscription and module usage, we process the following categories of data:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                  <Building size={14} className="text-cyan-400" /> Center Operator Profile
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                  <li>Center Name, Owner Name, Contact Phone & Email</li>
                  <li>Kiosk Physical Address, State, and CSC/e-District Center ID</li>
                  <li>Staff employee names, role definitions, and operator PINs</li>
                  <li>Subscription payment UTR reference numbers</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                  <Database size={14} className="text-teal-400" /> Operational Business Records
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                  <li>Citizen customer names & phone numbers for Khata (Udhar) and WhatsApp receipts</li>
                  <li>Daybook service transactions, portal government fee breakdowns, and shop margins</li>
                  <li>Portal advance wallet balances (e-District, CSC, BBPS)</li>
                  <li>Cash drawer drawer tallies and shift handover logs</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                3
              </span>
              Strict Non-Monetization Pledge: We Never Sell Citizen Data
            </h2>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
              <h3 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                <CheckCircle size={15} /> 100% Tenant Isolation & Zero Advertising
              </h3>
              <p className="text-xs text-slate-300">
                Your customer contacts, citizen phone numbers, Aadhaar/certificate application transaction notes, and financial balances belong exclusively to your center.
              </p>
              <p className="text-xs text-slate-300">
                <b>We do not monetize, aggregate for credit profiling, or sell your customer directory to telemarketers, loan brokers, or ad platforms.</b>
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                4
              </span>
              Local-First Offline Storage & Security
            </h2>
            <p>
              To maintain high counter speed during morning citizen rushes and tolerate broadband outages, DenBooks 360 utilizes browser-level IndexedDB and encrypted local cache on your shop terminal. Data synchronizes over encrypted Transport Layer Security (TLS 1.3 / SSL) with Supabase Cloud PostgreSQL databases guarded by strict Row-Level Security (RLS) policies.
            </p>
            <p>
              Clerks operating the <b>/staff</b> counter POS have restricted permissions: they cannot access the owner&rsquo;s cloud database keys, total center profit summaries, or export sensitive customer directories without administrative authorization.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                5
              </span>
              Third-Party Services & Integrations
            </h2>
            <p>
              DenBooks 360 interacts with limited third-party services exclusively to facilitate essential software functionality:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><b>WhatsApp Web / Deep Linking:</b> Used to generate formatted thermal slips or balance alerts directly from your shop device; we do not intercept your personal WhatsApp chats.</li>
              <li><b>NPCI Unified Payments Interface (UPI):</b> Dynamic QR codes generated on your screen route directly to your verified merchant VPA without intermediary storage of customer bank account credentials.</li>
              <li><b>Cloud Database Hosting:</b> Scaled infrastructure managed via Supabase with automated regional backups and strict tenant segregation.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                6
              </span>
              Data Retention & Account Deletion
            </h2>
            <p>
              You maintain full authority to export your center&rsquo;s daybook invoices and customer lists in CSV/Excel formats at any time. If you decide to cancel your subscription or terminate your account, you may request permanent deletion of your cloud records by contacting our support desk.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                7
              </span>
              Grievance Officer & Data Protection Contact
            </h2>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 space-y-2.5">
              <p className="text-xs text-slate-300">
                If you have questions regarding this Privacy Policy, your data rights, or suspect any security discrepancy, you may directly reach our Grievance Redressal Officer:
              </p>
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
                  <span className="text-slate-500 block">Support Email:</span>
                  <a href="mailto:support@denbooks.in" className="font-semibold text-cyan-400 hover:underline">
                    support@denbooks.in
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Merchant Hotline:</span>
                  <a href="https://wa.me/917012584152" className="font-semibold text-emerald-400 hover:underline">
                    +91 70125 84152 (WhatsApp)
                  </a>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Geographic Office Address:</span>
                  <span className="font-semibold text-slate-200">SRB Studios, Kerala, India</span>
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
