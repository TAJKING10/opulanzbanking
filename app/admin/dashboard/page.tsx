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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = React.useState<"overview" | "submissions" | "pipeline" | "support" | "contacts">("overview");
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
                { key: "contacts",     label: "Support Messages" },
                { key: "support",      label: "Live Chats" },
                { key: "submissions",  label: "Submissions" },
                { key: "pipeline",     label: "Pipeline" },
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
          <OverviewTab onOpenSubmissions={openSubmissions} onOpenSupport={() => openSupport()} />
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
}: {
  onOpenSubmissions: (serviceKey: string) => void;
  onOpenSupport: () => void;
}) {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

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
  investment_advisory: "investment_inquiry",
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
          {columns.map(status => {
            const cards = byStatus[status] || [];
            const isOver = dropTarget === status;
            return (
              <div
                key={status}
                onDragOver={e => {
                  e.preventDefault();
                  setDropTarget(status);
                }}
                onDragLeave={() => setDropTarget(prev => (prev === status ? null : prev))}
                onDrop={e => {
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
                      {status.replace(/_/g, " ")}
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
    // Payload files (company formation, accounting, etc.)
    const payloadDocs = (sub.payloadFiles || []).map((f, i) => ({
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
        const dbDocs = d.success ? d.data : [];
        // Merge: DB docs first (have URLs), then payload-only files not already covered
        setDocs([...dbDocs, ...payloadDocs] as never[]);
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
              {docs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Attached Files ({docs.length})</h3>
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
                                {doc.type?.replace(/_/g, " ")}
                                {sizeStr ? ` · ${sizeStr}` : ""}
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
  "status", "service", "service_type", "serviceType",
]);

/** Keys that contain person arrays (directors, shareholders, managers, beneficiaries) */
const PERSON_ARRAY_KEYS = new Set([
  "directors", "Directors", "shareholders", "Shareholders",
  "managers", "Managers", "beneficiaries", "Beneficiaries",
  "contacts", "signatories",
]);

/** Keys that contain consent/boolean maps */
const CONSENT_KEYS = new Set([
  "consents", "Consents", "consent", "agreements", "termsAccepted",
]);

/** Keys that contain upload-related data */
const UPLOAD_KEYS = new Set([
  "uploads", "Uploads", "upload",
]);

/** Convert camelCase / snake_case key into a readable label */
function prettyLabel(key: string): string {
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

  return String(value);
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
function PayloadRenderer({ payload, onPreview }: { payload: Record<string, unknown>; onPreview?: (url: string, name: string, blobName?: string) => void }) {
  // Separate entries into categories
  const personSections: Array<{ key: string; label: string; items: Record<string, unknown>[] }> = [];
  const consentSections: Array<{ key: string; label: string; data: Record<string, unknown> }> = [];
  const uploadSections: Array<{ key: string; label: string; data: Record<string, unknown> }> = [];
  const regularEntries: Array<[string, unknown]> = [];

  for (const [key, value] of Object.entries(payload)) {
    if (HIDDEN_KEYS.has(key)) continue;
    if (value === null || value === undefined || value === "") continue;

    // Empty arrays
    if (Array.isArray(value) && value.length === 0) continue;

    if (PERSON_ARRAY_KEYS.has(key) && Array.isArray(value)) {
      personSections.push({ key, label: prettyLabel(key), items: value as Record<string, unknown>[] });
    } else if (CONSENT_KEYS.has(key) && typeof value === "object" && !Array.isArray(value)) {
      consentSections.push({ key, label: prettyLabel(key), data: value as Record<string, unknown> });
    } else if (UPLOAD_KEYS.has(key) && typeof value === "object") {
      uploadSections.push({ key, label: prettyLabel(key), data: value as Record<string, unknown> });
    } else {
      regularEntries.push([key, value]);
    }
  }

  return (
    <div className="space-y-5">
      {/* Regular key-value pairs */}
      {regularEntries.length > 0 && (
        <table className="w-full text-sm">
          <tbody>
            {regularEntries.map(([key, value]) => {
              // If it's an object/array that isn't handled above, render it nicely
              if (typeof value === "object" && value !== null) {
                // Nested object — render sub-fields
                if (!Array.isArray(value)) {
                  const obj = value as Record<string, unknown>;
                  const subEntries = Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== "");
                  if (subEntries.length === 0) return null;
                  return (
                    <tr key={key} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 text-gray-500 font-medium w-48 align-top">{prettyLabel(key)}</td>
                      <td className="py-2">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {subEntries.map(([sk, sv]) => {
                            const formatted = formatValue(sk, sv);
                            if (formatted === null) return null;
                            return (
                              <div key={sk}>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{prettyLabel(sk)}</span>
                                <p className="text-sm text-gray-800">{formatted}</p>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                }
                // Array of primitives
                if (Array.isArray(value)) {
                  return (
                    <tr key={key} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 text-gray-500 font-medium w-48 align-top">{prettyLabel(key)}</td>
                      <td className="py-2 text-gray-900">{(value as unknown[]).map(String).join(", ")}</td>
                    </tr>
                  );
                }
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

      {/* Person sections (directors, shareholders, managers) */}
      {personSections.map(section => (
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

      {/* Consent sections */}
      {consentSections.map(section => (
        <div key={section.key}>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>📋</span> {section.label}
          </h4>
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <ConsentDisplay consents={section.data} />
          </div>
        </div>
      ))}

      {/* Upload sections */}
      {uploadSections.map(section => (
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
