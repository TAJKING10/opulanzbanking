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
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SERVICES = [
  { key: "all",                label: "All Services",        color: "bg-gray-500" },
  { key: "individual",         label: "Individual Account",  color: "bg-blue-500" },
  { key: "company",            label: "Company Account",     color: "bg-indigo-500" },
  { key: "company_formation",  label: "Company Formation",   color: "bg-purple-500" },
  { key: "accounting",         label: "Accounting",          color: "bg-emerald-500" },
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
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("admin_token") || "";
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
  const [tab, setTab] = React.useState<"overview" | "submissions" | "support" | "contacts">("overview");

  // Check auth
  React.useEffect(() => {
    if (!localStorage.getItem("admin_token")) router.replace("/admin");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.replace("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f8]">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold tracking-widest text-[#b59354]">OPULANZ</span>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1">
              {([
                { key: "overview",     label: "Overview" },
                { key: "contacts",     label: "Support Messages" },
                { key: "support",      label: "Live Chats" },
                { key: "submissions",  label: "Submissions" },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
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
        {tab === "overview"     && <OverviewTab />}
        {tab === "contacts"     && <ContactsTab />}
        {tab === "submissions"  && <SubmissionsTab />}
        {tab === "support"      && <SupportTab />}
      </main>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
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
  const cards = [
    { label: "Individual Accounts", value: s.individual || 0,          color: "from-blue-500 to-blue-600",      icon: "👤" },
    { label: "Company Accounts",    value: s.company || 0,             color: "from-indigo-500 to-indigo-600",  icon: "🏢" },
    { label: "Company Formation",   value: s.company_formation || 0,   color: "from-purple-500 to-purple-600",  icon: "⚖️" },
    { label: "Accounting",          value: s.accounting || 0,          color: "from-emerald-500 to-emerald-600",icon: "📊" },
    { label: "Tax Advisory",        value: s.tax_advisory || 0,        color: "from-amber-500 to-amber-600",    icon: "🧾" },
    { label: "Life Insurance",      value: s.life_insurance || 0,      color: "from-red-500 to-red-600",        icon: "❤️" },
    { label: "Investment Advisory", value: s.investment_advisory || 0, color: "from-cyan-500 to-cyan-600",      icon: "📈" },
    { label: "Support Chats Open",  value: s.support_open || 0,        color: "from-orange-500 to-orange-600",  icon: "💬" },
  ];

  const total = (s.individual||0)+(s.company||0)+(s.company_formation||0)+
                (s.accounting||0)+(s.tax_advisory||0)+(s.life_insurance||0)+
                (s.investment_advisory||0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">Total submissions across all services: <strong>{total}</strong></p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${card.color} p-4 flex items-center justify-between`}>
              <span className="text-white font-bold text-2xl">{card.value}</span>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-700">{card.label}</p>
            </div>
          </div>
        ))}
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

// ─── Submissions Tab ──────────────────────────────────────────────────────────
function SubmissionsTab() {
  const [submissions, setSubmissions]   = React.useState<Submission[]>([]);
  const [loading, setLoading]           = React.useState(true);
  const [service, setService]           = React.useState("all");
  const [search, setSearch]             = React.useState("");
  const [selected, setSelected]         = React.useState<Submission | null>(null);
  const [replyOpen, setReplyOpen]       = React.useState(false);
  const [replySending, setReplySending] = React.useState(false);
  const [replyMsg, setReplyMsg]         = React.useState("");
  const [replySubject, setReplySubject] = React.useState("");
  const [toast, setToast]               = React.useState("");
  const [replies, setReplies]           = React.useState<Array<{id:number;subject:string|null;message:string;sent_at:string}>>([]);
  const [docs, setDocs]                 = React.useState<Array<{id:number;file_name:string;file_url:string;mime_type:string|null;type:string}>>([]);
  const [attachFiles, setAttachFiles]   = React.useState<File[]>([]);
  const [attachDocs, setAttachDocs]     = React.useState<number[]>([]);
  const fileInputRef                    = React.useRef<HTMLInputElement>(null);

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

  const loadDocs = (sub: Submission) => {
    // Payload files (company formation, accounting, etc.) — no Azure URL available
    const payloadDocs = (sub.payloadFiles || []).map((f, i) => ({
      id: -(i + 1),
      file_name: f.filename,
      file_url: f.url || "",
      mime_type: f.type || null,
      type: f.type || "uploaded_file",
      size: f.size,
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
      // Attach selected existing docs by URL
      const selectedDocs = docs
        .filter(d => attachDocs.includes(d.id))
        .map(d => ({ name: d.file_name, url: d.file_url }));
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
            onChange={e => setService(e.target.value)}
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
                onClick={() => { setSelected(sub); setReplyOpen(false); setReplies([]); setDocs([]); setAttachFiles([]); setAttachDocs([]); loadReplies(sub); loadDocs(sub); }}
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
                {selected.clientEmail && (
                  <button
                    onClick={() => setReplyOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply via Email
                  </button>
                )}
              </div>

              {/* Service email note */}
              <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Replies to this client will come from:{" "}
                <strong className="font-mono">{SERVICE_EMAILS[selected.service] || "support@opulanz.com"}</strong>
              </div>

              {/* Payload details */}
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Submission Data</h3>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(selected.payload || {}).map(([key, value]) => {
                      if (value === null || value === undefined || value === "") return null;
                      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
                      const display = typeof value === "object" ? JSON.stringify(value) : String(value);
                      return (
                        <tr key={key} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 pr-4 text-gray-500 font-medium w-48 align-top">{label}</td>
                          <td className="py-2 text-gray-900 break-all">{display}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Attached Documents */}
              {docs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Attached Files ({docs.length})</h3>
                  <div className="space-y-2">
                    {(docs as Array<{id:number;file_name:string;file_url:string;mime_type:string|null;type:string;size?:number;file_size?:number;fromPayload?:boolean}>).map(doc => {
                      const isPdf = doc.mime_type === "application/pdf" || doc.file_name?.endsWith(".pdf");
                      const isImg = doc.mime_type?.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp)$/i.test(doc.file_name || "");
                      const icon = isPdf ? "📄" : isImg ? "🖼️" : "📎";
                      const hasUrl = !!doc.file_url;
                      const rawSize = doc.size || doc.file_size;
                      const sizeStr = rawSize ? (rawSize > 1024*1024 ? `${(rawSize/1024/1024).toFixed(1)} MB` : `${Math.round(rawSize/1024)} KB`) : null;
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xl">{icon}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {doc.type?.replace(/_/g, " ")}
                                {sizeStr ? ` · ${sizeStr}` : ""}
                                {doc.fromPayload && !hasUrl ? " · stored in Azure" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                            {hasUrl ? (
                              <>
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                  View
                                </a>
                                <a
                                  href={doc.file_url}
                                  download={doc.file_name}
                                  className="text-xs px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Download
                                </a>
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
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{r.message}</p>
                    </div>
                  ))}
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
function SupportTab() {
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

function ContactsTab() {
  const [contacts, setContacts]         = React.useState<Contact[]>([]);
  const [loading, setLoading]           = React.useState(true);
  const [selected, setSelected]         = React.useState<Contact | null>(null);
  const [filter, setFilter]             = React.useState<"all"|"open"|"replied"|"closed">("all");
  const [search, setSearch]             = React.useState("");
  const [replyOpen, setReplyOpen]       = React.useState(false);
  const [replyMsg, setReplyMsg]         = React.useState("");
  const [replySubject, setReplySubject] = React.useState("");
  const [replySending, setReplySending] = React.useState(false);
  const [toast, setToast]               = React.useState("");

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
