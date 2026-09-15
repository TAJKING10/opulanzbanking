"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PayloadFile {
  filename: string;
  size?: number;
  type?: string;
  id?: string;
  url?: string;
  blobName?: string;
}

interface Submission {
  id: string | number;
  rawId: number;
  source: string;
  service: string;
  status: string;
  clientName: string;
  clientEmail: string | null;
  confirmationNumber?: string;
  payload: Record<string, unknown>;
  payloadFiles?: PayloadFile[];
  createdAt: string;
}

interface SupportChat {
  id: number;
  visitor_name: string;
  visitor_email: string;
  status: string;
  last_message: string | null;
  message_count: number;
  last_message_at: string;
  created_at: string;
  messages?: SupportMessage[];
}

interface SupportMessage {
  id: number;
  sender_type: "visitor" | "admin";
  sender_name: string;
  content: string;
  created_at: string;
}

interface Stats {
  summary: Record<string, number>;
  recentActivity?: {
    submissions: Array<{
      id: string | number;
      service: string;
      status: string;
      clientName: string;
      clientEmail: string | null;
      createdAt: string;
    }>;
    openChats: Array<{
      id: number;
      visitor_name: string;
      visitor_email: string;
      status: string;
      last_message: string | null;
      last_message_at: string;
      created_at: string;
    }>;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SERVICES = [
  { key: "all",                label: "All Services",        color: "bg-gray-500" },
  { key: "individual",         label: "Individual Account",  color: "bg-blue-500" },
  { key: "company",            label: "Company Account",     color: "bg-indigo-500" },
  { key: "company_formation",  label: "Company Formation",   color: "bg-purple-500" },
  { key: "accounting",         label: "Accounting",          color: "bg-emerald-500" },
  { key: "mortgage",           label: "Mortgage Application",color: "bg-amber-600" },
  { key: "tax_advisory",       label: "Tax Advisory",        color: "bg-amber-500" },
  { key: "life_insurance",     label: "Life Insurance",      color: "bg-red-500" },
  { key: "investment_advisory",label: "Investment Advisory", color: "bg-cyan-500" },
];

const SERVICE_EMAILS: Record<string, string> = {
  tax_advisory:        "tax-ad@opulanz.com",
  investment_advisory: "invest-ad@opulanz.com",
  life_insurance:      "insurance@opulanz.com",
  open_account:        "info@opulanz.com",
  individual:          "info@opulanz.com",
  company:             "company-set@opulanz.com",
  company_formation:   "company-set@opulanz.com",
  accounting:          "accounting@opulanz.com",
  mortgage:            "mortgages@opulanz.com",
};

const SERVICE_LABELS: Record<string, string> = {
  individual: "Individual Account",
  company: "Company Account",
  company_formation: "Company Formation",
  accounting: "Accounting",
  mortgage: "Mortgage Application",
  tax_advisory: "Tax Advisory",
  life_insurance: "Life Insurance",
  investment_advisory: "Investment Advisory",
};

const STATUS_COLORS: Record<string, string> = {
  submitted:    "bg-blue-100 text-blue-700",
  confirmed:    "bg-green-100 text-green-700",
  approved:     "bg-green-100 text-green-700",
  under_review: "bg-yellow-100 text-yellow-700",
  pending:      "bg-yellow-100 text-yellow-700",
  waiting:      "bg-orange-100 text-orange-700",
  active:       "bg-blue-100 text-blue-700",
  rejected:     "bg-red-100 text-red-700",
  cancelled:    "bg-red-100 text-red-700",
  closed:       "bg-gray-100 text-gray-600",
  draft:        "bg-gray-100 text-gray-600",
  scheduled:    "bg-blue-100 text-blue-700",
  completed:    "bg-green-100 text-green-700",
  new:          "bg-blue-100 text-blue-700",
  contacted:    "bg-cyan-100 text-cyan-700",
  qualified:    "bg-indigo-100 text-indigo-700",
  converted:    "bg-green-100 text-green-700",
  no_show:      "bg-red-100 text-red-700",
};

/** Allowed status transitions per submission source (must match backend) */
const STATUS_OPTIONS: Record<string, string[]> = {
  application:        ["submitted", "under_review", "approved", "rejected"],
  tax_booking:        ["pending", "confirmed", "completed", "cancelled"],
  life_booking:       ["pending", "confirmed", "completed", "cancelled"],
  appointment:        ["scheduled", "confirmed", "completed", "cancelled", "no_show"],
  investment_inquiry:["new", "contacted", "qualified", "converted", "closed"],
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("admin_token") || "";
}

/** Resolve a viewable URL — refreshes Azure SAS via blobName when needed */
async function resolveFileUrl(opts: { url?: string | null; blobName?: string | null }): Promise<string | null> {
  if (opts.blobName) {
    try {
      const res = await fetch(`${API}/api/admin/file-url?blobName=${encodeURIComponent(opts.blobName)}`, {
        headers: { "x-admin-token": getToken() },
      });
      const data = await res.json();
      if (data.success && data.url) return data.url as string;
    } catch {
      // fall through to stored url
    }
  }
  return opts.url || null;
}

/**
 * Force a real file download.
 * Cross-origin Azure URLs ignore the HTML `download` attribute and just open in a tab —
 * so we stream via our same-origin admin proxy whenever blobName is available.
 */
async function forceDownloadFile(opts: {
  fileName: string;
  url?: string | null;
  blobName?: string | null;
}): Promise<boolean> {
  try {
    let blob: Blob | null = null;

    if (opts.blobName) {
      const res = await fetch(
        `${API}/api/admin/download-file?blobName=${encodeURIComponent(opts.blobName)}&fileName=${encodeURIComponent(opts.fileName)}`,
        { headers: { "x-admin-token": getToken() } }
      );
      if (res.ok) {
        blob = await res.blob();
      } else if (opts.url) {
        // Live often returns 503 when AZURE_STORAGE_* env vars are missing — fall back to stored URL
        console.warn(`download-file returned ${res.status}; falling back to stored URL`);
        const fallback = await fetch(opts.url);
        if (!fallback.ok) throw new Error(`Download failed (${res.status})`);
        blob = await fallback.blob();
      } else {
        let detail = "";
        try {
          const errJson = await res.json();
          detail = errJson?.error ? `: ${errJson.error}` : "";
        } catch { /* ignore */ }
        throw new Error(`Download failed (${res.status})${detail}`);
      }
    } else if (opts.url) {
      const res = await fetch(opts.url);
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      blob = await res.blob();
    }

    if (!blob) return false;

    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = opts.fileName || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch (err) {
    console.error("forceDownloadFile failed:", err);
    return false;
  }
}

function fmt(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function isFileLikeRecord(v: unknown): boolean {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  const url = o.url || o.fileUrl || o.file_url;
  const blob = o.blobName || o.blob_name;
  const name = o.filename || o.fileName || o.name;
  const hasUrl = typeof url === "string" && /^https?:\/\//i.test(url);
  const hasBlob = typeof blob === "string" && blob.length > 0;
  return (hasUrl || hasBlob) && !!(name || hasUrl || hasBlob);
}

function toPayloadFile(f: Record<string, unknown>, fallbackType?: string): PayloadFile {
  return {
    filename: String(f.filename || f.fileName || f.name || "Document"),
    size: typeof f.size === "number" ? f.size : typeof f.fileSize === "number" ? f.fileSize : typeof f.file_size === "number" ? f.file_size : undefined,
    type: String(f.type || f.documentType || fallbackType || "uploaded_file"),
    id: f.id != null ? String(f.id) : undefined,
    url: (f.url || f.fileUrl || f.file_url) as string | undefined,
    blobName: (f.blobName || f.blob_name) as string | undefined,
  };
}

/** Walk nested investment-advisory payloads for Azure files + signed QCC. */
function collectSubmissionFiles(payload: Record<string, unknown> | null | undefined): PayloadFile[] {
  const out: PayloadFile[] = [];
  const seen = new Set<string>();
  const push = (f: PayloadFile) => {
    if (!f.url && !f.blobName) return;
    const key = `${f.blobName || ""}|${f.url || ""}|${f.filename}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(f);
  };

  const walk = (node: unknown, hint?: string) => {
    if (node == null) return;
    if (Array.isArray(node)) {
      node.forEach((item) => {
        if (isFileLikeRecord(item)) push(toPayloadFile(item as Record<string, unknown>, hint));
        else walk(item, hint);
      });
      return;
    }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (isFileLikeRecord(obj)) {
      push(toPayloadFile(obj, hint));
      return;
    }
    if (typeof obj.signedDocumentUrl === "string" && obj.signedDocumentUrl) {
      push({
        filename: String(obj.signedDocumentFilename || "Signed_QCC_Agreement.pdf"),
        size: typeof obj.signedDocumentSize === "number" ? obj.signedDocumentSize : undefined,
        type: "signed_contract",
        url: obj.signedDocumentUrl,
        blobName: typeof obj.signedDocumentBlobName === "string" ? obj.signedDocumentBlobName : undefined,
      });
    }
    for (const [k, v] of Object.entries(obj)) {
      if (
        k === "signedDocumentUrl" ||
        k === "signedDocumentFilename" ||
        k === "signedDocumentBlobName" ||
        k === "signedDocumentSize"
      ) {
        continue;
      }
      walk(v, k);
    }
  };

  walk(payload);
  return out;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = React.useState<"overview" | "submissions" | "pipeline" | "support" | "contacts" | "help" | "inbox">("overview");
  const [submissionService, setSubmissionService] = React.useState("all");
  const [submissionSearch, setSubmissionSearch] = React.useState("");
  const [pipelineService, setPipelineService] = React.useState("company_formation");
  const [contactSearch, setContactSearch] = React.useState("");
  const [selectedChatId, setSelectedChatId] = React.useState<number | null>(null);

  // Check auth
  React.useEffect(() => {
    if (!localStorage.getItem("admin_token")) router.replace("/admin");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.replace("/admin");
  };

  const openSubmissions = (serviceKey: string, search = "") => {
    setSubmissionService(serviceKey);
    setSubmissionSearch(search);
    setTab("submissions");
  };

  const openSupport = (chatId: number | null = null) => {
    setSelectedChatId(chatId);
    setTab("support");
  };

  const openContacts = (search = "") => {
    setContactSearch(search);
    setTab("contacts");
  };

  const handleGlobalSelect = (item: {
    type: "submission" | "contact" | "chat";
    id: string | number;
    service?: string;
    title?: string;
    email?: string;
    subtitle?: string;
  }) => {
    if (item.type === "submission") {
      openSubmissions(item.service || "all", item.email || item.title || String(item.id));
    } else if (item.type === "contact") {
      openContacts(item.email || item.title || String(item.id));
    } else if (item.type === "chat") {
      openSupport(Number(item.id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f8]">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-shrink-0">
            <span className="text-lg font-bold tracking-widest text-[#b59354]">OPULANZ</span>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider hidden sm:inline">Admin Panel</span>
          </div>
          <GlobalSearchBar onSelect={handleGlobalSelect} />
          <div className="flex items-center gap-4 flex-shrink-0">
            <nav className="flex gap-1">
              {([
                { key: "overview",     label: "Overview" },
                { key: "inbox",        label: "Inbox" },
                { key: "contacts",     label: "Support Messages" },
                { key: "support",      label: "Live Chats" },
                { key: "submissions",  label: "Submissions" },
                { key: "pipeline",     label: "Pipeline" },
                { key: "help",         label: "Help" },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => {
                    if (t.key === "submissions") {
                      setSubmissionService("all");
                      setSubmissionSearch("");
                    }
                    if (t.key === "contacts") setContactSearch("");
                    if (t.key === "support") setSelectedChatId(null);
                    setTab(t.key);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === t.key
                      ? "bg-[#b59354] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6">
        {tab === "overview"     && (
          <OverviewTab onOpenSubmissions={openSubmissions} onOpenSupport={() => openSupport()} onOpenInbox={() => setTab("inbox")} />
        )}
        {tab === "contacts"     && (
          <ContactsTab initialSearch={contactSearch} />
        )}
        {tab === "submissions"  && (
          <SubmissionsTab
            initialService={submissionService}
            initialSearch={submissionSearch}
            onServiceChange={setSubmissionService}
          />
        )}
        {tab === "pipeline" && (
          <PipelineTab
            initialService={pipelineService}
            onServiceChange={setPipelineService}
            onOpenSubmission={(serviceKey, search) => {
              setSubmissionService(serviceKey);
              setSubmissionSearch(search);
              setTab("submissions");
            }}
          />
        )}
        {tab === "support"      && (
          <SupportTab initialChatId={selectedChatId} />
        )}
        {tab === "inbox"        && <InboxTab />}
        {tab === "help"         && <HelpTab />}
      </main>
    </div>
  );
}

// ─── Global Search ────────────────────────────────────────────────────────────
type GlobalSearchItem = {
  type: "submission" | "contact" | "chat";
  id: string | number;
  status?: string;
  service?: string;
  title: string;
  subtitle?: string;
  email?: string;
  createdAt?: string;
};

function GlobalSearchBar({
  onSelect,
}: {
  onSelect: (item: GlobalSearchItem) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    submissions: GlobalSearchItem[];
    contacts: GlobalSearchItem[];
    chats: GlobalSearchItem[];
  }>({ submissions: [], contacts: [], chats: [] });
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults({ submissions: [], contacts: [], chats: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(`${API}/api/admin/search?q=${encodeURIComponent(q)}`, {
        headers: { "x-admin-token": getToken() },
      })
        .then(r => {
          if (r.status === 401) {
            localStorage.removeItem("admin_token");
            window.location.href = "/admin";
            return null;
          }
          return r.json();
        })
        .then(d => {
          if (d?.success) {
            setResults({
              submissions: d.data.submissions || [],
              contacts: d.data.contacts || [],
              chats: d.data.chats || [],
            });
            setOpen(true);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const total =
    results.submissions.length + results.contacts.length + results.chats.length;

  const pick = (item: GlobalSearchItem) => {
    onSelect(item);
    setQuery("");
    setOpen(false);
  };

  const Section = ({
    label,
    items,
  }: {
    label: string;
    items: GlobalSearchItem[];
  }) => {
    if (!items.length) return null;
    return (
      <div className="py-1">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        {items.map(item => (
          <button
            key={`${item.type}-${item.id}`}
            type="button"
            onClick={() => pick(item)}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-500 truncate">
                  {item.service
                    ? `${SERVICE_LABELS[item.service] || item.service} · `
                    : ""}
                  {item.subtitle}
                </p>
              </div>
              {item.status && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-600"}`}>
                  {item.status.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div ref={wrapRef} className="relative flex-1 max-w-md hidden md:block">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
        </svg>
        <input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Search submissions, contacts, chats..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b59354]"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[#b59354] border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[420px] overflow-y-auto">
          {loading && total === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">Searching...</p>
          ) : total === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">No matches for “{query.trim()}”</p>
          ) : (
            <>
              <Section label="Submissions" items={results.submissions} />
              <Section label="Support Messages" items={results.contacts} />
              <Section label="Live Chats" items={results.chats} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  onOpenSubmissions,
  onOpenSupport,
  onOpenInbox,
}: {
  onOpenSubmissions: (serviceKey: string) => void;
  onOpenSupport: () => void;
  onOpenInbox: () => void;
}) {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [inboxPreview, setInboxPreview] = React.useState<Array<{uid:number;subject:string;from:string;fromEmail:string;date:string;seen:boolean}>>([]);
  const [inboxLoading, setInboxLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${API}/api/admin/stats`, { headers: { "x-admin-token": getToken() } })
      .then(r => {
        if (r.status === 401) { localStorage.removeItem("admin_token"); window.location.href = "/admin"; return null; }
        return r.json();
      })
      .then(d => { if (d && d.success) setStats(d.data); })
      .catch(err => console.error("Stats fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetch(`${API}/api/admin/inbox?limit=5`, { headers: { "x-admin-token": getToken() } })
      .then(r => r.json())
      .then(d => { if (d?.success) setInboxPreview(d.data.slice(0, 5)); })
      .catch(() => {})
      .finally(() => setInboxLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const s = stats?.summary || {};
  const cards: Array<{
    label: string;
    value: number;
    color: string;
    icon: string;
    action: "submissions" | "support";
    serviceKey?: string;
  }> = [
    { label: "Individual Accounts", value: s.individual || 0,          color: "from-blue-500 to-blue-600",      icon: "👤", action: "submissions", serviceKey: "individual" },
    { label: "Company Accounts",    value: s.company || 0,             color: "from-indigo-500 to-indigo-600",  icon: "🏢", action: "submissions", serviceKey: "company" },
    { label: "Company Formation",   value: s.company_formation || 0,   color: "from-purple-500 to-purple-600",  icon: "⚖️", action: "submissions", serviceKey: "company_formation" },
    { label: "Accounting",          value: s.accounting || 0,          color: "from-emerald-500 to-emerald-600",icon: "📊", action: "submissions", serviceKey: "accounting" },
    { label: "Mortgage",            value: s.mortgage || 0,            color: "from-amber-600 to-amber-700",    icon: "🏠", action: "submissions", serviceKey: "mortgage" },
    { label: "Tax Advisory",        value: s.tax_advisory || 0,        color: "from-amber-500 to-amber-600",    icon: "🧾", action: "submissions", serviceKey: "tax_advisory" },
    { label: "Life Insurance",      value: s.life_insurance || 0,      color: "from-red-500 to-red-600",        icon: "❤️", action: "submissions", serviceKey: "life_insurance" },
    { label: "Investment Advisory", value: s.investment_advisory || 0, color: "from-cyan-500 to-cyan-600",      icon: "📈", action: "submissions", serviceKey: "investment_advisory" },
    { label: "Support Chats Open",  value: s.support_open || 0,        color: "from-orange-500 to-orange-600",  icon: "💬", action: "support" },
  ];

  const total = (s.individual||0)+(s.company||0)+(s.company_formation||0)+
                (s.accounting||0)+(s.mortgage||0)+(s.tax_advisory||0)+(s.life_insurance||0)+
                (s.investment_advisory||0);

  const recentSubs = stats?.recentActivity?.submissions || [];
  const openChats = stats?.recentActivity?.openChats || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">Total submissions across all services: <strong>{total}</strong></p>
        <p className="text-xs text-gray-400 mt-1">Click a card to view its list</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
          <button
            key={card.label}
            type="button"
            onClick={() => {
              if (card.action === "support") onOpenSupport();
              else if (card.serviceKey) onOpenSubmissions(card.serviceKey);
            }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left transition-all hover:shadow-md hover:border-[#b59354]/60 focus:outline-none focus:ring-2 focus:ring-[#b59354]/40"
          >
            <div className={`bg-gradient-to-r ${card.color} p-4 flex items-center justify-between`}>
              <span className="text-white font-bold text-2xl">{card.value}</span>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-700">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">Recent submissions</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest 5 across all services</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenSubmissions("all")}
              className="text-xs font-medium text-[#b59354] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSubs.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No submissions yet</p>
            ) : (
              recentSubs.map(item => (
                <button
                  key={String(item.id)}
                  type="button"
                  onClick={() => onOpenSubmissions(item.service)}
                  className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.clientName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {SERVICE_LABELS[item.service] || item.service.replace(/_/g, " ")}
                        {item.clientEmail ? ` · ${item.clientEmail}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-600"}`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-gray-400">{fmt(item.createdAt)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">Open chats</h3>
              <p className="text-xs text-gray-400 mt-0.5">Waiting and active conversations</p>
            </div>
            <button
              type="button"
              onClick={onOpenSupport}
              className="text-xs font-medium text-[#b59354] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {openChats.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No open chats</p>
            ) : (
              openChats.map(chat => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={onOpenSupport}
                  className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{chat.visitor_name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {chat.last_message || chat.visitor_email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[chat.status] || "bg-gray-100 text-gray-600"}`}>
                        {chat.status}
                      </span>
                      <span className="text-[10px] text-gray-400">{fmt(chat.last_message_at || chat.created_at)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Inbox preview — shown before Service Email Routing */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Inbox — contact@opulanz.com</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest client emails (support &amp; applications)</p>
          </div>
          <div className="flex items-center gap-3">
            {inboxPreview.filter(m => !m.seen).length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                {inboxPreview.filter(m => !m.seen).length} unread
              </span>
            )}
            <button
              type="button"
              onClick={onOpenInbox}
              className="text-xs font-medium text-[#b59354] hover:underline"
            >
              Open Inbox
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {inboxLoading ? (
            <div className="px-6 py-5 text-sm text-gray-400">Loading…</div>
          ) : inboxPreview.length === 0 ? (
            <div className="px-6 py-5 text-sm text-gray-400 text-center">No client emails found</div>
          ) : (
            inboxPreview.map(msg => (
              <button
                key={msg.uid}
                type="button"
                onClick={onOpenInbox}
                className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-2">
                    {!msg.seen && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-[#b59354] flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${!msg.seen ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{msg.from}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 pt-0.5">{fmt(msg.date)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Service Email Routing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(SERVICE_EMAILS).filter(([k]) => !["open_account"].includes(k)).map(([service, email]) => (
            <div key={service} className="flex items-center justify-between py-2 px-4 rounded-lg bg-gray-50">
              <span className="text-sm font-medium text-gray-700 capitalize">{service.replace(/_/g," ")}</span>
              <a href={`mailto:${email}`} className="text-sm text-[#b59354] font-mono hover:underline">{email}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Map admin service filter → submission source (for status columns + PATCH) */
const SERVICE_TO_SOURCE: Record<string, string> = {
  individual: "application",
  company: "application",
  company_formation: "application",
  accounting: "application",
  mortgage: "application",
  tax_advisory: "tax_booking",
  life_insurance: "life_booking",
  investment_advisory: "application",
};

const PIPELINE_SERVICES = SERVICES.filter(s => s.key !== "all");

const COLUMN_ACCENTS: Record<string, string> = {
  submitted: "border-t-blue-500",
  under_review: "border-t-amber-500",
  approved: "border-t-green-500",
  rejected: "border-t-red-500",
  draft: "border-t-gray-400",
  pending: "border-t-amber-500",
  confirmed: "border-t-blue-500",
  completed: "border-t-green-500",
  cancelled: "border-t-red-500",
  scheduled: "border-t-indigo-500",
  no_show: "border-t-red-500",
  new: "border-t-blue-500",
  contacted: "border-t-cyan-500",
  qualified: "border-t-violet-500",
  converted: "border-t-green-500",
  closed: "border-t-gray-500",
};

// ─── Pipeline Tab (Kanban) ────────────────────────────────────────────────────
function PipelineTab({
  initialService = "company_formation",
  onServiceChange,
  onOpenSubmission,
}: {
  initialService?: string;
  onServiceChange?: (service: string) => void;
  onOpenSubmission?: (service: string, search: string) => void;
}) {
  const [service, setService] = React.useState(
    initialService === "all" ? "company_formation" : initialService
  );
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState("");
  const [draggingId, setDraggingId] = React.useState<string | number | null>(null);
  const [dropTarget, setDropTarget] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | number | null>(null);
  const [rejectModal, setRejectModal] = React.useState<{
    sub: Submission;
    status: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const source = SERVICE_TO_SOURCE[service] || "application";
  const columns = STATUS_OPTIONS[source] || STATUS_OPTIONS.application;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ service });
    fetch(`${API}/api/admin/submissions?${params}`, {
      headers: { "x-admin-token": getToken() },
    })
      .then(r => {
        if (r.status === 401) {
          localStorage.removeItem("admin_token");
          window.location.href = "/admin";
          return null;
        }
        return r.json();
      })
      .then(d => {
        if (d?.success) setSubmissions(d.data);
      })
      .catch(err => console.error("Pipeline fetch error:", err))
      .finally(() => setLoading(false));
  }, [service]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (initialService && initialService !== "all") setService(initialService);
  }, [initialService]);

  const changeService = (next: string) => {
    setService(next);
    onServiceChange?.(next);
  };

  const byStatus = React.useMemo(() => {
    const map: Record<string, Submission[]> = {};
    for (const col of columns) map[col] = [];
    map.__other = [];
    for (const sub of submissions) {
      if (map[sub.status]) map[sub.status].push(sub);
      else map.__other.push(sub);
    }
    // Newest first within each column
    for (const key of Object.keys(map)) {
      map[key].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return map;
  }, [submissions, columns]);

  const applyStatus = async (sub: Submission, newStatus: string, rejectionReason?: string) => {
    if (sub.status === newStatus) return;
    const allowed = STATUS_OPTIONS[sub.source] || [];
    if (!allowed.includes(newStatus)) {
      showToast(`Cannot move to "${newStatus.replace(/_/g, " ")}" for this item.`);
      return;
    }

    setUpdatingId(sub.id);
    const prevStatus = sub.status;
    // Optimistic
    setSubmissions(prev =>
      prev.map(s => (s.id === sub.id ? { ...s, status: newStatus } : s))
    );

    try {
      const res = await fetch(`${API}/api/admin/submissions/${sub.source}/${sub.rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "rejected" && rejectionReason
            ? { rejection_reason: rejectionReason }
            : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Moved to ${newStatus.replace(/_/g, " ")}`);
      } else {
        setSubmissions(prev =>
          prev.map(s => (s.id === sub.id ? { ...s, status: prevStatus } : s))
        );
        showToast(`Error: ${data.error}`);
      }
    } catch {
      setSubmissions(prev =>
        prev.map(s => (s.id === sub.id ? { ...s, status: prevStatus } : s))
      );
      showToast("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDrop = (status: string) => {
    setDropTarget(null);
    const sub = submissions.find(s => s.id === draggingId);
    setDraggingId(null);
    if (!sub || sub.status === status) return;

    if (status === "rejected") {
      setRejectModal({ sub, status });
      setRejectReason("");
      return;
    }
    applyStatus(sub, status);
  };

  const serviceMeta = PIPELINE_SERVICES.find(s => s.key === service);

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header / filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Pipeline Board</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Drag cards across columns to update status · Click a card to open full details
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={service}
            onChange={e => changeService(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] bg-white min-w-[200px]"
          >
            {PIPELINE_SERVICES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Service chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PIPELINE_SERVICES.map(s => (
          <button
            key={s.key}
            type="button"
            onClick={() => changeService(s.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              service === s.key
                ? "bg-[#b59354] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#b59354]/40"
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${s.color}`} />
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4 min-h-[520px]">
          {[...columns, ...(byStatus.__other?.length ? ["__other"] : [])].map(status => {
            const cards = byStatus[status] || [];
            const isOther = status === "__other";
            const label = isOther ? "inquiries / other" : status.replace(/_/g, " ");
            const isOver = dropTarget === status;
            return (
              <div
                key={status}
                onDragOver={e => {
                  if (isOther) return;
                  e.preventDefault();
                  setDropTarget(status);
                }}
                onDragLeave={() => setDropTarget(prev => (prev === status ? null : prev))}
                onDrop={e => {
                  if (isOther) return;
                  e.preventDefault();
                  handleDrop(status);
                }}
                className={`flex-shrink-0 w-[280px] flex flex-col rounded-2xl border bg-gray-50/80 border-t-4 ${
                  COLUMN_ACCENTS[status] || "border-t-gray-400"
                } ${isOver ? "border-[#b59354] bg-[#b59354]/5" : "border-gray-200"}`}
              >
                <div className="px-3 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
                      {label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 tabular-nums">{cards.length}</span>
                </div>

                <div className="flex-1 px-2 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {cards.length === 0 ? (
                    <div className="mx-1 py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      Drop here
                    </div>
                  ) : (
                    cards.map(sub => (
                      <div
                        key={sub.id}
                        draggable={updatingId !== sub.id}
                        onDragStart={() => setDraggingId(sub.id)}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropTarget(null);
                        }}
                        onClick={() =>
                          onOpenSubmission?.(
                            sub.service || service,
                            sub.clientEmail || sub.clientName || String(sub.id)
                          )
                        }
                        className={`bg-white rounded-xl border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-[#b59354]/50 hover:shadow transition-all ${
                          draggingId === sub.id ? "opacity-40 scale-[0.98]" : ""
                        } ${updatingId === sub.id ? "opacity-60 pointer-events-none" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                            {sub.clientName || "N/A"}
                          </p>
                          <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${serviceMeta?.color || "bg-gray-400"}`} />
                        </div>
                        {sub.clientEmail && (
                          <p className="text-[11px] text-gray-500 truncate mb-2">{sub.clientEmail}</p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-gray-400 capitalize truncate">
                            {(sub.service || service).replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {sub.createdAt
                              ? new Date(sub.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              : ""}
                          </span>
                        </div>
                        {updatingId === sub.id && (
                          <p className="text-[10px] text-[#b59354] mt-2">Updating…</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {(byStatus.__other?.length || 0) > 0 && (
            <div className="flex-shrink-0 w-[280px] flex flex-col rounded-2xl border border-gray-200 bg-gray-50/80 border-t-4 border-t-gray-400">
              <div className="px-3 py-3 flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600">
                  other
                </span>
                <span className="text-xs font-bold text-gray-500">{byStatus.__other.length}</span>
              </div>
              <div className="flex-1 px-2 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
                {byStatus.__other.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() =>
                      onOpenSubmission?.(
                        sub.service || service,
                        sub.clientEmail || sub.clientName || String(sub.id)
                      )
                    }
                    className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm cursor-pointer hover:border-[#b59354]/50"
                  >
                    <p className="text-sm font-semibold text-gray-900">{sub.clientName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{sub.clientEmail}</p>
                    <p className="text-[10px] text-amber-600 mt-1 capitalize">
                      status: {sub.status.replace(/_/g, " ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setRejectModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reject submission</h3>
            <p className="text-sm text-gray-500 mb-4">
              {rejectModal.sub.clientName}
              {rejectModal.sub.clientEmail ? ` · ${rejectModal.sub.clientEmail}` : ""}
            </p>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Rejection reason
            </label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Optional note for the record…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { sub, status } = rejectModal;
                  setRejectModal(null);
                  await applyStatus(sub, status, rejectReason.trim() || undefined);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Submissions Tab ──────────────────────────────────────────────────────────
function SubmissionsTab({
  initialService = "all",
  initialSearch = "",
  onServiceChange,
}: {
  initialService?: string;
  initialSearch?: string;
  onServiceChange?: (service: string) => void;
}) {
  const [submissions, setSubmissions]   = React.useState<Submission[]>([]);
  const [loading, setLoading]           = React.useState(true);
  const [service, setService]           = React.useState(initialService);
  const [search, setSearch]             = React.useState(initialSearch);
  const [selected, setSelected]         = React.useState<Submission | null>(null);
  const [replyOpen, setReplyOpen]       = React.useState(false);
  const [replySending, setReplySending] = React.useState(false);
  const [replyMsg, setReplyMsg]         = React.useState("");
  const [replySubject, setReplySubject] = React.useState("");
  const [toast, setToast]               = React.useState("");
  const [replies, setReplies]           = React.useState<Array<{id:number;subject:string|null;message:string;sent_at:string;attachments?:any[]}>>([]);
  const [notes, setNotes]               = React.useState<Array<{id:number;author_name:string;note:string;created_at:string}>>([]);
  const [noteText, setNoteText]         = React.useState("");
  const [noteSaving, setNoteSaving]     = React.useState(false);
  const [docs, setDocs]                 = React.useState<Array<{id:number;file_name:string;file_url:string;mime_type:string|null;type:string}>>([]);
  const [attachFiles, setAttachFiles]   = React.useState<File[]>([]);
  const [attachDocs, setAttachDocs]     = React.useState<number[]>([]);
  const [statusUpdating, setStatusUpdating] = React.useState(false);
  const [rejectReason, setRejectReason]  = React.useState("");
  const [previewDoc, setPreviewDoc]     = React.useState<{ url: string; name: string; blobName?: string } | null>(null);
  const fileInputRef                    = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setService(initialService);
    setSelected(null);
    setReplyOpen(false);
  }, [initialService]);

  React.useEffect(() => {
    setSearch(initialSearch || "");
    setSelected(null);
    setReplyOpen(false);
  }, [initialSearch]);

  const changeService = (next: string) => {
    setService(next);
    setSelected(null);
    setReplyOpen(false);
    onServiceChange?.(next);
  };

  const load = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ service });
    if (search) params.set("search", search);
    fetch(`${API}/api/admin/submissions?${params}`, {
      headers: { "x-admin-token": getToken() },
    })
      .then(r => {
        if (r.status === 401) { localStorage.removeItem("admin_token"); window.location.href = "/admin"; return null; }
        return r.json();
      })
      .then(d => { if (d && d.success) setSubmissions(d.data); })
      .catch(err => console.error("Submissions fetch error:", err))
      .finally(() => setLoading(false));
  }, [service, search]);

  React.useEffect(() => { load(); }, [load]);

  // When opened from Pipeline with a search, auto-select the best match
  React.useEffect(() => {
    if (!initialSearch || loading || submissions.length === 0) return;
    const q = initialSearch.toLowerCase();
    const match =
      submissions.find(s => s.clientEmail?.toLowerCase() === q) ||
      submissions.find(s => s.clientName?.toLowerCase() === q) ||
      submissions.find(s =>
        s.clientEmail?.toLowerCase().includes(q) ||
        s.clientName?.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      ) ||
      submissions[0];
    if (match) {
      setSelected(match);
      setReplyOpen(false);
      setReplies([]);
      setNotes([]);
      setNoteText("");
      setDocs([]);
      loadReplies(match);
      loadNotes(match);
      loadDocs(match);
    }
    // intentionally only when incoming search / list settles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearch, loading, submissions]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadReplies = (sub: Submission) => {
    const ref = sub.confirmationNumber || String(sub.id);
    fetch(`${API}/api/admin/replies/${encodeURIComponent(ref)}`, {
      headers: { "x-admin-token": getToken() },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setReplies(d.data); })
      .catch(() => {});
  };

  const loadNotes = (sub: Submission) => {
    const ref = sub.confirmationNumber || String(sub.id);
    fetch(`${API}/api/admin/notes/${encodeURIComponent(ref)}`, {
      headers: { "x-admin-token": getToken() },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setNotes(d.data); })
      .catch(() => setNotes([]));
  };

  const addNote = async () => {
    if (!selected || !noteText.trim() || noteSaving) return;
    setNoteSaving(true);
    const ref = selected.confirmationNumber || String(selected.id);
    try {
      const res = await fetch(`${API}/api/admin/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({
          submissionRef: ref,
          note: noteText.trim(),
          authorName: "Admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes(prev => [...prev, data.data]);
        setNoteText("");
        showToast("Internal note saved (not emailed).");
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch {
      showToast("Failed to save note.");
    } finally {
      setNoteSaving(false);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/admin/notes/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": getToken() },
      });
      const data = await res.json();
      if (data.success) {
        setNotes(prev => prev.filter(n => n.id !== id));
        showToast("Note deleted.");
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch {
      showToast("Failed to delete note.");
    }
  };

  const loadDocs = (sub: Submission) => {
    const walked = collectSubmissionFiles(sub.payload);
    const combined = [...(sub.payloadFiles || []), ...walked];
    const seen = new Set<string>();
    const payloadDocs = combined
      .filter((f) => {
        const key = f.blobName ? f.blobName : `${f.filename}::${f.size || 0}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return !!(f.url || f.blobName);
      })
      .map((f, i) => ({
        id: -(i + 1),
        file_name: f.filename,
        file_url: f.url || "",
        mime_type: f.type || null,
        type: f.type || "uploaded_file",
        size: f.size,
        blob_name: f.blobName || null,
        fromPayload: true,
      }));

    if (sub.source !== "application") { setDocs(payloadDocs as never[]); return; }
    fetch(`${API}/api/admin/documents/${sub.rawId}`, {
      headers: { "x-admin-token": getToken() },
    })
      .then(r => r.json())
      .then(d => {
        const dbDocs: Array<{id:number;file_name:string;file_url:string;mime_type:string|null;type:string;size?:number;blob_name?:string|null}> = d.success ? d.data : [];
        // Track seen keys from DB docs
        const dbKeys = new Set(dbDocs.map(doc => doc.blob_name ? doc.blob_name : `${doc.file_name}::${doc.size || 0}`));
        const filteredPayload = payloadDocs.filter(doc => {
          const key = doc.blob_name ? doc.blob_name : `${doc.file_name}::${doc.size || 0}`;
          return !dbKeys.has(key);
        });
        setDocs([...dbDocs, ...filteredPayload] as never[]);
      })
      .catch(() => setDocs(payloadDocs as never[]));
  };

  const updateStatus = async (newStatus: string, rejectionReason?: string) => {
    if (!selected) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`${API}/api/admin/submissions/${selected.source}/${selected.rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "rejected" && (rejectionReason ?? rejectReason)
            ? { rejection_reason: rejectionReason ?? rejectReason }
            : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected({ ...selected, status: newStatus });
        setSubmissions(prev =>
          prev.map(s => (s.id === selected.id ? { ...s, status: newStatus } : s))
        );
        showToast(`Status updated to ${newStatus.replace(/_/g, " ")}`);
        setRejectReason("");
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch {
      showToast("Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const sendReply = async () => {
    if (!selected || !replyMsg.trim()) return;
    setReplySending(true);
    const ref = selected.confirmationNumber || String(selected.id);
    try {
      const form = new FormData();
      form.append("toEmail", selected.clientEmail || "");
      form.append("toName", selected.clientName);
      form.append("serviceType", selected.service);
      form.append("submissionRef", ref);
      form.append("subject", replySubject || `Re: Your ${selected.service.replace(/_/g," ")} enquiry`);
      form.append("message", replyMsg);
      // Attach uploaded files
      attachFiles.forEach(f => form.append("attachments", f));
      // Attach selected existing docs by URL / blobName
      const selectedDocs = (docs as Array<{id:number;file_name:string;file_url:string;blob_name?:string|null}>)
        .filter(d => attachDocs.includes(d.id))
        .map(d => ({
          name: d.file_name,
          url: d.file_url || "",
          blobName: d.blob_name || null,
        }));
      form.append("existingDocUrls", JSON.stringify(selectedDocs));

      const res = await fetch(`${API}/api/admin/reply`, {
        method: "POST",
        headers: { "x-admin-token": getToken() },
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        showToast("Reply sent successfully!");
        setReplyOpen(false);
        setReplyMsg("");
        setReplySubject("");
        setAttachFiles([]);
        setAttachDocs([]);
        loadReplies(selected);
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch {
      showToast("Failed to send reply.");
    } finally {
      setReplySending(false);
    }
  };

  const serviceColor = (svc: string) => {
    const s = SERVICES.find(x => x.key === svc);
    return s ? s.color : "bg-gray-400";
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          url={previewDoc.url}
          name={previewDoc.name}
          blobName={previewDoc.blobName}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Left: List */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-3">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Search name, email, ref..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]"
          />
          <select
            value={service}
            onChange={e => changeService(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] bg-white"
          >
            {SERVICES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <LoadingSpinner />
          ) : submissions.length === 0 ? (
            <EmptyState text="No submissions found" />
          ) : (
            submissions.map(sub => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelected(sub);
                  setReplyOpen(false);
                  setReplies([]);
                  setNotes([]);
                  setNoteText("");
                  setDocs([]);
                  setAttachFiles([]);
                  setAttachDocs([]);
                  loadReplies(sub);
                  loadNotes(sub);
                  loadDocs(sub);
                }}
                className={`w-full text-left p-4 bg-white rounded-xl border transition-all ${
                  selected?.id === sub.id
                    ? "border-[#b59354] shadow-md"
                    : "border-gray-100 hover:border-gray-300 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded-full ${serviceColor(sub.service)}`}>
                    {sub.service.replace(/_/g, " ")}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[sub.status] || "bg-gray-100 text-gray-600"}`}>
                    {sub.status}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate">{sub.clientName}</p>
                <p className="text-xs text-gray-500 truncate">{sub.clientEmail || "No email"}</p>
                <p className="text-xs text-gray-400 mt-1">{fmt(sub.createdAt)}</p>
              </button>
            ))
          )}
        </div>
        <p className="text-xs text-gray-400 text-center">{submissions.length} results</p>
      </div>

      {/* Right: Detail */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {selected ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-y-auto flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${serviceColor(selected.service)}`}>
                      {selected.service.replace(/_/g, " ")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selected.status] || "bg-gray-100 text-gray-600"}`}>
                      {selected.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.clientName}</h2>
                  {selected.clientEmail && (
                    <a href={`mailto:${selected.clientEmail}`} className="text-sm text-[#b59354] hover:underline">
                      {selected.clientEmail}
                    </a>
                  )}
                  {selected.confirmationNumber && (
                    <p className="text-xs font-mono text-gray-500 mt-1">Ref: {selected.confirmationNumber}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Submitted: {fmt(selected.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {STATUS_OPTIONS[selected.source] && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Status</label>
                      <select
                        value={selected.status}
                        disabled={statusUpdating}
                        onChange={e => {
                          const next = e.target.value;
                          if (next === selected.status) return;
                          if (next === "rejected" && selected.source === "application") {
                            const reason = window.prompt("Rejection reason (optional):") || "";
                            setRejectReason(reason);
                            updateStatus(next, reason);
                            return;
                          }
                          updateStatus(next);
                        }}
                        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#b59354] disabled:opacity-50"
                      >
                        {STATUS_OPTIONS[selected.source].map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                        {!STATUS_OPTIONS[selected.source].includes(selected.status) && (
                          <option value={selected.status}>{selected.status}</option>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Service email note */}
              <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Replies to this client will come from:{" "}
                <strong className="font-mono">{SERVICE_EMAILS[selected.service] || "support@opulanz.com"}</strong>
              </div>

              {/* Payload details */}
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Submission Data</h3>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <PayloadRenderer
                  payload={selected.payload || {}}
                  onPreview={async (url, name, blobName) => {
                    const resolved = await resolveFileUrl({ url, blobName });
                    if (resolved) setPreviewDoc({ url: resolved, name, blobName });
                    else showToast("File URL unavailable.");
                  }}
                />
              </div>

              {/* Attached Documents */}
              {(docs.length > 0 || selected.service === "investment_advisory") && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Attached Files {docs.length > 0 ? `(${docs.length})` : ""}
                  </h3>
                  {docs.length === 0 && (
                    <p className="text-sm text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-2">
                      No files were stored with this submission. Supporting uploads stayed in the browser, and the signed QCC was not saved to Azure. New submissions upload both.
                    </p>
                  )}
                  <div className="space-y-2">
                    {(docs as Array<{id:number;file_name:string;file_url:string;mime_type:string|null;type:string;size?:number;file_size?:number;blob_name?:string|null;fromPayload?:boolean}>).map(doc => {
                      const isPdf = doc.mime_type === "application/pdf" || doc.file_name?.endsWith(".pdf");
                      const isImg = doc.mime_type?.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp)$/i.test(doc.file_name || "");
                      const icon = isPdf ? "📄" : isImg ? "🖼️" : "📎";
                      const hasUrl = !!(doc.file_url || doc.blob_name);
                      const rawSize = doc.size || doc.file_size;
                      const sizeStr = rawSize ? (rawSize > 1024*1024 ? `${(rawSize/1024/1024).toFixed(1)} MB` : `${Math.round(rawSize/1024)} KB`) : null;
                      const openFile = async (download = false) => {
                        if (download) {
                          const ok = await forceDownloadFile({
                            fileName: doc.file_name,
                            url: doc.file_url,
                            blobName: doc.blob_name,
                          });
                          if (!ok) showToast("Download failed.");
                          return;
                        }
                        const resolved = await resolveFileUrl({ url: doc.file_url, blobName: doc.blob_name });
                        if (!resolved) {
                          showToast("File URL unavailable.");
                          return;
                        }
                        setPreviewDoc({ url: resolved, name: doc.file_name, blobName: doc.blob_name || undefined });
                      };
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xl">{icon}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {doc.type && doc.type.toLowerCase() !== "other" ? doc.type.replace(/_/g, " ") : ""}
                                {sizeStr ? `${doc.type && doc.type.toLowerCase() !== "other" ? " · " : ""}${sizeStr}` : ""}
                                {hasUrl ? " · Azure" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                            {hasUrl ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openFile(false)}
                                  className="text-xs px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openFile(true)}
                                  className="text-xs px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Download
                                </button>
                              </>
                            ) : (
                              <span className="text-xs px-3 py-1 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg">
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Internal Notes (never emailed) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Internal Notes</h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Private · not emailed to client
                  </span>
                </div>
                {notes.length === 0 ? (
                  <div className="bg-slate-50 rounded-xl p-4 text-center text-sm text-gray-400 mb-3">
                    No internal notes yet
                  </div>
                ) : (
                  <div className="space-y-2 mb-3">
                    {notes.map(n => (
                      <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-semibold text-slate-700">{n.author_name || "Admin"}</span>
                            <span className="text-[10px] text-slate-400">{fmt(n.created_at)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteNote(n.id)}
                            className="text-[10px] text-red-500 hover:text-red-600 flex-shrink-0"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{n.note}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Add a private note for your team..."
                    rows={2}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] resize-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={addNote}
                    disabled={noteSaving || !noteText.trim()}
                    className="self-end px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    {noteSaving ? "Saving..." : "Add note"}
                  </button>
                </div>
              </div>

              {/* Reply History */}
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Reply History</h3>
              {replies.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-400">
                  No replies sent yet
                </div>
              ) : (
                <div className="space-y-3">
                  {replies.map(r => (
                    <div key={r.id} className="bg-gradient-to-br from-[#b59354]/10 to-[#886844]/5 border border-[#b59354]/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-[#b59354] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </span>
                          <span className="text-xs font-semibold text-gray-700">You replied</span>
                        </div>
                        <span className="text-xs text-gray-400">{fmt(r.sent_at)}</span>
                      </div>
                      {r.subject && (
                        <p className="text-xs font-medium text-gray-600 mb-1">Subject: {r.subject}</p>
                      )}
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {String(r.message || "").replace(/\n\n?\[Attachments:[^\]]*\]\s*$/i, "").trim()}
                      </p>
                      {(() => {
                        const structured = Array.isArray(r.attachments) ? r.attachments.filter(Boolean) : [];
                        // Legacy replies only stored names in the message body
                        const legacyMatch = String(r.message || "").match(/\[Attachments:\s*([^\]]+)\]/i);
                        const legacy = legacyMatch
                          ? legacyMatch[1].split(",").map(s => s.trim()).filter(Boolean).map(filename => ({ filename, url: null, blobName: null }))
                          : [];
                        const atts = structured.length > 0 ? structured : legacy;
                        if (atts.length === 0) return null;
                        return (
                          <div className="mt-3 pt-3 border-t border-[#b59354]/10 space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#886844]">Attachments ({atts.length})</p>
                            {atts.map((att: any, ai: number) => {
                              const filename = att.filename || att.fileName || att.name || "file";
                              const blobName = att.blobName || att.blob_name || null;
                              const url = att.url || att.fileUrl || att.file_url || null;
                              const canOpen = !!(blobName || url);
                              const isPdf = /\.pdf$/i.test(filename);
                              const isImg = /\.(png|jpg|jpeg|gif|webp)$/i.test(filename);
                              const icon = isPdf ? "📄" : isImg ? "🖼️" : "📎";
                              return (
                                <div
                                  key={ai}
                                  className="flex items-center justify-between gap-2 p-2.5 bg-white border border-[#b59354]/20 rounded-lg"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span>{icon}</span>
                                    <span className="text-xs text-gray-800 truncate">{filename}</span>
                                  </div>
                                  {canOpen ? (
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const resolved = await resolveFileUrl({ url, blobName });
                                          if (resolved) setPreviewDoc({ url: resolved, name: filename, blobName: blobName || undefined });
                                          else showToast("Attachment unavailable.");
                                        }}
                                        className="text-[11px] px-2.5 py-1 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50"
                                      >
                                        View
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const ok = await forceDownloadFile({ fileName: filename, url, blobName });
                                          if (!ok) showToast("Download failed.");
                                        }}
                                        className="text-[11px] px-2.5 py-1 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50"
                                      >
                                        Download
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] px-2 py-1 bg-amber-50 border border-amber-200 text-amber-600 rounded-md">
                                      No file stored
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}

              {/* Reply via Email button at the bottom */}
              {selected.clientEmail && !replyOpen && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setReplyOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply via Email
                  </button>
                </div>
              )}
            </div>

            {/* Reply Panel */}
            {replyOpen && (
              <div className="bg-white rounded-2xl border border-[#b59354] shadow-md p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Reply to {selected.clientName}
                    <span className="ml-2 text-xs font-mono text-gray-400">
                      (from {SERVICE_EMAILS[selected.service] || "support@opulanz.com"})
                    </span>
                  </h3>
                  <button onClick={() => setReplyOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>
                <input
                  value={replySubject}
                  onChange={e => setReplySubject(e.target.value)}
                  placeholder={`Subject (optional)`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] mb-2"
                />
                <textarea
                  value={replyMsg}
                  onChange={e => setReplyMsg(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] resize-none mb-3"
                />

                {/* Attach existing submission docs */}
                {docs.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Attach submission files:</p>
                    <div className="flex flex-wrap gap-2">
                      {docs.map(doc => (
                        <label key={doc.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                          attachDocs.includes(doc.id) ? "border-[#b59354] bg-[#b59354]/10 text-[#886844]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={attachDocs.includes(doc.id)}
                            onChange={e => setAttachDocs(prev => e.target.checked ? [...prev, doc.id] : prev.filter(x => x !== doc.id))}
                          />
                          <span>{doc.file_name?.endsWith(".pdf") ? "📄" : "📎"}</span>
                          <span className="truncate max-w-[120px]">{doc.file_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new files */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 rounded-lg text-xs hover:border-[#b59354] hover:text-[#b59354] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Attach new file (PDF, PNG, DOC...)
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setAttachFiles(prev => [...prev, ...files]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  {attachFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {attachFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                          <span>📎 {f.name}</span>
                          <button onClick={() => setAttachFiles(prev => prev.filter((_, j) => j !== i))} className="text-green-500 hover:text-red-500 ml-1">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setReplyOpen(false); setAttachFiles([]); setAttachDocs([]); }}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendReply}
                    disabled={replySending || !replyMsg.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {replySending ? "Sending..." : `Send${attachFiles.length + attachDocs.length > 0 ? ` + ${attachFiles.length + attachDocs.length} file(s)` : ""}`}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 font-medium">Select a submission to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Support Tab ──────────────────────────────────────────────────────────────
function SupportTab({ initialChatId = null }: { initialChatId?: number | null }) {
  const [chats, setChats]               = React.useState<SupportChat[]>([]);
  const [loading, setLoading]           = React.useState(true);
  const [selected, setSelected]         = React.useState<SupportChat | null>(null);
  const [chatLoading, setChatLoading]   = React.useState(false);
  const [replyMsg, setReplyMsg]         = React.useState("");
  const [replySending, setReplySending] = React.useState(false);
  const [toast, setToast]               = React.useState("");
  const [filter, setFilter]             = React.useState<"all"|"waiting"|"active"|"closed">("all");
  const messagesEndRef                  = React.useRef<HTMLDivElement>(null);

  const loadChats = React.useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/support-chats`, { headers: { "x-admin-token": getToken() } })
      .then(r => {
        if (r.status === 401) { localStorage.removeItem("admin_token"); window.location.href = "/admin"; return null; }
        return r.json();
      })
      .then(d => { if (d && d.success) setChats(d.data); })
      .catch(err => console.error("Chats fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadChats(); }, [loadChats]);

  const loadChat = async (chat: SupportChat) => {
    setChatLoading(true);
    setSelected(chat);
    try {
      const res = await fetch(`${API}/api/support-chats/${chat.id}`, {
        headers: { "x-admin-token": getToken() },
      });
      const data = await res.json();
      if (data.success) setSelected(data.data);
    } catch (err) {
      console.error("Load chat error:", err);
    } finally {
      setChatLoading(false);
    }
  };

  React.useEffect(() => {
    if (!initialChatId || !chats.length) return;
    const match = chats.find(c => c.id === initialChatId);
    if (match) loadChat(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChatId, chats]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const sendReply = async () => {
    if (!selected || !replyMsg.trim()) return;
    setReplySending(true);
    try {
      const res = await fetch(`${API}/api/admin/support-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({ chatId: selected.id, message: replyMsg }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Reply sent and emailed to visitor!");
        setReplyMsg("");
        loadChat(selected);
        loadChats();
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch {
      showToast("Failed to send reply.");
    } finally {
      setReplySending(false);
    }
  };

  const closeChat = async (chatId: number) => {
    await fetch(`${API}/api/support-chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
      body: JSON.stringify({ status: "closed" }),
    });
    loadChats();
    if (selected?.id === chatId) setSelected(prev => prev ? { ...prev, status: "closed" } : null);
    showToast("Chat closed.");
  };

  const filtered = filter === "all" ? chats : chats.filter(c => c.status === filter);

  const statusBadge = (status: string) => {
    const cfg: Record<string,string> = {
      waiting: "bg-orange-100 text-orange-700",
      active:  "bg-blue-100 text-blue-700",
      closed:  "bg-gray-100 text-gray-600",
    };
    return cfg[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Left: Chat List */}
      <div className="w-[340px] flex-shrink-0 flex flex-col gap-3">
        {/* Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <div className="flex gap-1">
            {(["all","waiting","active","closed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  filter === f ? "bg-[#b59354] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState text="No chats" /> : (
            filtered.map(chat => (
              <button
                key={chat.id}
                onClick={() => loadChat(chat)}
                className={`w-full text-left p-4 bg-white rounded-xl border transition-all ${
                  selected?.id === chat.id
                    ? "border-[#b59354] shadow-md"
                    : "border-gray-100 hover:border-gray-300 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">{chat.visitor_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(chat.status)}`}>
                    {chat.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.visitor_email}</p>
                {chat.last_message && (
                  <p className="text-xs text-gray-400 truncate mt-1">{chat.last_message}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{fmt(chat.last_message_at)}</p>
                  <span className="text-xs text-gray-400">{chat.message_count} msgs</span>
                </div>
              </button>
            ))
          )}
        </div>
        <p className="text-xs text-gray-400 text-center">{filtered.length} chats</p>
      </div>

      {/* Right: Chat Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <p className="font-semibold text-gray-900">{selected.visitor_name}</p>
                <a href={`mailto:${selected.visitor_email}`} className="text-xs text-[#b59354] hover:underline">
                  {selected.visitor_email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusBadge(selected.status)}`}>
                  {selected.status}
                </span>
                {selected.status !== "closed" && (
                  <button
                    onClick={() => closeChat(selected.id)}
                    className="text-xs px-3 py-1 border border-red-200 text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  >
                    Close Chat
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#f6f8f8]">
              {chatLoading ? (
                <LoadingSpinner />
              ) : !selected.messages?.length ? (
                <EmptyState text="No messages yet" />
              ) : (
                selected.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.sender_type === "admin"
                        ? "bg-gradient-to-br from-[#b59354] to-[#886844] text-white rounded-tr-sm"
                        : "bg-white text-gray-900 shadow-sm border border-gray-100 rounded-tl-sm"
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${msg.sender_type === "admin" ? "text-white/70" : "text-gray-400"}`}>
                        {msg.sender_name}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1.5 ${msg.sender_type === "admin" ? "text-white/50" : "text-gray-400"}`}>
                        {fmt(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            {selected.status !== "closed" ? (
              <div className="px-6 py-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <span>Reply will be saved here AND sent by email to {selected.visitor_email}</span>
                </div>
                <div className="flex gap-3">
                  <textarea
                    value={replyMsg}
                    onChange={e => setReplyMsg(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply();
                    }}
                    placeholder="Type your reply... (Ctrl+Enter to send)"
                    rows={3}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] resize-none"
                  />
                  <button
                    onClick={sendReply}
                    disabled={replySending || !replyMsg.trim()}
                    className="self-end px-5 py-3 bg-gradient-to-r from-[#b59354] to-[#886844] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {replySending ? "..." : "Send"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
                This chat is closed
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-gray-500 font-medium">Select a chat to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contacts Tab (Support Form Messages) ────────────────────────────────────
interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

function ContactsTab({ initialSearch = "" }: { initialSearch?: string }) {
  const [contacts, setContacts]         = React.useState<Contact[]>([]);
  const [loading, setLoading]           = React.useState(true);
  const [selected, setSelected]         = React.useState<Contact | null>(null);
  const [filter, setFilter]             = React.useState<"all"|"open"|"replied"|"closed">("all");
  const [search, setSearch]             = React.useState(initialSearch);
  const [replyOpen, setReplyOpen]       = React.useState(false);
  const [replyMsg, setReplyMsg]         = React.useState("");
  const [replySubject, setReplySubject] = React.useState("");
  const [replySending, setReplySending] = React.useState(false);
  const [toast, setToast]               = React.useState("");

  React.useEffect(() => {
    setSearch(initialSearch || "");
    setSelected(null);
    setReplyOpen(false);
  }, [initialSearch]);

  const load = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    if (search) params.set("search", search);
    fetch(`${API}/api/admin/contacts?${params}`, { headers: { "x-admin-token": getToken() } })
      .then(r => {
        if (r.status === 401) { localStorage.removeItem("admin_token"); window.location.href = "/admin"; return null; }
        return r.json();
      })
      .then(d => { if (d && d.success) setContacts(d.data); })
      .catch(err => console.error("Contacts fetch error:", err))
      .finally(() => setLoading(false));
  }, [filter, search]);

  React.useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const markStatus = async (id: number, status: string) => {
    await fetch(`${API}/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
      body: JSON.stringify({ status }),
    });
    load();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const sendReply = async () => {
    if (!selected || !replyMsg.trim()) return;
    setReplySending(true);
    try {
      const res = await fetch(`${API}/api/admin/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({
          toEmail: selected.email,
          toName: `${selected.first_name} ${selected.last_name}`.trim(),
          serviceType: "open_account",
          submissionRef: `contact-${selected.id}`,
          subject: replySubject || `Re: ${selected.subject}`,
          message: replyMsg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Reply sent!");
        await markStatus(selected.id, "replied");
        setReplyOpen(false);
        setReplyMsg("");
        setReplySubject("");
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch {
      showToast("Failed to send reply.");
    } finally {
      setReplySending(false);
    }
  };

  const statusBadge = (s: string) => {
    const m: Record<string,string> = {
      open:    "bg-orange-100 text-orange-700",
      replied: "bg-green-100 text-green-700",
      closed:  "bg-gray-100 text-gray-600",
    };
    return m[s] || "bg-gray-100 text-gray-600";
  };

  const filtered = filter === "all" ? contacts : contacts.filter(c => c.status === filter);

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm">{toast}</div>
      )}

      {/* Left: List */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Search name, email, subject..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]"
          />
          <div className="flex gap-1">
            {(["all","open","replied","closed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  filter === f ? "bg-[#b59354] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <EmptyState text="No support messages found" />
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); setReplyOpen(false); }}
                className={`w-full text-left p-4 bg-white rounded-xl border transition-all ${
                  selected?.id === c.id ? "border-[#b59354] shadow-md" : "border-gray-100 hover:border-gray-300 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {c.first_name} {c.last_name}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.email}</p>
                <p className="text-xs font-medium text-gray-700 truncate mt-1">{c.subject}</p>
                <p className="text-xs text-gray-400 mt-1">{fmt(c.created_at)}</p>
              </button>
            ))
          )}
        </div>
        <p className="text-xs text-gray-400 text-center">{filtered.length} messages</p>
      </div>

      {/* Right: Detail */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {selected ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1 overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(selected.status)}`}>
                      {selected.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selected.first_name} {selected.last_name}
                  </h2>
                  <a href={`mailto:${selected.email}`} className="text-sm text-[#b59354] hover:underline">
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <p className="text-xs text-gray-500 mt-0.5">{selected.phone}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Received: {fmt(selected.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  {selected.status !== "replied" && (
                    <button
                      onClick={() => setReplyOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Reply
                    </button>
                  )}
                  {selected.status === "open" && (
                    <button
                      onClick={() => markStatus(selected.id, "closed")}
                      className="px-3 py-2 text-xs border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Close
                    </button>
                  )}
                  {selected.status === "closed" && (
                    <button
                      onClick={() => markStatus(selected.id, "open")}
                      className="px-3 py-2 text-xs border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="mb-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Subject</p>
                <p className="font-semibold text-gray-900">{selected.subject}</p>
              </div>

              {/* Message */}
              <div className="px-4 py-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Message</p>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>

            {/* Reply panel */}
            {replyOpen && (
              <div className="bg-white rounded-2xl border border-[#b59354] shadow-md p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Reply to {selected.first_name}
                    <span className="ml-2 text-xs font-mono text-gray-400">(from support@opulanz.com)</span>
                  </h3>
                  <button onClick={() => setReplyOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>
                <input
                  value={replySubject}
                  onChange={e => setReplySubject(e.target.value)}
                  placeholder={`Re: ${selected.subject}`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] mb-2"
                />
                <textarea
                  value={replyMsg}
                  onChange={e => setReplyMsg(e.target.value)}
                  placeholder="Type your reply..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] resize-none mb-3"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setReplyOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button
                    onClick={sendReply}
                    disabled={replySending || !replyMsg.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {replySending ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center">
              <p className="text-4xl mb-3">✉️</p>
              <p className="text-gray-500 font-medium">Select a message to view and reply</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Payload Renderer ─────────────────────────────────────────────────────────

/** Country code → full name (common EU + a few extras) */
const COUNTRY_NAMES: Record<string, string> = {
  LU: "Luxembourg", DE: "Germany", FR: "France", BE: "Belgium", NL: "Netherlands",
  AT: "Austria", CH: "Switzerland", IT: "Italy", ES: "Spain", PT: "Portugal",
  GB: "United Kingdom", IE: "Ireland", US: "United States", CA: "Canada",
  SE: "Sweden", DK: "Denmark", NO: "Norway", FI: "Finland", PL: "Poland",
  CZ: "Czech Republic", LV: "Latvia", LT: "Lithuania", EE: "Estonia",
  GR: "Greece", HU: "Hungary", RO: "Romania", BG: "Bulgaria", SK: "Slovakia",
  HR: "Croatia", SI: "Slovenia", CY: "Cyprus", MT: "Malta",
  IN: "India", CN: "China", JP: "Japan", AU: "Australia", BR: "Brazil",
  AE: "United Arab Emirates", SG: "Singapore", HK: "Hong Kong",
};

/** Keys to hide from the Submission Data table (already shown elsewhere or internal) */
const HIDDEN_KEYS = new Set([
  "id", "ids", "created_at", "createdAt", "updated_at", "updatedAt",
  "user_ref", "userRef", "confirmation_number", "confirmationNumber",
  "uploadedFiles", "files", "attachments", "documents",  // shown in Attached Files section
  "uploadedDocuments",
  "signedDocumentUrl", "signedDocumentFilename", "signedDocumentBlobName", "signedDocumentSize",
  "status", "service", "service_type", "serviceType",
]);

const LABEL_OVERRIDES: Record<string, string> = {
  titulaire1: "Account holder 1",
  titulaire2: "Account holder 2",
  hasTitulaire2: "Second account holder",
  personalFinancial: "Personal financial situation",
  personalDocuments: "Personal documents provided",
  companyIdentity: "Company identity",
  companyFinancial: "Company financial situation",
  companyDocuments: "Company documents provided",
  productKnowledge: "Product knowledge",
  maritalStatus: "Marital status",
  clientType: "Client type",
  esg: "ESG preferences",
  envelopeId: "Envelope ID",
  signedAt: "Signed at",
};

/** Keys that contain person arrays (directors, shareholders, managers, beneficiaries) */
const PERSON_ARRAY_KEYS = new Set([
  "directors", "Directors", "shareholders", "Shareholders",
  "managers", "Managers", "beneficiaries", "Beneficiaries",
  "contacts", "signatories",
]);

/** Keys that contain consent/boolean maps */
const CONSENT_KEYS = new Set([
  "consents", "Consents", "consent", "agreements", "termsAccepted",
  "personalDocuments", "companyDocuments",
]);

/** Keys that contain upload-related data */
const UPLOAD_KEYS = new Set([
  "uploads", "Uploads", "upload", "uploadedDocuments",
]);

/** Convert camelCase / snake_case key into a readable label */
function prettyLabel(key: string): string {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")  // camelCase → camel Case
    .replace(/_/g, " ")                     // snake_case → snake case
    .replace(/\b\w/g, c => c.toUpperCase()) // capitalize words
    .replace(/\bId\b/g, "ID")
    .replace(/\bUrl\b/g, "URL")
    .replace(/\bDob\b/g, "Date of Birth")
    .replace(/\bPep\b/g, "PEP")
    .replace(/\bIs Pep\b/gi, "Politically Exposed Person")
    .trim();
}

/** Check if a string looks like an ISO date */
function isIsoDate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T|\s)/.test(v);
}

/** Format a single primitive value nicely */
function formatValue(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") return null;

  // Booleans
  if (typeof value === "boolean") {
    return value
      ? <span className="inline-flex items-center gap-1 text-green-700"><span className="text-green-500">✓</span> Yes</span>
      : <span className="inline-flex items-center gap-1 text-red-600"><span className="text-red-400">✗</span> No</span>;
  }

  // Numbers
  if (typeof value === "number") {
    // amounts / capital
    if (/amount|capital|price|fee|cost|salary|revenue/i.test(key) && value > 0) {
      return `€ ${value.toLocaleString()}`;
    }
    if (/percent|share/i.test(key)) {
      return `${value}%`;
    }
    return String(value);
  }

  if (typeof value === "string") {
    // Country codes (2-letter uppercase)
    if (/^[A-Z]{2}$/.test(value) && COUNTRY_NAMES[value] &&
        /country|nationality|nation|citizenship/i.test(key)) {
      return `${COUNTRY_NAMES[value]} (${value})`;
    }
    // ISO dates
    if (isIsoDate(value)) {
      try {
        const d = new Date(value);
        // If it has time component, show date+time; otherwise just date
        if (value.includes("T") && !value.endsWith("T00:00:00.000Z")) {
          return d.toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          });
        }
        return d.toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        });
      } catch { return value; }
    }
    // Email addresses — make clickable
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return <a href={`mailto:${value}`} className="text-[#b59354] hover:underline">{value}</a>;
    }
    // Phone numbers — make clickable
    if (/^\+?\d[\d\s\-()]{6,}$/.test(value.trim())) {
      return <a href={`tel:${value.replace(/\s/g, "")}`} className="text-[#b59354] hover:underline">{value}</a>;
    }
    // URLs
    if (/^https?:\/\//i.test(value)) {
      return <a href={value} target="_blank" rel="noreferrer" className="text-[#b59354] hover:underline break-all">{value}</a>;
    }
    return value;
  }

  return null;
}

/** Renders a single person (director/shareholder/manager) as a mini card */
function PersonCard({ person, index, role }: { person: Record<string, unknown>; index: number; role: string }) {
  const name = [person.firstName, person.lastName].filter(Boolean).join(" ") || `${role} ${index + 1}`;
  const personFields: Array<[string, unknown]> = Object.entries(person).filter(
    ([k, v]) => v !== null && v !== undefined && v !== "" && !["id", "firstName", "lastName"].includes(k)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
          {(name[0] || "?").toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          {person.roles != null && (
            <p className="text-[10px] text-gray-500">
              {Array.isArray(person.roles) ? (person.roles as string[]).join(", ") : String(person.roles)}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {personFields.map(([k, v]) => {
          if (k === "roles") return null; // already shown above
          const formatted = formatValue(k, v);
          if (formatted === null) return null;
          return (
            <div key={k} className="py-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{prettyLabel(k)}</p>
              <p className="text-xs text-gray-800">{formatted}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Renders a consent/boolean map as a checklist */
function ConsentDisplay({ consents }: { consents: Record<string, unknown> }) {
  return (
    <div className="space-y-1.5">
      {Object.entries(consents).map(([k, v]) => {
        if (v === null || v === undefined) return null;
        const checked = v === true || v === "true";
        return (
          <div key={k} className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
              checked ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
            }`}>
              {checked ? "✓" : "✗"}
            </span>
            <span className="text-sm text-gray-700">{prettyLabel(k)}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Renders uploads section with view/download buttons */
function UploadSection({ uploads, onPreview }: { uploads: Record<string, unknown>; onPreview?: (url: string, name: string, blobName?: string) => void }) {
  // uploads may have { ids: [...], capitalCertificate: ..., leaseOrDomiciliation: [...] }
  const items: Array<{ label: string; files: Array<{ name: string; url?: string; id?: string; blobName?: string }> }> = [];

  for (const [k, v] of Object.entries(uploads)) {
    if (k === "ids" && Array.isArray(v)) {
      const files = v.filter(f => f && (f.filename || f.name || f.id)).map(f => ({
        name: f.filename || f.name || f.id || "File",
        url: f.url || f.fileUrl,
        id: f.id,
        blobName: f.blobName,
      }));
      if (files.length > 0) items.push({ label: "Uploaded Documents", files });
    } else if (Array.isArray(v) && v.length > 0) {
      const files = v.filter(f => f && typeof f === "object").map(f => ({
        name: f.filename || f.name || f.id || "File",
        url: f.url || f.fileUrl,
        id: f.id,
        blobName: f.blobName,
      }));
      if (files.length > 0) items.push({ label: prettyLabel(k), files });
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      const f = v as Record<string, unknown>;
      if (f.filename || f.name || f.id) {
        items.push({
          label: prettyLabel(k),
          files: [{
            name: (f.filename || f.name || f.id || "File") as string,
            url: (f.url || f.fileUrl) as string | undefined,
            blobName: f.blobName as string | undefined,
          }],
        });
      }
    } else if (v === null || v === undefined || (Array.isArray(v) && v.length === 0)) {
      items.push({ label: prettyLabel(k), files: [] });
    }
  }

  if (items.length === 0 || items.every(i => i.files.length === 0)) {
    return <span className="text-sm text-gray-400 italic">No files uploaded</span>;
  }

  return (
    <div className="space-y-2">
      {items.map((group, gi) => (
        <div key={gi}>
          {items.length > 1 && <p className="text-xs text-gray-500 font-medium mb-1">{group.label}</p>}
          {group.files.length === 0 ? (
            <p className="text-xs text-gray-400 italic">None</p>
          ) : (
            <div className="space-y-1.5">
              {group.files.map((file, fi) => {
                const canOpen = !!(file.url || file.blobName);
                return (
                <div key={fi} className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{file.name.endsWith(".pdf") ? "📄" : /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name) ? "🖼️" : "📎"}</span>
                    <span className="text-sm text-gray-800 truncate">{file.name}</span>
                  </div>
                  {canOpen ? (
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      <button type="button" onClick={() => onPreview?.(file.url || "", file.name, file.blobName)} className="text-xs px-2.5 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                        View
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await forceDownloadFile({
                            fileName: file.name,
                            url: file.url,
                            blobName: file.blobName,
                          });
                          if (!ok) console.warn("Download failed for", file.name);
                        }}
                        className="text-xs px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-md ml-2">No URL</span>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Main payload renderer — replaces raw JSON.stringify display */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isEmptyDeep(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return true;
  if (typeof v === "boolean" || typeof v === "number") return false;
  if (Array.isArray(v)) return v.length === 0 || v.every(isEmptyDeep);
  if (isFileLikeRecord(v)) return false;
  if (isPlainObject(v)) return Object.values(v).every(isEmptyDeep);
  return false;
}

function isBooleanMap(obj: Record<string, unknown>): boolean {
  const vals = Object.values(obj);
  if (vals.length === 0) return false;
  return vals.every((v) => typeof v === "boolean" || v === null);
}

function flattenAdvisoryPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const nested = payload.formData;
  if (isPlainObject(nested)) {
    const { formData: _omit, ...rest } = payload;
    return { ...nested, ...rest };
  }
  return payload;
}

function PayloadRenderer({ payload, onPreview }: { payload: Record<string, unknown>; onPreview?: (url: string, name: string, blobName?: string) => void }) {
  return <NestedFields data={flattenAdvisoryPayload(payload)} onPreview={onPreview} />;
}

function NestedFields({
  data,
  onPreview,
}: {
  data: Record<string, unknown>;
  onPreview?: (url: string, name: string, blobName?: string) => void;
}) {
  const personSections: Array<{ key: string; label: string; items: Record<string, unknown>[] }> = [];
  const consentSections: Array<{ key: string; label: string; data: Record<string, unknown> }> = [];
  const uploadSections: Array<{ key: string; label: string; data: Record<string, unknown> }> = [];
  const nestedSections: Array<{ key: string; label: string; data: Record<string, unknown> }> = [];
  const regularEntries: Array<[string, unknown]> = [];

  for (const [key, value] of Object.entries(data)) {
    if (HIDDEN_KEYS.has(key)) continue;
    if (isEmptyDeep(value) && typeof value !== "boolean") continue;

    if (PERSON_ARRAY_KEYS.has(key) && Array.isArray(value)) {
      personSections.push({ key, label: prettyLabel(key), items: value as Record<string, unknown>[] });
    } else if (
      (CONSENT_KEYS.has(key) || (isPlainObject(value) && isBooleanMap(value))) &&
      isPlainObject(value)
    ) {
      consentSections.push({ key, label: prettyLabel(key), data: value });
    } else if (UPLOAD_KEYS.has(key) && typeof value === "object" && value !== null) {
      uploadSections.push({ key, label: prettyLabel(key), data: value as Record<string, unknown> });
    } else if (isFileLikeRecord(value)) {
      uploadSections.push({
        key,
        label: prettyLabel(key),
        data: { [key]: value },
      });
    } else if (isPlainObject(value)) {
      nestedSections.push({ key, label: prettyLabel(key), data: value });
    } else {
      regularEntries.push([key, value]);
    }
  }

  return (
    <div className="space-y-5">
      {regularEntries.length > 0 && (
        <table className="w-full text-sm">
          <tbody>
            {regularEntries.map(([key, value]) => {
              if (Array.isArray(value)) {
                const items = value as unknown[];
                const allObjects = items.length > 0 && items.every((item) => isPlainObject(item) && !isFileLikeRecord(item));
                if (allObjects) {
                  return (
                    <tr key={key} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 text-gray-500 font-medium w-48 align-top">{prettyLabel(key)}</td>
                      <td className="py-2">
                        <div className="space-y-3">
                          {items.map((item, i) => (
                            <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
                              <NestedFields data={item as Record<string, unknown>} onPreview={onPreview} />
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                }
                const label = items
                  .map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item)))
                  .join(", ");
                return (
                  <tr key={key} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-4 text-gray-500 font-medium w-48 align-top">{prettyLabel(key)}</td>
                    <td className="py-2 text-gray-900">{label}</td>
                  </tr>
                );
              }

              const formatted = formatValue(key, value);
              if (formatted === null) return null;
              return (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-4 text-gray-500 font-medium w-48 align-top">{prettyLabel(key)}</td>
                  <td className="py-2 text-gray-900">{formatted}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {nestedSections.map((section) => (
        <div key={section.key}>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            {section.label}
          </h4>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <NestedFields data={section.data} onPreview={onPreview} />
          </div>
        </div>
      ))}

      {personSections.map((section) => (
        <div key={section.key}>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>👥</span> {section.label} ({section.items.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.items.map((person, i) => (
              <PersonCard key={i} person={person} index={i} role={section.label.replace(/s$/, "")} />
            ))}
          </div>
        </div>
      ))}

      {consentSections.map((section) => (
        <div key={section.key}>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>📋</span> {section.label}
          </h4>
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <ConsentDisplay consents={section.data} />
          </div>
        </div>
      ))}

      {uploadSections.map((section) => (
        <div key={section.key}>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>📂</span> {section.label}
          </h4>
          <UploadSection uploads={section.data} onPreview={onPreview} />
        </div>
      ))}
    </div>
  );
}

// ─── Document Preview Modal ──────────────────────────────────────────────────
function DocumentPreviewModal({
  url,
  name,
  blobName,
  onClose,
}: {
  url: string;
  name: string;
  blobName?: string;
  onClose: () => void;
}) {
  const isImage = /\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)$/i.test(name) || /^data:image\//i.test(url);
  const isPdf = /\.pdf$/i.test(name);
  const [downloading, setDownloading] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = React.useState(isImage || isPdf);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  // Azure Blob URLs cannot be embedded in iframes (X-Frame-Options / CSP).
  // Fetch via our admin proxy (or direct URL) and preview from a same-origin blob: URL.
  React.useEffect(() => {
    if (!isImage && !isPdf) {
      setLoadingPreview(false);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    (async () => {
      setLoadingPreview(true);
      setPreviewError(null);
      try {
        let blob: Blob | null = null;

        if (blobName) {
          const res = await fetch(
            `${API}/api/admin/download-file?blobName=${encodeURIComponent(blobName)}&fileName=${encodeURIComponent(name)}&inline=1`,
            { headers: { "x-admin-token": getToken() } }
          );
          if (res.ok) blob = await res.blob();
        }

        if (!blob && url) {
          const res = await fetch(url);
          if (res.ok) blob = await res.blob();
        }

        if (!blob) throw new Error("Unable to load file for preview");

        if (isPdf && blob.type !== "application/pdf") {
          blob = new Blob([await blob.arrayBuffer()], { type: "application/pdf" });
        }

        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setPreviewSrc(objectUrl);
      } catch (err) {
        console.error("Preview load failed:", err);
        if (!cancelled) {
          setPreviewError("This file cannot be previewed here. Use Download or Open in new tab.");
          // Fall back to original URL for images only (may still work)
          if (isImage) setPreviewSrc(url);
        }
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, blobName, name, isImage, isPdf]);

  const handleDownload = async () => {
    setDownloading(true);
    const ok = await forceDownloadFile({ fileName: name, url, blobName });
    setDownloading(false);
    if (!ok) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const openInNewTab = () => {
    if (previewSrc) {
      window.open(previewSrc, "_blank", "noopener,noreferrer");
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "min(90vw, 1000px)", height: "min(85vh, 800px)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg">{isImage ? "🖼️" : isPdf ? "📄" : "📎"}</span>
            <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={openInNewTab}
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Open in new tab ↗
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {downloading ? "Downloading…" : "Download"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center overflow-auto bg-gray-100 p-4">
          {loadingPreview ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#b59354] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading preview…</p>
            </div>
          ) : isImage && previewSrc ? (
            <img
              src={previewSrc}
              alt={name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-md"
              onError={() => setPreviewError("Unable to load image")}
            />
          ) : isPdf && previewSrc ? (
            <iframe
              src={previewSrc}
              title={name}
              className="w-full h-full rounded-lg border border-gray-200 bg-white"
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">{previewError ? "⚠️" : "📎"}</p>
              <p className="text-gray-700 font-medium mb-1">{name}</p>
              <p className="text-sm text-gray-500 mb-4">
                {previewError || "This file type cannot be previewed in the browser."}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={openInNewTab}
                  className="px-4 py-2 bg-[#b59354] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Open in new tab
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {downloading ? "Downloading…" : "Download"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Help Tab ─────────────────────────────────────────────────────────────────
function HelpTab() {
  const [lang, setLang] = React.useState<"en" | "fr">("en");
  const [openSection, setOpenSection] = React.useState<string | null>("login");
  const [searchQuery, setSearchQuery] = React.useState("");

  const toggle = (id: string) => setOpenSection(prev => (prev === id ? null : id));
  const expandAll = () => setOpenSection("ALL");
  const collapseAll = () => setOpenSection(null);

  const T = lang === "en";

  const Chip = ({ cls, label }: { cls: string; label: string }) => (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>{label}</span>
  );

  const Flow = ({ chips }: { chips: Array<{ cls: string; label: string }> }) => (
    <div className="flex items-center gap-1.5 flex-wrap my-2">
      {chips.map((c, i) => (
        <React.Fragment key={c.label}>
          <Chip cls={c.cls} label={c.label} />
          {i < chips.length - 1 && <span className="text-gray-400 text-xs">→</span>}
        </React.Fragment>
      ))}
    </div>
  );

  const Section = ({
    id, num, en, fr, tags = [], children,
  }: {
    id: string; num: string; en: string; fr: string; tags?: string[]; children: React.ReactNode;
  }) => {
    const title = T ? en : fr;
    const matchesSearch = !searchQuery.trim() || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      num.includes(searchQuery) ||
      tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return null;

    const open = openSection === "ALL" || openSection === id;
    return (
      <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all">
        <button
          type="button"
          onClick={() => toggle(id)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#b59354] w-6">{num}</span>
            <span className="text-sm font-semibold text-gray-900">{title}</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="px-5 pb-5 pt-2 border-t border-gray-100 text-sm text-gray-600 space-y-3">
            {children}
          </div>
        )}
      </div>
    );
  };

  const Note = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-amber-50 border-l-4 border-[#b59354] rounded-r-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
      {children}
    </div>
  );

  const Tip = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl px-4 py-3 text-xs text-blue-800 leading-relaxed">
      {children}
    </div>
  );

  const Warning = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl px-4 py-3 text-xs text-red-800 leading-relaxed">
      {children}
    </div>
  );

  const Steps = ({ items }: { items: string[] }) => (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-xs text-gray-600">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#b59354] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ol>
  );

  const Bullets = ({ items }: { items: string[] }) => (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-xs text-gray-600">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b59354] flex-shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  );

  const Table = ({ head, rows }: { head: string[]; rows: string[][] }) => (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#252623]">
            {head.map(h => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-[#b59354] tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-gray-600" dangerouslySetInnerHTML={{ __html: cell }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="bg-[#252623] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#b59354]/60 font-semibold tracking-widest uppercase mb-1">
            {T ? "User Manual & Operations Guide — Internal Use Only" : "Manuel Utilisateur & Guide Opérations — Usage Interne"}
          </p>
          <h2 className="text-xl font-bold text-white">
            {T ? "Admin Dashboard Help & SOPs" : "Aide & Procédures Tableau de Bord Admin"}
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {T ? "Luxembourg Operations & Compliance Team · Complete Reference" : "Équipe Opérations & Conformité Luxembourg · Référence Complète"}
          </p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-[#b59354]/30 flex-shrink-0">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-4 py-1.5 text-xs font-bold transition-colors ${lang === "en" ? "bg-[#b59354] text-white" : "text-[#b59354]/60 hover:text-[#b59354]"}`}
          >EN</button>
          <button
            type="button"
            onClick={() => setLang("fr")}
            className={`px-4 py-1.5 text-xs font-bold transition-colors ${lang === "fr" ? "bg-[#b59354] text-white" : "text-[#b59354]/60 hover:text-[#b59354]"}`}
          >FR</button>
        </div>
      </div>

      {/* Search and Expand/Collapse Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={T ? "Search help topics (e.g., DocuSign, Azure, Mortgage, KYC, Status)..." : "Rechercher un sujet (ex. DocuSign, Azure, Hypothèque, KYC, Statut)..."}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#b59354]"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#b59354] hover:bg-gray-50 rounded-lg border border-gray-200"
          >
            {T ? "Expand All" : "Tout déplier"}
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#b59354] hover:bg-gray-50 rounded-lg border border-gray-200"
          >
            {T ? "Collapse All" : "Tout replier"}
          </button>
        </div>
      </div>

      {/* Section 1 — Login */}
      <Section id="login" num="01" en="Logging In & Session Management" fr="Connexion & Gestion de Session" tags={["password", "auth", "security", "token", "logout"]}>
        {T ? (
          <>
            <p>The admin panel is accessible at <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/admin</code> and requires the team admin password.</p>
            <Steps items={[
              'Navigate to <code class="bg-gray-100 px-1 rounded">/admin</code> in your browser.',
              'Enter the <strong>admin password</strong> provided by your team lead and click <strong>Sign In</strong>.',
              'You are redirected automatically to the dashboard.',
              'Your session persists in the browser until you click <strong>Logout</strong>.',
            ]} />
            <Note><strong>Logout:</strong> Always click Logout when leaving a shared computer. <strong>Locked out?</strong> Contact your team lead — do not share the password via email or messaging.</Note>
          </>
        ) : (
          <>
            <p>Le panneau admin est accessible à <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/admin</code> et nécessite le mot de passe administrateur.</p>
            <Steps items={[
              'Allez à <code class="bg-gray-100 px-1 rounded">/admin</code> dans votre navigateur.',
              'Saisissez le <strong>mot de passe admin</strong> fourni par votre responsable et cliquez sur <strong>Sign In</strong>.',
              'Vous êtes redirigé automatiquement vers le tableau de bord.',
              'Votre session persiste dans le navigateur jusqu\'au clic sur <strong>Logout</strong>.',
            ]} />
            <Note><strong>Déconnexion :</strong> Cliquez toujours sur Logout en quittant un ordinateur partagé. <strong>Bloqué ?</strong> Contactez votre responsable — ne partagez pas le mot de passe par e-mail.</Note>
          </>
        )}
      </Section>

      {/* Section 2 — Overview */}
      <Section id="overview" num="02" en="Overview Tab & Operational KPIs" fr="Onglet Vue d'ensemble & Indicateurs" tags={["kpi", "stats", "cards", "activity", "summary"]}>
        {T ? (
          <>
            <p>The first screen after login. Shows live submission counts for every service and recent activity.</p>
            <Bullets items={[
              '<strong>Statistics cards</strong> — colour-coded cards showing total records per service. Click any card to jump to that service\'s filtered Submissions list.',
              '<strong>Recent submissions</strong> — the latest 5 entries across all services with direct navigation links.',
              '<strong>Open chats queue</strong> — live conversations waiting for a reply with instant status badges.',
              '<strong>Service email routing summary</strong> — quick reference of which Opulanz address handles which vertical.',
            ]} />
            <Tip>Review the Overview tab at the beginning of each shift to identify backlogs in high-priority queues.</Tip>
          </>
        ) : (
          <>
            <p>Premier écran après la connexion. Affiche le nombre de soumissions par service et l'activité récente.</p>
            <Bullets items={[
              '<strong>Cartes statistiques</strong> — cartes colorées affichant le total de dossiers par service. Cliquez sur une carte pour accéder à la liste filtrée des Dossiers.',
              '<strong>Dossiers récents</strong> — les 5 dernières entrées tous services confondus avec liens d\'accès direct.',
              '<strong>File des chats ouverts</strong> — conversations en attente de réponse avec badges de statut.',
              '<strong>Synthèse du routage e-mails</strong> — rappel des adresses Opulanz dédiées par vertical.',
            ]} />
            <Tip>Consultez l'onglet Vue d'ensemble en début de journée pour repérer les dossiers prioritaires en attente.</Tip>
          </>
        )}
      </Section>

      {/* Section 3 — Submissions */}
      <Section id="submissions" num="03" en="Submissions Tab — Managing Client Files" fr="Onglet Dossiers — Gestion des Dossiers Clients" tags={["status", "reply", "email", "notes", "documents", "reject"]}>
        {T ? (
          <>
            <p>View, manage, and respond to individual client applications. Left panel = list, right panel = detail.</p>
            <Bullets items={[
              '<strong>Search</strong> by client name, email, or reference number — press Enter or wait for real-time results.',
              '<strong>Service dropdown</strong> — filter to one service or leave on All Services.',
              '<strong>Select a record</strong> — click any list card to open full detail on the right.',
            ]} />
            <p className="font-semibold text-gray-700 pt-1">Inside a record you can:</p>
            <Bullets items={[
              '<strong>Update status</strong> — use the Status dropdown top-right of the detail panel. Changes save immediately. Selecting <em>Rejected</em> prompts for an optional reason.',
              '<strong>Reply by email</strong> — click the gold Reply button, write your message, optionally attach files or existing docs, then Send. All replies are logged in the history thread.',
              '<strong>Internal notes</strong> — private team annotations, never sent to the client. Save Note / Delete.',
              '<strong>View / Download documents</strong> — files uploaded by the client. Click View for inline preview or Download to save via secure streaming proxy.',
            ]} />
            <Note>The amber box inside each record shows which Opulanz address the reply will come from. Check it before sending.</Note>
          </>
        ) : (
          <>
            <p>Consultez, gérez et répondez aux demandes clients individuelles. Panneau gauche = liste, panneau droit = détail.</p>
            <Bullets items={[
              '<strong>Recherche</strong> par nom, e-mail ou référence — appuyez sur Entrée ou attendez.',
              '<strong>Menu service</strong> — filtrez sur un service ou laissez sur Tous les services.',
              '<strong>Sélectionner un dossier</strong> — cliquez sur une carte pour ouvrir le détail à droite.',
            ]} />
            <p className="font-semibold text-gray-700 pt-1">Dans un dossier vous pouvez :</p>
            <Bullets items={[
              '<strong>Modifier le statut</strong> — menu déroulant Status en haut à droite. Sauvegarde immédiate. <em>Rejected</em> demande un motif optionnel.',
              '<strong>Répondre par e-mail</strong> — bouton doré Reply, rédigez, joignez des fichiers si besoin, puis Send. Toutes les réponses sont journalisées dans l\'historique.',
              '<strong>Notes internes</strong> — annotations privées, jamais envoyées au client. Save Note / Delete.',
              '<strong>Consulter / Télécharger des documents</strong> — fichiers uploadés par le client. View pour prévisualisation ou Download via le proxy sécurisé.',
            ]} />
            <Note>L'encadré amber dans chaque dossier indique l'adresse Opulanz expéditrice. Vérifiez avant d'envoyer.</Note>
          </>
        )}
      </Section>

      {/* Section 4 — Pipeline */}
      <Section id="pipeline" num="04" en="Pipeline Board (Kanban Workflow)" fr="Tableau Pipeline (Workflow Kanban)" tags={["kanban", "drag", "drop", "workflow", "columns"]}>
        {T ? (
          <>
            <p>Kanban view of submissions for one service at a time, organised by status columns.</p>
            <Steps items={[
              'Select a service using the dropdown or the coloured chips below it.',
              'Cards appear in columns matching their current status.',
              'Drag a card to a new column to update its status — the column highlights gold on hover.',
              'Dropping into <strong>Rejected</strong> opens a modal for an optional rejection reason.',
              'Click a card (without dragging) to open its full detail in the Submissions tab.',
            ]} />
            <Tip>Use the Pipeline at the start of the day to spot everything sitting in <em>Submitted</em> or <em>Pending</em> and prioritise follow-ups.</Tip>
          </>
        ) : (
          <>
            <p>Vue Kanban des soumissions pour un service à la fois, organisée par colonnes de statut.</p>
            <Steps items={[
              'Sélectionnez un service via le menu déroulant ou les puces colorées.',
              'Les cartes s\'affichent dans les colonnes correspondant à leur statut.',
              'Faites glisser une carte vers une nouvelle colonne pour mettre à jour son statut — la colonne se surligne en doré.',
              'Déposer dans <strong>Rejected</strong> ouvre une fenêtre pour un motif optionnel.',
              'Cliquez sur une carte (sans la glisser) pour ouvrir son détail dans l\'onglet Dossiers.',
            ]} />
            <Tip>Utilisez le Pipeline en début de journée pour repérer tout ce qui est en <em>Submitted</em> ou <em>Pending</em> et prioriser vos relances.</Tip>
          </>
        )}
      </Section>

      {/* Section 5 — Support Messages */}
      <Section id="support-messages" num="05" en="Support Messages Tab" fr="Onglet Messages Support" tags={["contact", "inquiry", "email", "form"]}>
        {T ? (
          <>
            <p>Displays messages submitted through the website contact form — asynchronous enquiries waiting for a reply.</p>
            <Bullets items={[
              'Search by visitor name or email.',
              'Click a row to open the full message thread on the right.',
              'Reply by email directly from the detail panel.',
              'Mark resolved once the matter is closed.',
            ]} />
            <Note><strong>Support Messages vs Live Chats:</strong> Support messages are contact form submissions; Live Chats happen in real time on the website and need faster attention.</Note>
          </>
        ) : (
          <>
            <p>Affiche les messages soumis via le formulaire de contact du site — demandes asynchrones en attente de réponse.</p>
            <Bullets items={[
              'Recherche par nom ou e-mail du visiteur.',
              'Cliquez sur une ligne pour ouvrir le fil de messages à droite.',
              'Répondez par e-mail directement depuis le panneau de détail.',
              'Marquez résolu une fois le sujet traité.',
            ]} />
            <Note><strong>Messages Support vs Chats en Direct :</strong> Les messages support sont des soumissions de formulaire ; les chats en direct se déroulent en temps réel et nécessitent une attention plus rapide.</Note>
          </>
        )}
      </Section>

      {/* Section 6 — Live Chats */}
      <Section id="live-chats" num="06" en="Live Chats Tab" fr="Onglet Chats en Direct" tags={["chat", "realtime", "visitor", "conversation"]}>
        {T ? (
          <>
            <p>Real-time conversations started by visitors on the Opulanz website. Chats waiting for a reply are top priority.</p>
            <Steps items={[
              'Click a chat row to open the conversation.',
              'Read the visitor\'s messages in the thread.',
              'Type your reply at the bottom and press Enter or click Send.',
              'Mark the chat as <strong>closed</strong> once resolved to clear it from the active queue.',
            ]} />
            <Note><strong>Response time matters.</strong> Visitors in "waiting" status are online right now — aim to respond within a few minutes.</Note>
          </>
        ) : (
          <>
            <p>Conversations en temps réel initiées par les visiteurs du site Opulanz. Les chats en attente sont la priorité absolue.</p>
            <Steps items={[
              'Cliquez sur une ligne de chat pour ouvrir la conversation.',
              'Lisez les messages du visiteur dans le fil.',
              'Tapez votre réponse en bas et appuyez sur Entrée ou cliquez Send.',
              'Marquez le chat comme <strong>closed</strong> une fois résolu pour le retirer de la file active.',
            ]} />
            <Note><strong>Le temps de réponse est essentiel.</strong> Les visiteurs en statut "waiting" sont en ligne maintenant — visez une réponse en quelques minutes.</Note>
          </>
        )}
      </Section>

      {/* Section 7 — Document Verification & Azure Storage (NEW) */}
      <Section id="document-verification" num="07" en="Document Verification & Azure Blob Storage" fr="Vérification des Documents & Stockage Azure" tags={["azure", "blob", "sas", "download", "kyc", "passport", "id", "verification"]}>
        {T ? (
          <>
            <p>Client documents (Passports, National IDs, Proof of Address, Company Statutes, Capital Certificates) are stored in secure Azure Blob Storage containers.</p>
            <p className="font-semibold text-gray-700 pt-1">Verification Checklist:</p>
            <Bullets items={[
              '<strong>Identity Documents (IDs/Passports)</strong> — Check full legal name, date of birth, expiration date, and MRZ code clarity. Ensure all 4 corners are visible.',
              '<strong>Proof of Address</strong> — Must be under 3 months old (utility bill, bank statement, or official tax notice). Must match the residential address in the application.',
              '<strong>Company Documents</strong> — Verify RCS / registration certificate, Articles of Association, and UBO register for corporate applications.',
              '<strong>Capital Deposit Certificate</strong> — Confirm matching capital amount, currency (EUR), bank stamp, and blocking certificate for company formation.',
            ]} />
            <p className="font-semibold text-gray-700 pt-1">Document Actions:</p>
            <Bullets items={[
              '<strong>Inline Preview (View)</strong> — Opens a secure temporary SAS token URL in a modal or new tab for inspection.',
              '<strong>Force Download</strong> — Uses the backend streaming proxy (<code class="bg-gray-100 px-1 rounded">/api/admin/download-file</code>) to bypass cross-origin browser restrictions and download directly with original filenames.',
              '<strong>Link Uploaded Documents</strong> — Connect uploaded Azure blobs to existing application IDs via the admin toolbar.',
            ]} />
            <Warning><strong>Invalid Documents:</strong> If a document is expired, blurred, or truncated, do not approve. Change status to <em>under_review</em> and use the Reply button to request a compliant re-upload.</Warning>
          </>
        ) : (
          <>
            <p>Les documents clients (Passeports, Cartes d'identité, Justificatifs de domicile, Statuts, Certificats de blocage de capital) sont stockés sur Azure Blob Storage sécurisé.</p>
            <p className="font-semibold text-gray-700 pt-1">Liste de Contrôle Conformité :</p>
            <Bullets items={[
              '<strong>Pièces d\'identité (CNI/Passeport)</strong> — Vérifiez le nom complet, la date de naissance, la validité et la bande MRZ. Les 4 coins doivent être visibles.',
              '<strong>Justificatif de domicile</strong> — Moins de 3 mois (facture d\'électricité/eau, relevé bancaire, avis d\'imposition) correspondant à l\'adresse déclarée.',
              '<strong>Documents de société</strong> — Extrait RCS / Kbis, Statuts certifiés et Registre des Bénéficiaires Effectifs (RBE).',
              '<strong>Certificat de dépôt de capital</strong> — Vérifiez le montant du capital libéré, la devise (EUR) et l\'attestation de blocage bancaire.',
            ]} />
            <p className="font-semibold text-gray-700 pt-1">Actions sur les Documents :</p>
            <Bullets items={[
              '<strong>Aperçu (View)</strong> — Ouvre une URL avec jeton SAS temporaire sécurisé pour examen.',
              '<strong>Téléchargement Forcé</strong> — Utilise le proxy de streaming backend (<code class="bg-gray-100 px-1 rounded">/api/admin/download-file</code>) pour contourner les blocages cross-origin et enregistrer avec le nom d\'origine.',
              '<strong>Lier un Document</strong> — Associez un fichier Azure au dossier client via la barre d\'actions.',
            ]} />
            <Warning><strong>Document Invalide :</strong> En cas de document illisible ou expiré, ne validez pas. Passez le dossier en <em>under_review</em> et envoyez un e-mail de demande de régularisation via le bouton Reply.</Warning>
          </>
        )}
      </Section>

      {/* Section 8 — Company Formation & Mortgage Processing (NEW) */}
      <Section id="formation-mortgage" num="08" en="Company Formation & Mortgage Processing Guide" fr="Guide Création de Société & Dossiers Hypothèques" tags={["formation", "mortgage", "sarl", "sarl-s", "olky", "notary", "turnover"]}>
        {T ? (
          <>
            <p>Standard operating procedures for managing complex Company Formation and Mortgage applications.</p>
            <div className="space-y-3 pt-1">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-800 text-xs uppercase tracking-wide mb-1">1. Company Formation (SARL / SARL-S):</p>
                <Bullets items={[
                  '<strong>Entity Type</strong> — SARL-S (simplified SARL, capital €1 to €12,000, natural persons only) vs SARL (standard, min capital €12,000).',
                  '<strong>Shareholders & UBOs</strong> — Validate all ultimate beneficial owners owning &gt;25% equity or voting rights.',
                  '<strong>NACE Code & Purpose</strong> — Verify business activity code and corporate purpose clause compliance with Luxembourg RCS requirements.',
                  '<strong>Capital Account (Olky Integration)</strong> — Verify capital deposit status and blocking certificate issuance before scheduling notary deed.',
                  '<strong>Registered Office & Domiciliation</strong> — Confirm registered address contract or lease agreement.',
                ]} />
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-800 text-xs uppercase tracking-wide mb-1">2. Mortgage Applications:</p>
                <Bullets items={[
                  '<strong>Loan-to-Value (LTV)</strong> — Verify property purchase price, client deposit amount, and requested financing.',
                  '<strong>Debt-to-Income Ratio</strong> — Review monthly income, employment status (CDI / Freelance / Corporate), and existing credit obligations.',
                  '<strong>Property Details</strong> — Ensure property location (Luxembourg / France / Cross-border) and intended use (primary residence, buy-to-let, commercial).',
                  '<strong>Broker Assignment</strong> — Assign qualified ORIAS / regulated banking intermediary to structure bank proposals.',
                ]} />
              </div>
            </div>
          </>
        ) : (
          <>
            <p>Procédures opérationnelles pour le traitement des dossiers de Création de Société et de Demandes de Prêt Hypothécaire.</p>
            <div className="space-y-3 pt-1">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-800 text-xs uppercase tracking-wide mb-1">1. Création de Société (SARL / SARL-S) :</p>
                <Bullets items={[
                  '<strong>Forme Juridique</strong> — SARL-S (capital de 1 € à 12 000 €, personnes physiques uniquement) vs SARL classique (min 12 000 €).',
                  '<strong>Actionnaires & RBE</strong> — Contrôle d\'identité de tous les bénéficiaires effectifs détenant plus de 25% du capital.',
                  '<strong>Code NACE & Objet Social</strong> — Vérification de la conformité de l\'activité avec les exigences du RCS Luxembourg.',
                  '<strong>Compte Capital (Intégration Olky)</strong> — Suivi du dépôt de capital et émission de l\'attestation de blocage avant acte notarié.',
                  '<strong>Domiciliation</strong> — Vérification du contrat de domiciliation ou du bail commercial.',
                ]} />
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-800 text-xs uppercase tracking-wide mb-1">2. Demandes de Prêt Hypothécaire :</p>
                <Bullets items={[
                  '<strong>Ratio LTV (Financement)</strong> — Vérification du prix d\'acquisition, de l\'apport personnel et du montant sollicité.',
                  '<strong>Taux d\'Endettement</strong> — Analyse des revenus mensuels, stabilité professionnelle (CDI, gérant, profession libérale) et charges en cours.',
                  '<strong>Objet du Financement</strong> — Localisation du bien (Luxembourg / France / Frontalier) et nature (résidence principale, locatif, SPV).',
                  '<strong>Attribution Courtier</strong> — Transmission au conseiller ORIAS agréé pour montage des offres bancaires.',
                ]} />
              </div>
            </div>
          </>
        )}
      </Section>

      {/* Section 9 — Document Generation & DocuSign e-Signatures (NEW) */}
      <Section id="docusign-generation" num="09" en="Document Generation & DocuSign e-Signatures" fr="Génération de Documents & Signature Électronique DocuSign" tags={["docusign", "esign", "signature", "der", "cif", "qcc", "rto", "webhook"]}>
        {T ? (
          <>
            <p>The Opulanz onboarding engine automatically fills regulatory Word templates with client data, converts them to PDF, and sends them for electronic signature via DocuSign.</p>
            <p className="font-semibold text-gray-700 pt-1">Generated Document Types (MiFID Compliance):</p>
            <Table
              head={["Code", "Document Name", "Purpose"]}
              rows={[
                ["<code>DER</code>", "Document d'Entrée en Relation", "Mandatory pre-contractual relationship disclosure (ORIAS / AMF)"],
                ["<code>CIF</code>", "Lettre de Mission CIF", "Investment Advisory engagement letter defining advisory scope & fees"],
                ["<code>QCC PP</code>", "Questionnaire Connaissance Client (PP)", "MiFID risk profiling questionnaire for Individuals"],
                ["<code>QCC PM</code>", "Questionnaire Connaissance Client (PM)", "Corporate entity onboarding, governance, and financial assessment"],
                ["<code>ADEQ</code>", "Déclaration d'Adéquation", "Formal suitability report matching investment goals with risk tolerance"],
                ["<code>RTO</code>", "Convention RTO", "Reception & Transmission of Orders agreement for executing operations"],
              ]}
            />
            <p className="font-semibold text-gray-700 pt-2">DocuSign Lifecycle & Statuses:</p>
            <Bullets items={[
              '<strong>sent</strong> — DocuSign envelope created and signing link emailed to the client.',
              '<strong>delivered / viewing</strong> — Client has opened the DocuSign signing portal.',
              '<strong>completed</strong> — All signers have signed. The backend automatically downloads and archives the signed PDF into the client record.',
              '<strong>declined / voided</strong> — Signing was cancelled. Check notes for explanation and re-generate if necessary.',
            ]} />
            <Tip>Automated webhooks notify our system the moment a document is signed — no manual intervention is needed.</Tip>
          </>
        ) : (
          <>
            <p>Le moteur d'onboarding Opulanz remplit automatiquement les modèles réglementaires Word, les convertit en PDF et les soumet à signature électronique via DocuSign.</p>
            <p className="font-semibold text-gray-700 pt-1">Documents Générés (Conformité MiFID) :</p>
            <Table
              head={["Code", "Document", "Finalité"]}
              rows={[
                ["<code>DER</code>", "Document d'Entrée en Relation", "Information précontractuelle obligatoire (ORIAS / AMF)"],
                ["<code>CIF</code>", "Lettre de Mission CIF", "Convention de Conseil en Investissements Financiers (honoraires & périmètre)"],
                ["<code>QCC PP</code>", "Questionnaire Connaissance Client (PP)", "Profilage de risque et connaissances financières Personne Physique"],
                ["<code>QCC PM</code>", "Questionnaire Connaissance Client (PM)", "Dossier personne morale, gouvernance et bilan financier"],
                ["<code>ADEQ</code>", "Déclaration d'Adéquation", "Rapport d'adéquation entre le profil de risque et la stratégie d'investissement"],
                ["<code>RTO</code>", "Convention RTO", "Convention de Réception et Transmission d'Ordres"],
              ]}
            />
            <p className="font-semibold text-gray-700 pt-2">Cycle de Vie DocuSign :</p>
            <Bullets items={[
              '<strong>sent</strong> — Enveloppe DocuSign créée et lien de signature envoyé au client.',
              '<strong>delivered / viewing</strong> — Le client a ouvert l\'interface de signature.',
              '<strong>completed</strong> — Tous les signataires ont paraphé. Le PDF signé est automatiquement téléchargé et rattaché au dossier.',
              '<strong>declined / voided</strong> — Signature refusée ou annulée. Consultez les motifs et relancez le processus si nécessaire.',
            ]} />
            <Tip>Des webhooks automatisés mettent à jour le statut dès la signature — aucune action manuelle de téléchargement n'est requise.</Tip>
          </>
        )}
      </Section>

      {/* Section 10 — Search */}
      <Section id="search" num="10" en="Global Search & Instant Jump" fr="Recherche Globale & Accès Direct" tags={["search", "lookup", "filter", "global"]}>
        {T ? (
          <>
            <p>The search bar in the top navigation searches submissions, support messages, and live chats simultaneously.</p>
            <Bullets items={[
              'Click the search field in the topbar and type at least 2 characters.',
              'Results are grouped by type: Submissions, Support Messages, Live Chats.',
              'Click any result to jump to that record in the right tab.',
              'Press Escape or click elsewhere to close the dropdown.',
            ]} />
            <Tip>Use Global Search first whenever a client calls or emails — type their name or reference number to find their record instantly.</Tip>
          </>
        ) : (
          <>
            <p>La barre de recherche en haut effectue une recherche simultanée dans les dossiers, messages support et chats.</p>
            <Bullets items={[
              'Cliquez sur le champ de recherche en haut et tapez au moins 2 caractères.',
              'Résultats groupés par type : Dossiers, Messages Support, Chats en Direct.',
              'Cliquez sur un résultat pour accéder au dossier dans l\'onglet correspondant.',
              'Appuyez sur Échap ou cliquez ailleurs pour fermer.',
            ]} />
            <Tip>Utilisez la Recherche Globale en premier quand un client appelle — tapez son nom ou référence pour trouver son dossier instantanément.</Tip>
          </>
        )}
      </Section>

      {/* Section 11 — Status Reference */}
      <Section id="statuses" num="11" en="Status & Lifecycle Reference Matrix" fr="Matrice des Statuts & Cycles de Vie" tags={["matrix", "states", "submitted", "approved", "confirmed", "scheduled"]}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {T ? "Applications — Individual, Company, Formation, Accounting, Mortgage" : "Demandes — Individuel, Société, Formation, Comptabilité, Hypothèque"}
            </p>
            <Flow chips={[
              { cls: "bg-blue-100 text-blue-700", label: "submitted" },
              { cls: "bg-yellow-100 text-yellow-800", label: "under review" },
              { cls: "bg-green-100 text-green-700", label: "approved" },
              { cls: "bg-red-100 text-red-700", label: "rejected" },
            ]} />
            <Table
              head={[T ? "Status" : "Statut", T ? "Meaning" : "Signification"]}
              rows={T ? [
                ["<span class='bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-semibold'>submitted</span>", "Form received, awaiting team review"],
                ["<span class='bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[10px] font-semibold'>under review</span>", "Team is reviewing the application and documents"],
                ["<span class='bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-semibold'>approved</span>", "Application accepted — notify and onboard the client"],
                ["<span class='bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-semibold'>rejected</span>", "Application declined — rejection reason stored internally"],
              ] : [
                ["<span class='bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-semibold'>submitted</span>", "Formulaire reçu, en attente de révision"],
                ["<span class='bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[10px] font-semibold'>under review</span>", "L'équipe examine la demande et les documents"],
                ["<span class='bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-semibold'>approved</span>", "Demande acceptée — notifier et intégrer le client"],
                ["<span class='bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-semibold'>rejected</span>", "Demande refusée — motif conservé en interne"],
              ]}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {T ? "Bookings — Tax Advisory & Life Insurance" : "Rendez-vous — Conseil Fiscal & Assurance Vie"}
            </p>
            <Flow chips={[
              { cls: "bg-amber-100 text-amber-800", label: "pending" },
              { cls: "bg-blue-100 text-blue-700", label: "confirmed" },
              { cls: "bg-green-100 text-green-700", label: "completed" },
              { cls: "bg-gray-100 text-gray-600", label: "cancelled" },
            ]} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {T ? "Enquiries — Investment Advisory" : "Demandes — Conseil en Investissement"}
            </p>
            <Flow chips={[
              { cls: "bg-blue-100 text-blue-700", label: "new" },
              { cls: "bg-cyan-100 text-cyan-700", label: "contacted" },
              { cls: "bg-violet-100 text-violet-700", label: "qualified" },
              { cls: "bg-green-100 text-green-700", label: "converted" },
              { cls: "bg-gray-100 text-gray-600", label: "closed" },
            ]} />
          </div>
        </div>
      </Section>

      {/* Section 12 — Email Routing */}
      <Section id="email-routing" num="12" en="Email Routing & Sender Compliance" fr="Routage E-mail & Conformité des Expéditeurs" tags={["routing", "smtp", "sender", "inbox", "mail"]}>
        {T ? (
          <>
            <p>When you reply to a client from the Submissions tab, the email comes from the address below for that service.</p>
          </>
        ) : (
          <>
            <p>Lorsque vous répondez à un client depuis l'onglet Dossiers, l'e-mail provient de l'adresse indiquée pour ce service.</p>
          </>
        )}
        <Table
          head={[T ? "Service" : "Service", T ? "Sender Address" : "Adresse Expéditrice"]}
          rows={[
            [T ? "Individual Account" : "Compte Individuel", "<code class='bg-gray-100 px-1 rounded'>info@opulanz.com</code>"],
            [T ? "Company Account" : "Compte Société", "<code class='bg-gray-100 px-1 rounded'>company-set@opulanz.com</code>"],
            [T ? "Company Formation" : "Création de Société", "<code class='bg-gray-100 px-1 rounded'>company-set@opulanz.com</code>"],
            [T ? "Accounting" : "Comptabilité", "<code class='bg-gray-100 px-1 rounded'>accounting@opulanz.com</code>"],
            [T ? "Mortgage" : "Hypothèque", "<code class='bg-gray-100 px-1 rounded'>mortgages@opulanz.com</code>"],
            [T ? "Tax Advisory" : "Conseil Fiscal", "<code class='bg-gray-100 px-1 rounded'>tax-ad@opulanz.com</code>"],
            [T ? "Life Insurance" : "Assurance Vie", "<code class='bg-gray-100 px-1 rounded'>insurance@opulanz.com</code>"],
            [T ? "Investment Advisory" : "Conseil en Investissement", "<code class='bg-gray-100 px-1 rounded'>invest-ad@opulanz.com</code>"],
          ]}
        />
        <Note>
          {T
            ? <><strong>Always</strong> check the amber notice box inside the submission detail before replying — if a record was moved between services, the sender address may differ from what you expect.</>
            : <><strong>Vérifiez toujours</strong> l'encadré amber dans le détail du dossier avant de répondre — si un dossier a changé de service, l'adresse expéditrice peut être différente.</>
          }
        </Note>
      </Section>

      {/* Section 13 — Compliance & GDPR (NEW) */}
      <Section id="compliance-gdpr" num="13" en="Compliance, KYC/KYB & Data Privacy (GDPR)" fr="Conformité, KYC/KYB & Confidentialité (RGPD)" tags={["gdpr", "rgpd", "compliance", "privacy", "orias", "amf", "acpr"]}>
        {T ? (
          <>
            <p>Opulanz operates under European financial and banking intermediation regulations (ACPR, AMF, CSSF, ORIAS n° 21003660).</p>
            <p className="font-semibold text-gray-700 pt-1">Key Compliance Obligations:</p>
            <Bullets items={[
              '<strong>Anti-Money Laundering (AML / CFT)</strong> — Verify source of funds, purpose of company creation, and screen UBOs against PEP (Politically Exposed Persons) and sanctions watchlists.',
              '<strong>GDPR / Data Minimization</strong> — Only collect and retain documents necessary for compliance. Never share client identity records outside authorized channels.',
              '<strong>Right to Erasure (RTBF)</strong> — GDPR deletion requests must be escalated to the Data Protection Officer (DPO). Mandatory statutory financial records are retained as required by Luxembourg law.',
              '<strong>Audit Trail</strong> — Every status update, document generation, and email dispatch is timestamped and recorded in the database audit log.',
            ]} />
            <Warning><strong>Confidentiality:</strong> Do not download client identification documents onto unencrypted personal devices.</Warning>
          </>
        ) : (
          <>
            <p>Opulanz opère conformément aux réglementations financières et d'intermédiation bancaire européennes (ACPR, AMF, CSSF, ORIAS n° 21003660).</p>
            <p className="font-semibold text-gray-700 pt-1">Obligations Réglementaires Clés :</p>
            <Bullets items={[
              '<strong>Lutte Anti-Blanchiment (LCB-FT)</strong> — Vérification de l\'origine des fonds, de la cohérence de l\'activité et filtrage des PPE (Personnes Politiquement Exposées) et listes de sanctions.',
              '<strong>RGPD & Confidentialité</strong> — Collecte strictement limitée aux besoins réglementaires. Interdiction formelle de diffuser des pièces d\'identité en dehors des canaux sécurisés.',
              '<strong>Droit à l\'Effacement</strong> — Les demandes de suppression de données doivent être transmises au DPO. Les pièces comptables et d\'identification légale sont conservées selon les durées d\'archivage obligatoires.',
              '<strong>Piste d\'Audit</strong> — Chaque changement de statut, génération de document et envoi d\'e-mail est horodaté dans les journaux d\'audit.',
            ]} />
            <Warning><strong>Confidentialité :</strong> Ne téléchargez pas de pièces d\'identité clients sur des postes personnels non chiffrés.</Warning>
          </>
        )}
      </Section>

      {/* Section 14 — Troubleshooting & FAQ (NEW) */}
      <Section id="troubleshooting" num="14" en="Troubleshooting & Operations FAQ" fr="Dépannage & FAQ Opérations" tags={["faq", "error", "smtp", "troubleshoot", "failed", "bug", "support"]}>
        {T ? (
          <>
            <p className="font-semibold text-gray-700">Frequently Asked Operational Questions & Solutions:</p>
            <div className="space-y-3 pt-1">
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="font-bold text-gray-900 text-xs">Q: Email reply failed to send with an SMTP error</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Solution:</strong> Verify that <code className="bg-gray-100 px-1 rounded">EMAIL_USER</code> and <code className="bg-gray-100 px-1 rounded">EMAIL_PASS</code> are valid in the server configuration. If the client email is invalid, check their alternate email or contact them via Phone/Live Chat.
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="font-bold text-gray-900 text-xs">Q: Document preview link fails with "Blob not found" or "Authentication failed"</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Solution:</strong> Azure SAS URLs expire after a set time. Click the <em>Download</em> button to stream the file through the admin proxy with a freshly generated SAS token.
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="font-bold text-gray-900 text-xs">Q: DocuSign envelope signed by client but status shows pending</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Solution:</strong> Check if DocuSign webhooks are receiving events on <code className="bg-gray-100 px-1 rounded">/api/document-generation/webhook</code>. You can trigger a manual status refresh by clicking the document details in the client file.
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="font-bold text-gray-900 text-xs">Q: A client wants to change their submitted application details</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Solution:</strong> Leave an internal team note documenting the requested change and requested verification proofs. Update the status to <em>under_review</em> while processing the amendments.
                </p>
              </div>
            </div>
            <Note>For server-level technical support or database issues, contact the Opulanz engineering team at <code className="bg-gray-100 px-1 rounded">devops@opulanz.com</code>.</Note>
          </>
        ) : (
          <>
            <p className="font-semibold text-gray-700">Questions Fréquentes & Résolutions Opérationnelles :</p>
            <div className="space-y-3 pt-1">
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="font-bold text-gray-900 text-xs">Q : L'envoi de réponse e-mail échoue avec une erreur SMTP</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Solution :</strong> Vérifiez les variables d'environnement <code className="bg-gray-100 px-1 rounded">EMAIL_USER</code> et <code className="bg-gray-100 px-1 rounded">EMAIL_PASS</code>. Si l'e-mail du client est erroné, contactez-le par téléphone ou via le chat.
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="font-bold text-gray-900 text-xs">Q : L'aperçu du document échoue avec "Blob not found" ou URL expirée</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Solution :</strong> Les jetons SAS Azure expirent après une durée définie. Utilisez le bouton <em>Download</em> qui génère un flux sécurisé actualisé via le proxy admin.
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="font-bold text-gray-900 text-xs">Q : Document signé sous DocuSign mais statut toujours en attente</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Solution :</strong> Vérifiez que le webhook DocuSign transmet bien à <code className="bg-gray-100 px-1 rounded">/api/document-generation/webhook</code>.
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="font-bold text-gray-900 text-xs">Q : Un client demande la modification d'informations sur son dossier</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Solution :</strong> Enregistrez une note interne avec le détail des modifications demandées et passez le statut en <em>under_review</em> pendant la vérification des pièces justificatives.
                </p>
              </div>
            </div>
            <Note>Pour toute assistance technique serveur ou base de données, contactez l'équipe DevOps à <code className="bg-gray-100 px-1 rounded">devops@opulanz.com</code>.</Note>
          </>
        )}
      </Section>
    </div>
  );
}

// ─── Inbox Tab ────────────────────────────────────────────────────────────────
interface InboxEmail {
  uid: number;
  subject: string;
  from: string;
  fromEmail: string;
  fromName: string;
  date: string;
  seen: boolean;
}

interface InboxEmailDetail extends InboxEmail {
  replyTo: string;
  to: string;
  text: string;
  html: string;
  attachments: Array<{ filename: string; contentType: string; size: number }>;
}

function InboxTab() {
  const [emails, setEmails]           = React.useState<InboxEmail[]>([]);
  const [loading, setLoading]         = React.useState(true);
  const [error, setError]             = React.useState("");
  const [testResult, setTestResult]   = React.useState<Record<string, unknown> | null>(null);
  const [testing, setTesting]         = React.useState(false);
  const [selected, setSelected]       = React.useState<InboxEmailDetail | null>(null);
  const [loadingEmail, setLoadingEmail] = React.useState(false);
  const [replyText, setReplyText]     = React.useState("");
  const [sending, setSending]         = React.useState(false);
  const [sentMsg, setSentMsg]         = React.useState("");
  const [replyError, setReplyError]   = React.useState("");

  const fetchEmails = React.useCallback(() => {
    setLoading(true);
    setError("");
    setTestResult(null);
    fetch(`${API}/api/admin/inbox?limit=100`, { headers: { "x-admin-token": getToken() } })
      .then(r => r.json())
      .then(d => {
        if (d?.success) setEmails(d.data);
        else setError(d?.error || "Failed to load inbox");
      })
      .catch(() => setError("Cannot reach backend"))
      .finally(() => setLoading(false));
  }, []);

  const testConnection = () => {
    setTesting(true);
    setTestResult(null);
    fetch(`${API}/api/admin/inbox/test`, { headers: { "x-admin-token": getToken() } })
      .then(r => r.json())
      .then(d => setTestResult(d))
      .catch(() => setTestResult({ success: false, error: "Cannot reach backend" }))
      .finally(() => setTesting(false));
  };

  React.useEffect(() => { fetchEmails(); }, [fetchEmails]);

  const openEmail = (uid: number) => {
    setLoadingEmail(true);
    setSelected(null);
    setReplyText("");
    setSentMsg("");
    setReplyError("");
    fetch(`${API}/api/admin/inbox/${uid}`, { headers: { "x-admin-token": getToken() } })
      .then(r => r.json())
      .then(d => {
        if (d?.success) {
          setSelected(d.data);
          // Mark as seen in local list
          setEmails(prev => prev.map(e => e.uid === uid ? { ...e, seen: true } : e));
        } else {
          setError(d?.error || "Failed to load email");
        }
      })
      .catch(() => setError("Cannot load email"))
      .finally(() => setLoadingEmail(false));
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    setSentMsg("");
    setReplyError("");
    try {
      const res = await fetch(`${API}/api/admin/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getToken() },
        body: JSON.stringify({
          toEmail:      selected.replyTo || selected.fromEmail,
          toName:       selected.fromName || "",
          serviceType:  "general",
          subject:      selected.subject.startsWith("Re:") ? selected.subject : `Re: ${selected.subject}`,
          message:      replyText.trim(),
          submissionRef: `inbox-${selected.uid}`,
          adminName:    "Opulanz Support Team",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSentMsg("Reply sent successfully.");
        setReplyText("");
      } else {
        setReplyError(data?.error || "Failed to send reply.");
      }
    } catch {
      setReplyError("Cannot reach server.");
    } finally {
      setSending(false);
    }
  };

  const unreadCount = emails.filter(e => !e.seen).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            contact@opulanz.com &mdash; client support &amp; application emails
            {unreadCount > 0 && (
              <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchEmails}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <span>↻</span> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-4 space-y-3">
          <p className="text-sm font-semibold text-red-700">IMAP connection error</p>
          <p className="text-sm text-red-600 font-mono break-all">{error}</p>
          <div className="pt-1 border-t border-red-100 space-y-2 text-xs text-red-600">
            {/invalid credentials/i.test(error) ? (
              <>
                <p className="font-semibold">Google is rejecting the password. Regular Gmail passwords do not work for IMAP — an App Password is required.</p>
                <p className="font-medium mt-1">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1 text-red-500">
                  <li>Sign in to <strong>contact@opulanz.com</strong> at myaccount.google.com</li>
                  <li>Go to <strong>Security → 2-Step Verification</strong> (enable it if off)</li>
                  <li>Scroll down to <strong>App Passwords</strong> → create one for "Mail"</li>
                  <li>Copy the 16-character code Google gives you</li>
                  <li>Go to Azure DevOps → Pipelines → Library → <code className="bg-red-100 px-1 rounded">backend-env-vars</code></li>
                  <li>Update <code className="bg-red-100 px-1 rounded">INBOX_PASS</code> to the 16-char App Password (no spaces)</li>
                  <li>Save and re-run the backend pipeline, then refresh this page</li>
                </ol>
                <p className="mt-1 text-red-400">Also confirm Gmail IMAP is enabled: Gmail → Settings → See all settings → Forwarding and POP/IMAP → Enable IMAP</p>
              </>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                <li>Gmail IMAP not enabled — Gmail Settings → Forwarding and POP/IMAP → Enable IMAP</li>
                <li>App Password required — Google Account → Security → App Passwords</li>
                <li><code className="bg-red-100 px-1 rounded">INBOX_USER</code> / <code className="bg-red-100 px-1 rounded">INBOX_PASS</code> not set in Azure variable group</li>
              </ul>
            )}
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={testConnection}
              disabled={testing}
              className="px-3 py-1.5 rounded-lg bg-red-100 border border-red-200 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {testing ? "Testing…" : "Test IMAP connection"}
            </button>
            {testResult && (
              <span className={`text-xs font-medium ${testResult.success ? "text-green-600" : "text-red-600"}`}>
                {testResult.success
                  ? `Connected — ${testResult.messages} messages, ${testResult.unseen} unread`
                  : String(testResult.serverResponse || testResult.error || "Failed")}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-4 items-start">
        {/* Email list */}
        <div className="w-full lg:w-2/5 xl:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              {loading ? "Loading…" : `${emails.length} message${emails.length !== 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[calc(100vh-260px)] overflow-y-auto">
            {loading ? (
              <div className="py-10 flex justify-center"><div className="w-6 h-6 border-4 border-[#b59354] border-t-transparent rounded-full animate-spin" /></div>
            ) : emails.length === 0 ? (
              <div className="px-5 py-10 text-sm text-gray-400 text-center">No client emails found</div>
            ) : (
              emails.map(msg => (
                <button
                  key={msg.uid}
                  type="button"
                  onClick={() => openEmail(msg.uid)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selected?.uid === msg.uid
                      ? "bg-[#b59354]/10 border-l-2 border-[#b59354]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!msg.seen && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-[#b59354] flex-shrink-0" />
                    )}
                    {msg.seen && <span className="w-2 flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className={`text-sm truncate ${!msg.seen ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {msg.fromName || msg.fromEmail}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{fmt(msg.date)}</span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${!msg.seen ? "text-gray-600 font-medium" : "text-gray-500"}`}>
                        {msg.subject}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Email detail + reply */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loadingEmail ? (
            <div className="py-16 flex justify-center"><div className="w-7 h-7 border-4 border-[#b59354] border-t-transparent rounded-full animate-spin" /></div>
          ) : !selected ? (
            <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
              <span className="text-4xl">✉️</span>
              <p className="text-sm">Select an email to read</p>
            </div>
          ) : (
            <div className="flex flex-col h-full max-h-[calc(100vh-260px)]">
              {/* Email header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-base leading-snug mb-3">{selected.subject}</h3>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                  <span className="text-gray-400 font-medium">From</span>
                  <span className="text-gray-700">{selected.from}</span>
                  <span className="text-gray-400 font-medium">To</span>
                  <span className="text-gray-700">{selected.to}</span>
                  <span className="text-gray-400 font-medium">Date</span>
                  <span className="text-gray-700">{fmt(selected.date)}</span>
                </div>
              </div>

              {/* Email body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {selected.html ? (
                  <iframe
                    srcDoc={`<!doctype html><html><head><style>body{font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#333;margin:0;padding:0}a{color:#b59354}</style></head><body>${selected.html}</body></html>`}
                    className="w-full min-h-[200px] border-0"
                    sandbox="allow-same-origin"
                    style={{ height: "auto", minHeight: "200px" }}
                    onLoad={(e) => {
                      const iframe = e.currentTarget;
                      if (iframe.contentDocument) {
                        iframe.style.height = iframe.contentDocument.body.scrollHeight + "px";
                      }
                    }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{selected.text}</pre>
                )}
                {selected.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600">
                          <span>📎</span>
                          <span className="truncate max-w-[160px]">{att.filename}</span>
                          <span className="text-gray-400">({Math.round(att.size / 1024)} KB)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply box */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Reply to <span className="text-gray-700">{selected.replyTo || selected.fromEmail}</span>
                </p>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write your reply…"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#b59354]/40 bg-white"
                />
                {replyError && <p className="text-xs text-red-500 mt-1">{replyError}</p>}
                {sentMsg   && <p className="text-xs text-green-600 mt-1">{sentMsg}</p>}
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={sendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Send Reply"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-[#b59354] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <p className="text-3xl mb-2">📭</p>
      <p className="text-sm">{text}</p>
    </div>
  );
}
