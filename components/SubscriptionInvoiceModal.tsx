"use client";

import React, { useRef } from "react";
import {
  FileText,
  Printer,
  X,
  CheckCircle2,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";
import { SuperAdminConfig, PaymentSubmission, TenantSubscription } from "@/lib/services/subscription.service";

interface SubscriptionInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SuperAdminConfig;
  submission?: PaymentSubmission | null;
  tenant: TenantSubscription;
  onTenantUpdate?: (updated: Partial<TenantSubscription>) => void;
}

export default function SubscriptionInvoiceModal({
  isOpen,
  onClose,
  config,
  submission,
  tenant,
  onTenantUpdate,
}: SubscriptionInvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Local state for subscriber profile quick edits if details were empty
  const [isEditingSubscriber, setIsEditingSubscriber] = React.useState(false);

  // Load from local storage fallback
  const getStoredTenant = () => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("denbooks_current_tenant");
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return {};
  };

  const stored = getStoredTenant();
  const [editCenter, setEditCenter] = React.useState(tenant.shop_name || stored.name || "");
  const [editOwner, setEditOwner] = React.useState(tenant.owner_name || stored.owner || "");
  const [editPhone, setEditPhone] = React.useState(tenant.owner_phone || stored.phone || "");
  const [editState, setEditState] = React.useState(tenant.state || stored.state || "Kerala");

  // Keep state synced when tenant prop changes
  React.useEffect(() => {
    const s = getStoredTenant();
    setEditCenter(tenant.shop_name || s.name || "");
    setEditOwner(tenant.owner_name || s.owner || "");
    setEditPhone(tenant.owner_phone || s.phone || "");
    setEditState(tenant.state || s.state || "Kerala");
  }, [tenant]);

  if (!isOpen) return null;

  const invoiceNumber =
    submission?.invoice_number ||
    tenant.last_invoice_number ||
    `INV-DB-${new Date().getFullYear()}-0001`;

  const invoiceDate = submission?.approved_at
    ? new Date(submission.approved_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const planName =
    submission?.plan === "multi"
      ? "Multi-Branch Network (Enterprise Hub)"
      : submission?.plan === "single"
      ? "Single Counter POS (Starter)"
      : "Pro Center Hub (Full Operations Suite)";

  const billingCycle = submission?.billing_cycle === "annual" ? "Annual License" : "Monthly Subscription";
  const amountPaid = submission?.amount || (submission?.billing_cycle === "annual" ? 1499 : 199);
  const utrNumber = submission?.utr_number || tenant.last_payment_utr || "Verified Direct UPI";

  const displayShopName = editCenter.trim() || "Citizen Service Center";
  const displayOwnerName = editOwner.trim() || "Center Administrator";
  const cleanPhoneDigits = editPhone.replace(/^(\+91\s*|0)/, "").trim();
  const displayPhone = cleanPhoneDigits ? `+91 ${cleanPhoneDigits}` : "—";
  const displayState = editState.trim() || "Kerala, India";

  function saveSubscriberQuickEdit() {
    const cleanCenter = editCenter.trim();
    const cleanOwn = editOwner.trim();
    const cleanPh = cleanPhoneDigits;
    const cleanSt = editState.trim();

    if (typeof window !== "undefined") {
      const existing = getStoredTenant();
      const updatedTenant = {
        ...existing,
        name: cleanCenter,
        owner: cleanOwn,
        phone: cleanPh,
        state: cleanSt,
      };
      localStorage.setItem("denbooks_current_tenant", JSON.stringify(updatedTenant));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("denbooks_tenant_updated", { detail: updatedTenant }));
    }

    if (onTenantUpdate) {
      onTenantUpdate({
        shop_name: cleanCenter,
        owner_name: cleanOwn,
        owner_phone: cleanPh,
        state: cleanSt,
      });
    }

    setIsEditingSubscriber(false);
  }

  function handlePrint() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const logoUrl = `${origin}/logo.png`;

    const printHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Tax Invoice - ${invoiceNumber} - DenBooks 360</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              font-size: 12px;
              line-height: 1.45;
              padding: 0;
            }
            .invoice-box {
              width: 100%;
              max-width: 780px;
              margin: 0 auto;
            }
            .header-table {
              width: 100%;
              margin-bottom: 20px;
              border-bottom: 2px solid #0284c7;
              padding-bottom: 16px;
            }
            .logo-img {
              width: 44px;
              height: 44px;
              border-radius: 10px;
              vertical-align: middle;
              margin-right: 10px;
              border: 1px solid #e2e8f0;
            }
            .brand-title {
              font-size: 20px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: -0.5px;
              display: inline-block;
              vertical-align: middle;
            }
            .brand-sub {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #64748b;
              margin-top: 2px;
            }
            .company-info {
              font-size: 11px;
              color: #334155;
              margin-top: 8px;
              line-height: 1.4;
            }
            .badge-paid {
              display: inline-block;
              background: #ecfdf5;
              color: #065f46;
              border: 1px solid #a7f3d0;
              padding: 3px 10px;
              border-radius: 20px;
              font-weight: 800;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-number {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 6px;
            }
            .meta-date {
              font-size: 11px;
              color: #64748b;
              margin-top: 2px;
            }
            .billed-box {
              width: 100%;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 14px 18px;
              margin-bottom: 20px;
            }
            .billed-title {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #64748b;
              margin-bottom: 8px;
            }
            .billed-grid {
              width: 100%;
            }
            .billed-grid td {
              vertical-align: top;
              padding: 3px 6px;
              font-size: 11.5px;
            }
            .billed-label {
              color: #64748b;
              font-size: 10.5px;
            }
            .billed-val {
              font-weight: 700;
              color: #0f172a;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              overflow: hidden;
            }
            .items-table th {
              background: #f1f5f9;
              color: #475569;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              padding: 8px 12px;
              text-align: left;
              border-bottom: 1px solid #cbd5e1;
            }
            .items-table td {
              padding: 12px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 11.5px;
            }
            .settle-table {
              width: 100%;
              margin-top: 10px;
              border-top: 1px solid #e2e8f0;
              padding-top: 14px;
            }
            .settle-table td {
              vertical-align: top;
            }
            .total-amount {
              font-size: 24px;
              font-weight: 900;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              color: #0f172a;
            }
            .disclaimer-box {
              margin-top: 24px;
              padding-top: 14px;
              border-top: 1px dashed #cbd5e1;
              font-size: 9.5px;
              color: #64748b;
              line-height: 1.45;
            }
            @media print {
              .no-print { display: none !important; }
              body { background: #fff !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background:#0f172a; color:#fff; padding:10px 16px; border-radius:8px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:bold; font-size:12px;">DenBooks 360 Official Tax Invoice</span>
            <button onclick="window.print()" style="background:#38bdf8; color:#0f172a; border:none; padding:6px 14px; border-radius:6px; font-weight:bold; cursor:pointer;">Print / Save PDF</button>
          </div>

          <div class="invoice-box">
            <!-- Header -->
            <table class="header-table">
              <tr>
                <td style="vertical-align: top;">
                  <div style="display: flex; align-items: center;">
                    <img src="${logoUrl}" alt="DenBooks 360" class="logo-img" />
                    <div style="display: inline-block;">
                      <div class="brand-title">DenBooks <span style="color:#0284c7;">360</span></div>
                      <div class="brand-sub">SaaS License Tax Invoice</div>
                    </div>
                  </div>
                  <div class="company-info">
                    <strong>${config.company_name || "SRB Studios"}</strong><br />
                    ${config.company_address || "SRB Studios, Kerala, India"}<br />
                    Email: ${config.support_email || "support@denbooks.in"}
                    ${config.gstin ? `<br />GSTIN: ${config.gstin}` : ""}
                  </div>
                </td>
                <td style="text-align: right; vertical-align: top; width: 220px;">
                  <span class="badge-paid">Paid & Verified</span>
                  <div class="meta-number">${invoiceNumber}</div>
                  <div class="meta-date">Date: ${invoiceDate}</div>
                </td>
              </tr>
            </table>

            <!-- Billed To (Subscriber) -->
            <div class="billed-box">
              <div class="billed-title">Billed To (Subscriber Center):</div>
              <table class="billed-grid">
                <tr>
                  <td style="width: 50%;">
                    <div class="billed-label">Center Name:</div>
                    <div class="billed-val" style="font-size: 13px;">${displayShopName}</div>
                  </td>
                  <td style="width: 50%;">
                    <div class="billed-label">Owner / Operator:</div>
                    <div class="billed-val">${displayOwnerName}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="billed-label">Mobile Number:</div>
                    <div class="billed-val font-mono">${displayPhone}</div>
                  </td>
                  <td>
                    <div class="billed-label">Operating State:</div>
                    <div class="billed-val">${displayState}</div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Line Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 30px;">#</th>
                  <th>Item & Description</th>
                  <th style="text-align: center; width: 140px;">Billing Cycle</th>
                  <th style="text-align: right; width: 110px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: bold; color: #64748b;">1</td>
                  <td>
                    <strong style="color: #0f172a; font-size: 12.5px;">${planName}</strong>
                    <div style="color: #64748b; font-size: 10.5px; margin-top: 2px;">
                      Cloud sync, 58/80mm thermal slips, daybook fee isolation, and multi-staff counter OS
                    </div>
                  </td>
                  <td style="text-align: center; font-weight: 600; color: #0284c7;">
                    ${billingCycle}
                  </td>
                  <td style="text-align: right; font-weight: 800; font-family: monospace; font-size: 13px;">
                    ₹${amountPaid.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Settlement Details & Net Total -->
            <table class="settle-table">
              <tr>
                <td style="width: 60%;">
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">
                    Settlement Details:
                  </div>
                  <div style="font-size: 11px; color: #334155; margin-bottom: 2px;">
                    ✔ <strong>Payment Mode:</strong> Direct UPI (0% Gateway Surcharge)
                  </div>
                  <div style="font-size: 11px; font-family: monospace; color: #0f172a;">
                    <strong>12-Digit UTR Ref:</strong> ${utrNumber}
                  </div>
                </td>
                <td style="text-align: right; width: 40%;">
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b;">
                    Total Amount Paid
                  </div>
                  <div class="total-amount">₹${amountPaid.toLocaleString("en-IN")}</div>
                  <div style="font-size: 9.5px; color: #64748b;">Zero Payment Gateway Surcharge</div>
                </td>
              </tr>
            </table>

            <!-- Disclaimers & Notes -->
            <div class="disclaimer-box">
              <p>
                <strong>Tax & Statutory Note:</strong> This computer-generated receipt serves as official proof of SaaS license renewal. Direct UPI transfer settled with ${config.payee_name || "DenBooks 360"}.
              </p>
              <p style="margin-top: 3px;">
                DenBooks 360 is an independent commercial utility software developed by ${config.company_name || "SRB Studios"}.
              </p>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    const printWin = window.open("", "_blank", "width=850,height=900");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
      return;
    }

    // Fallback if popup blocker is active
    let iframe = document.getElementById("denbooks_print_frame") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "denbooks_print_frame";
      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printHtml);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 300);
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A4 portrait;
              margin: 10mm 15mm;
            }
          `,
        }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
        {/* Modal Card */}
        <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#0d1424] text-slate-100 shadow-2xl overflow-hidden print:border-none print:bg-white print:text-black print:shadow-none print:max-w-full print:m-0">
          {/* Top Action Bar (Hidden on print) */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-5 py-3 sm:px-6 sm:py-3.5 print:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <FileText size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Subscription Tax Invoice</h2>
                <p className="text-[11px] font-mono text-cyan-400">{invoiceNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingSubscriber(!isEditingSubscriber)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer"
                title="Edit center name, operator name or phone"
              >
                {isEditingSubscriber ? "Cancel Edit" : "Edit Subscriber"}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20 cursor-pointer"
              >
                <Printer size={13} />
                <span>Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Edit Subscriber Panel (Hidden on print) */}
          {isEditingSubscriber && (
            <div className="border-b border-slate-800 bg-[#090f1d] p-4 text-xs space-y-3 print:hidden">
              <div className="font-bold text-cyan-300 flex items-center justify-between">
                <span>Update Subscriber Details for Invoice:</span>
                <span className="text-[10px] text-slate-400 font-normal">Saves directly to your shop profile</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Center Name</label>
                  <input
                    type="text"
                    value={editCenter}
                    onChange={(e) => setEditCenter(e.target.value)}
                    placeholder="e.g. Apex Citizen Seva Hub"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Owner / Operator Name</label>
                  <input
                    type="text"
                    value={editOwner}
                    onChange={(e) => setEditOwner(e.target.value)}
                    placeholder="e.g. Muhammed Anees"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Mobile Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. 7012584152"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Operating State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    placeholder="e.g. Kerala"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={saveSubscriberQuickEdit}
                  className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                >
                  Save & Update Invoice
                </button>
              </div>
            </div>
          )}

          {/* Printable Invoice Container */}
          <div
            id="denbooks-tax-invoice-printable"
            ref={printRef}
            className="p-5 sm:p-7 space-y-5 print:p-6 print:text-black print-no-break"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5 print:border-slate-300">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="DenBooks 360"
                    className="h-10 w-10 rounded-xl object-cover shadow-sm border border-cyan-500/20 print:border-slate-300"
                  />
                  <div>
                    <span className="text-lg font-black tracking-tight text-white print:text-black">
                      DenBooks <span className="text-cyan-400 print:text-slate-800">360</span>
                    </span>
                    <span className="block text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400 print:text-slate-600">
                      SaaS License Receipt
                    </span>
                  </div>
                </div>

                {/* Dynamic Legal Entity Address (Updatable by Admin at any time) */}
                <div className="mt-3 text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                  <p className="font-bold text-white print:text-black">{config.company_name || "SRB Studios"}</p>
                  <p>{config.company_address || "SRB Studios, Kerala, India"}</p>
                  <p className="flex items-center gap-1.5 mt-0.5">
                    <Mail size={11} className="text-cyan-400 print:text-slate-600" />
                    <span>{config.support_email || "support@denbooks.in"}</span>
                  </p>
                  {config.gstin && <p className="font-mono text-[11px] mt-0.5">GSTIN: {config.gstin}</p>}
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="text-left sm:text-right space-y-1">
                <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 print:bg-emerald-50 print:text-emerald-800 print:border-emerald-300">
                  PAID & VERIFIED
                </span>
                <p className="font-mono text-sm font-bold text-white print:text-black">{invoiceNumber}</p>
                <p className="text-xs text-slate-400 print:text-slate-600 flex items-center sm:justify-end gap-1">
                  <Calendar size={12} />
                  <span>Date: {invoiceDate}</span>
                </p>
              </div>
            </div>

            {/* Billed To / Buyer Box */}
            <div className="rounded-2xl border border-slate-800 bg-[#090f1d] p-4 text-xs space-y-1 print:border-slate-300 print:bg-slate-50 print:text-black">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 print:text-slate-600 block mb-1">
                Billed To (Subscriber):
              </span>
              <div className="grid sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[11px]">Center Name:</span>
                  <span className="font-bold text-white print:text-black text-sm">{displayShopName}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[11px]">Owner / Operator:</span>
                  <span className="font-semibold text-slate-200 print:text-black">{displayOwnerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[11px]">Phone:</span>
                  <span className="font-mono text-slate-200 print:text-black">{displayPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[11px]">Operating State:</span>
                  <span className="font-semibold text-slate-200 print:text-black">{displayState}</span>
                </div>
              </div>
            </div>

            {/* Line Item Table */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-mono text-[10px] uppercase tracking-wider print:bg-slate-100 print:text-slate-700">
                  <tr>
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-4 text-center">Cycle</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300 text-slate-300 print:text-black">
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white print:text-black">{planName}</p>
                      <p className="text-[11px] text-slate-400 print:text-slate-600">
                        Cloud sync, 58/80mm thermal slips, daybook fee isolation, and multi-staff counter OS
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-cyan-400 print:text-slate-800">
                      {billingCycle}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white print:text-black">
                      ₹{amountPaid.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Method & Total */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-800 print:border-slate-300 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 print:text-slate-600 block">
                  Settlement Details:
                </span>
                <p className="font-mono text-[11px] text-slate-300 print:text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>Payment Mode: Direct UPI</span>
                </p>
                <p className="font-mono text-[11px] text-amber-300 print:text-slate-800">
                  12-Digit UTR Ref: <b>{utrNumber}</b>
                </p>
              </div>

              <div className="text-left sm:text-right space-y-0.5">
                <span className="text-[11px] text-slate-400 print:text-slate-600">Total Amount Paid</span>
                <div className="text-2xl font-black text-emerald-400 print:text-black font-mono">
                  ₹{amountPaid.toLocaleString("en-IN")}
                </div>
                <span className="text-[10px] text-slate-500 block">Zero Payment Gateway Surcharge</span>
              </div>
            </div>

            {/* Footer Statutory Disclaimers */}
            <div className="pt-3 border-t border-slate-800/80 text-[10px] leading-relaxed text-slate-400 print:text-slate-600 space-y-1">
              <p>
                <b>Tax & Statutory Note:</b> This computer-generated receipt serves as official proof of SaaS license renewal. Direct UPI transfer settled with {config.payee_name || "DenBooks 360"}.
              </p>
              <p>
                DenBooks 360 is an independent commercial utility software developed by {config.company_name || "SRB Studios"}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
