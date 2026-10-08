import { supabase } from "@/lib/supabase";
import { getTodayDateString } from "./accounts.service";

export type QueueTokenStatus = "Waiting" | "Serving" | "Completed" | "Cancelled";
export type QueuePriority = "Normal" | "Senior Citizen" | "Urgent";

export type QueueToken = {
  id: string;
  token_number: string; // e.g. "T-001"
  token_sequence: number; // 1, 2, 3...
  date: string; // YYYY-MM-DD
  customer_name: string;
  customer_phone?: string;
  service_requested: string;
  priority: QueuePriority;
  status: QueueTokenStatus;
  counter_assigned?: string;
  notes?: string;
  employee_id?: string;
  employee_name?: string;
  created_at: string;
  called_at?: string;
  completed_at?: string;
};

const STORAGE_KEY_TOKENS = "dd_queue_tokens_v2"; // v2 = production clean start
const STORAGE_KEY_TOKENS_LEGACY = "dd_queue_tokens_v1";


let memoryTokens: QueueToken[] = [];

function loadFromStorage(targetDate: string = getTodayDateString()): QueueToken[] {
  if (typeof window === "undefined") return memoryTokens;
  try {
    // Purge old v1 key that had hardcoded sample tokens
    localStorage.removeItem(STORAGE_KEY_TOKENS_LEGACY);

    const raw = localStorage.getItem(STORAGE_KEY_TOKENS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryTokens = parsed;
        return memoryTokens;
      }
    }
    // Start with empty queue — no sample data in production
    memoryTokens = [];
    localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(memoryTokens));
  } catch (e) {
    console.warn("Queue storage load error:", e);
  }
  return memoryTokens;
}

function saveToStorage(tokens: QueueToken[]): void {
  memoryTokens = tokens;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
    } catch (e) {
      console.warn("Queue storage save error:", e);
    }
  }
}

// Fetch all queue tokens for a specific date
export async function getQueueTokens(date: string = getTodayDateString()): Promise<QueueToken[]> {
  loadFromStorage(date);

  try {
    const { data, error } = await supabase
      .from("queue_tokens")
      .select("*")
      .eq("date", date)
      .order("token_sequence", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      memoryTokens = data as QueueToken[];
      saveToStorage(memoryTokens);
      return memoryTokens;
    }
  } catch (err) {
    // Local fallback
  }

  return memoryTokens
    .filter((t) => t.date === date)
    .sort((a, b) => a.token_sequence - b.token_sequence);
}

// Issue a new First-Come-First-Serve Queue Token
export async function issueQueueToken(payload: {
  customer_name: string;
  customer_phone?: string;
  service_requested: string;
  priority?: QueuePriority;
  counter_assigned?: string;
  notes?: string;
  employee_id?: string;
  employee_name?: string;
}): Promise<QueueToken> {
  const today = getTodayDateString();
  const existingToday = loadFromStorage(today).filter((t) => t.date === today);

  // Compute next sequence number for today (FCFS order)
  const nextSeq = existingToday.length > 0
    ? Math.max(...existingToday.map((t) => t.token_sequence)) + 1
    : 1;

  const tokenNumber = `T-${String(nextSeq).padStart(3, "0")}`;

  const newToken: QueueToken = {
    id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    token_number: tokenNumber,
    token_sequence: nextSeq,
    date: today,
    customer_name: payload.customer_name.trim() || "Walk-in Citizen",
    customer_phone: payload.customer_phone?.trim() || undefined,
    service_requested: payload.service_requested.trim() || "General Counter Service",
    priority: payload.priority || "Normal",
    status: "Waiting",
    counter_assigned: payload.counter_assigned || "Counter 1",
    notes: payload.notes?.trim() || undefined,
    employee_id: payload.employee_id,
    employee_name: payload.employee_name || "Receptionist",
    created_at: new Date().toISOString(),
  };

  const updatedList = [...memoryTokens, newToken];
  saveToStorage(updatedList);

  try {
    await supabase.from("queue_tokens").insert(newToken);
  } catch {}

  return newToken;
}

// Call the next waiting token in line (First-Come, First-Served)
export async function callNextWaitingToken(
  counterAssigned: string = "Counter 1",
  employeeName?: string
): Promise<QueueToken | null> {
  const today = getTodayDateString();
  const tokens = loadFromStorage(today).filter((t) => t.date === today);

  // FCFS: Sort by token sequence ascending and pick earliest Waiting token
  const nextWaiting = tokens
    .filter((t) => t.status === "Waiting")
    .sort((a, b) => a.token_sequence - b.token_sequence)[0];

  if (!nextWaiting) return null;

  nextWaiting.status = "Serving";
  nextWaiting.called_at = new Date().toISOString();
  nextWaiting.counter_assigned = counterAssigned;
  if (employeeName) {
    nextWaiting.employee_name = employeeName;
  }

  saveToStorage(tokens);

  try {
    await supabase
      .from("queue_tokens")
      .update({
        status: "Serving",
        called_at: nextWaiting.called_at,
        counter_assigned: counterAssigned,
        employee_name: nextWaiting.employee_name,
      })
      .eq("id", nextWaiting.id);
  } catch {}

  return nextWaiting;
}

// Update token status (Serving, Completed, Cancelled)
export async function updateQueueTokenStatus(
  id: string,
  status: QueueTokenStatus,
  counterAssigned?: string
): Promise<QueueToken> {
  const tokens = loadFromStorage();
  const token = tokens.find((t) => t.id === id);
  if (!token) throw new Error("Token not found");

  token.status = status;
  if (status === "Serving" && !token.called_at) {
    token.called_at = new Date().toISOString();
  }
  if (status === "Completed") {
    token.completed_at = new Date().toISOString();
  }
  if (counterAssigned) {
    token.counter_assigned = counterAssigned;
  }

  saveToStorage(tokens);

  try {
    await supabase
      .from("queue_tokens")
      .update({
        status,
        called_at: token.called_at,
        completed_at: token.completed_at,
        counter_assigned: token.counter_assigned,
      })
      .eq("id", id);
  } catch {}

  return token;
}

// Delete / Purge token
export async function deleteQueueToken(id: string): Promise<void> {
  const tokens = loadFromStorage().filter((t) => t.id !== id);
  saveToStorage(tokens);
  try {
    await supabase.from("queue_tokens").delete().eq("id", id);
  } catch {}
}

// Calculate Queue summary metrics
export function calculateQueueStats(tokens: QueueToken[]) {
  const total = tokens.length;
  const waiting = tokens.filter((t) => t.status === "Waiting");
  const serving = tokens.filter((t) => t.status === "Serving");
  const completed = tokens.filter((t) => t.status === "Completed");
  const cancelled = tokens.filter((t) => t.status === "Cancelled");

  const currentServing = serving.length > 0
    ? serving[serving.length - 1]
    : null;

  const nextWaiting = waiting.length > 0
    ? waiting.sort((a, b) => a.token_sequence - b.token_sequence)[0]
    : null;

  // Average wait estimate: ~5 minutes per waiting customer
  const estimatedWaitMinutes = waiting.length * 5;

  return {
    total,
    waitingCount: waiting.length,
    servingCount: serving.length,
    completedCount: completed.length,
    cancelledCount: cancelled.length,
    currentServing,
    nextWaiting,
    estimatedWaitMinutes,
  };
}

// Print 58mm / 80mm / A4 Queue Token Slip for Thermal Printer
export function printQueueTokenSlip(token: QueueToken) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const formattedTime = new Date(token.created_at).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = new Date(token.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/request-status`
    : `https://digital-den-gamma.vercel.app/request-status`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=2&data=${encodeURIComponent(trackingUrl)}`;

  let centerName = "DenBooks 360";
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("denbooks_current_tenant");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) centerName = parsed.name;
      }
    } catch {}
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Token - ${token.token_number} - ${centerName}</title>
        <style id="dynamic-page-style">
          @page { size: 80mm auto; margin: 3mm; }
          @media print { body { width: 72mm; margin: 0 auto !important; } }
        </style>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
            color: #000;
            background: #fff;
            font-size: 11.5px;
            line-height: 1.35;
            padding: 6px;
          }
          .no-print {
            background: #f1f5f9;
            padding: 8px 12px;
            margin-bottom: 12px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .mode-btn {
            background: #fff;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 4px 10px;
            font-size: 10px;
            cursor: pointer;
            font-weight: 600;
          }
          .mode-btn.active {
            background: #0284c7;
            color: #fff;
            border-color: #0284c7;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
          .receipt-wrap { width: 100%; margin: 0 auto; text-align: center; }
          .receipt-58mm { max-width: 52mm; font-size: 9.5px; }
          .receipt-80mm { max-width: 76mm; font-size: 11.5px; }
          .receipt-a4 { max-width: 140mm; font-size: 13px; }
          .shop-title { font-size: 16px; font-weight: 900; letter-spacing: 0.5px; }
          .shop-sub { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #333; margin-top: 1px; }
          .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
          .divider-double { border-bottom: 2px solid #000; margin: 6px 0; }
          .token-box {
            margin: 8px 0;
            padding: 8px 0;
            border: 2px dashed #000;
            border-radius: 6px;
          }
          .token-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
          .token-number {
            font-size: 38px;
            font-weight: 950;
            font-family: monospace;
            line-height: 1.1;
            margin: 2px 0;
          }
          .fcfs-tag {
            display: inline-block;
            font-size: 8.5px;
            font-weight: 800;
            background: #000;
            color: #fff;
            padding: 2px 6px;
            border-radius: 3px;
            text-transform: uppercase;
          }
          .meta-table { width: 100%; font-size: inherit; margin: 6px 0; text-align: left; }
          .meta-table td { padding: 2px 0; vertical-align: top; }
          .right { text-align: right; }
          .bold { font-weight: 800; }
          .qr-sec { margin: 8px 0 4px; }
          .qr-sec img { width: 85px; height: 85px; display: inline-block; }
          .footer-note { font-size: 8.5px; color: #333; line-height: 1.3; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="no-print">
          <span style="font-size: 11px; font-weight: 700;">Printer Mode:</span>
          <div style="display: flex; gap: 4px;">
            <button class="mode-btn" data-mode="58mm" onclick="setPrinterMode('58mm')">58mm Thermal</button>
            <button class="mode-btn active" data-mode="80mm" onclick="setPrinterMode('80mm')">80mm Thermal</button>
            <button class="mode-btn" data-mode="a4" onclick="setPrinterMode('a4')">A4 Slip</button>
          </div>
          <button class="mode-btn" style="background:#0284c7; color:#fff;" onclick="window.print()">Print</button>
        </div>

        <div id="receipt-container" class="receipt-wrap receipt-80mm">
          <div class="shop-title">${centerName}</div>
          <div class="shop-sub">Citizen Services • Online Application Desk</div>
          <div style="font-size: 9px; color: #444; margin-top: 2px;">CSC Digital Seva • Counter Reception</div>

          <div class="divider-double"></div>

          <div class="token-box">
            <div class="token-label">Queue Token Number</div>
            <div class="token-number">${token.token_number}</div>
            <div class="fcfs-tag">FIRST COME, FIRST SERVE</div>
          </div>

          <table class="meta-table">
            <tr>
              <td><strong>Date:</strong> ${formattedDate}</td>
              <td class="right"><strong>Time:</strong> ${formattedTime}</td>
            </tr>
            <tr>
              <td><strong>Customer:</strong></td>
              <td class="right bold">${token.customer_name}</td>
            </tr>
            ${token.customer_phone ? `
            <tr>
              <td><strong>Phone:</strong></td>
              <td class="right font-mono">${token.customer_phone}</td>
            </tr>
            ` : ""}
            <tr>
              <td><strong>Service:</strong></td>
              <td class="right bold">${token.service_requested}</td>
            </tr>
            ${token.counter_assigned ? `
            <tr>
              <td><strong>Destination:</strong></td>
              <td class="right bold">${token.counter_assigned}</td>
            </tr>
            ` : ""}
            ${token.priority && token.priority !== "Normal" ? `
            <tr>
              <td><strong>Priority:</strong></td>
              <td class="right bold" style="color: #b91c1c;">${token.priority}</td>
            </tr>
            ` : ""}
          </table>

          <div class="divider"></div>

          <div class="qr-sec">
            <img src="${qrCodeUrl}" alt="Token QR" />
            <p style="font-size: 8px; color: #555; margin-top: 2px;">Scan to check live queue status on your phone</p>
          </div>

          <div class="footer-note">
            <p><strong>Please take a seat in the waiting lounge.</strong></p>
            <p>Your token number will be announced at the counter.</p>
            <p style="margin-top: 4px; font-size: 8px; color: #666;">Issued by Reception: ${token.employee_name || "Receptionist"}</p>
          </div>
        </div>

        <script>
          function setPrinterMode(mode) {
            try { localStorage.setItem('dd_receipt_mode', mode); } catch (e) {}
            var container = document.getElementById('receipt-container');
            if (container) container.className = 'receipt-wrap receipt-' + mode;
            document.querySelectorAll('.mode-btn').forEach(function(btn) {
              if (btn.getAttribute('data-mode') === mode) btn.classList.add('active');
              else btn.classList.remove('active');
            });
            var pageStyle = document.getElementById('dynamic-page-style');
            if (pageStyle) {
              if (mode === '58mm') pageStyle.innerHTML = '@page { size: 58mm auto; margin: 2mm; } @media print { body { width: 48mm; margin: 0 auto !important; } }';
              else if (mode === 'a4') pageStyle.innerHTML = '@page { size: A4 portrait; margin: 15mm; } @media print { body { width: 140mm; margin: 0 auto !important; } }';
              else pageStyle.innerHTML = '@page { size: 80mm auto; margin: 3mm; } @media print { body { width: 72mm; margin: 0 auto !important; } }';
            }
          }
          window.onload = function() {
            var saved = '80mm';
            try { saved = localStorage.getItem('dd_receipt_mode') || '80mm'; } catch(e) {}
            setPrinterMode(saved);
            setTimeout(function() { window.print(); }, 250);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
