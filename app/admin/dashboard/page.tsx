"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User, Building2, Scale, BookOpen, Receipt, Heart, TrendingUp,
  MessageSquare, AtSign, Paperclip, Download, Eye, X,
} from "lucide-react";

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
  { key: "all",                 label: "All Services" },
  { key: "individual",          label: "Individual Account" },
  { key: "company",             label: "Company Account" },
  { key: "company_formation",   label: "Company Formation" },
  { key: "accounting",          label: "Accounting" },
  { key: "tax_advisory",        label: "Tax Advisory" },
  { key: "life_insurance",      label: "Life Insurance" },
  { key: "investment_advisory", label: "Investment Advisory" },
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
  submitted:    "bg-[#b59354]/10 text-[#886844]",
  active:       "bg-[#b59354]/10 text-[#886844]",
  open:         "bg-[#b59354]/10 text-[#886844]",
  approved:     "bg-[#252623]/10 text-[#252623]",
  confirmed:    "bg-[#252623]/10 text-[#252623]",
  replied:      "bg-[#252623]/10 text-[#252623]",
  under_review: "bg-stone-100 text-stone-500",
  pending:      "bg-stone-100 text-stone-500",
  waiting:      "bg-stone-100 text-stone-500",
  rejected:     "bg-red-50 text-red-500",
  cancelled:    "bg-red-50 text-red-500",
  closed:       "bg-gray-100 text-gray-400",
  draft:        "bg-gray-100 text-gray-400",
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

  React.useEffect(() => {
    if (!localStorage.getItem("admin_token")) router.replace("/admin");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.replace("/admin");
  };

  const navItems = [
    { key: "overview",    label: "Overview" },
    { key: "contacts",    label: "Support Messages" },
    { key: "support",     label: "Live Chats" },
    { key: "submissions", label: "Submissions" },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f8]">
      {/* Top Bar */}
      <header className="bg-[#252623] sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold tracking-[0.22em] text-[#b59354]">OPULANZ</span>
            <div className="h-4 w-px bg-white/15" />
            <span className="text-[10px] text-white/30 font-semibold uppercase tracking-[0.18em]">Admin</span>
          </div>
          <nav className="flex items-center gap-0.5">
            {navItems.map(n => (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  tab === n.key
                    ? "bg-[#b59354] text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="text-[10px] font-semibold uppercase tracking-widest text-white/25 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-7">
        {tab === "overview"    && <OverviewTab />}
        {tab === "contacts"    && <ContactsTab />}
        {tab === "submissions" && <SubmissionsTab />}
        {tab === "support"     && <SupportTab />}
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

  const cards: { label: string; value: number; Icon: React.ElementType }[] = [
    { label: "Individual Accounts",  value: s.individual || 0,          Icon: User },
    { label: "Company Accounts",     value: s.company || 0,             Icon: Building2 },
    { label: "Company Formation",    value: s.company_formation || 0,   Icon: Scale },
    { label: "Accounting",           value: s.accounting || 0,          Icon: BookOpen },
    { label: "Tax Advisory",         value: s.tax_advisory || 0,        Icon: Receipt },
    { label: "Life Insurance",       value: s.life_insurance || 0,      Icon: Heart },
    { label: "Investment Advisory",  value: s.investment_advisory || 0, Icon: TrendingUp },
    { label: "Support Chats Open",   value: s.support_open || 0,        Icon: MessageSquare },
  ];

  const total = cards.slice(0, 7).reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex items-end justify-between border-b border-[#252623]/8 pb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b59354] mb-1">Dashboard</p>
          <h2 className="text-xl font-bold text-[#252623]">Overview</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Total submissions</p>
          <p className="text-4xl font-bold text-[#252623] leading-none">{total}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex group hover:shadow-md transition-shadow"
          >
            <div className="w-[3px] bg-[#b59354] flex-shrink-0" />
            <div className="flex-1 flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-[11px] text-gray-400 leading-tight mb-1">{label}</p>
                <p className="text-2xl font-bold text-[#252623] leading-none">{value}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#f6f8f8] flex items-center justify-center group-hover:bg-[#b59354]/8 transition-colors flex-shrink-0">
                <Icon className="w-4 h-4 text-[#b59354]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Email routing */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
          <AtSign className="w-4 h-4 text-[#b59354]" />
          <h3 className="text-sm font-semibold text-[#252623]">Service Email Routing</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {Object.entries(SERVICE_EMAILS)
            .filter(([k]) => !["open_account"].includes(k))
            .map(([service, email]) => (
              <div key={service} className="flex items-center justify-between px-6 py-3 hover:bg-[#f6f8f8] transition-colors">
                <span className="text-sm text-[#252623] capitalize font-medium">{service.replace(/_/g, " ")}</span>
                <a href={`mailto:${email}`} className="text-sm text-[#b59354] font-mono hover:text-[#886844] hover:underline transition-colors">
                  {email}
                </a>
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
    fetch(`${API}/api/admin/submissions?${params}`, { headers: { "x-admin-token": getToken() } })
      .then(r => {
        if (r.status === 401) { localStorage.removeItem("admin_token"); window.location.href = "/admin"; return null; }
        return r.json();
      })
      .then(d => { if (d && d.success) setSubmissions(d.data); })
      .catch(err => console.error("Submissions fetch error:", err))
      .finally(() => setLoading(false));
  }, [service, search]);

  React.useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const loadReplies = (sub: Submission) => {
    const ref = sub.confirmationNumber || String(sub.id);
    fetch(`${API}/api/admin/replies/${encodeURIComponent(ref)}`, { headers: { "x-admin-token": getToken() } })
      .then(r => r.json())
      .then(d => { if (d.success) setReplies(d.data); })
      .catch(() => {});
  };

  const loadDocs = (sub: Submission) => {
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
    fetch(`${API}/api/admin/documents/${sub.rawId}`, { headers: { "x-admin-token": getToken() } })
      .then(r => r.json())
      .then(d => { const dbDocs = d.success ? d.data : []; setDocs([...dbDocs, ...payloadDocs] as never[]); })
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
      attachFiles.forEach(f => form.append("attachments", f));
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
        setReplyOpen(false); setReplyMsg(""); setReplySubject(""); setAttachFiles([]); setAttachDocs([]);
        loadReplies(selected);
      } else { showToast(`Error: ${data.error}`); }
    } catch { showToast("Failed to send reply."); }
    finally { setReplySending(false); }
  };

  const servicePill = (svc: string) => (
    <span className="text-[10px] font-semibold text-white/80 bg-[#252623] px-2 py-0.5 rounded-full tracking-wide capitalize">
      {svc.replace(/_/g, " ")}
    </span>
  );

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#252623] text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Left: List */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Search name, email, ref..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] bg-[#f6f8f8]"
          />
          <select
            value={service}
            onChange={e => setService(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] bg-white"
          >
            {SERVICES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? <LoadingSpinner /> : submissions.length === 0 ? <EmptyState text="No submissions found" /> : (
            submissions.map(sub => (
              <button
                key={sub.id}
                onClick={() => { setSelected(sub); setReplyOpen(false); setReplies([]); setDocs([]); setAttachFiles([]); setAttachDocs([]); loadReplies(sub); loadDocs(sub); }}
                className={`w-full text-left bg-white rounded-xl border transition-all overflow-hidden flex ${
                  selected?.id === sub.id ? "border-[#b59354]/40 shadow-md" : "border-gray-100 hover:border-gray-200 shadow-sm"
                }`}
              >
                {selected?.id === sub.id && <div className="w-[3px] bg-[#b59354] flex-shrink-0" />}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    {servicePill(sub.service)}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[sub.status] || "bg-gray-100 text-gray-500"}`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="font-semibold text-[#252623] text-sm truncate">{sub.clientName}</p>
                  <p className="text-xs text-gray-400 truncate">{sub.clientEmail || "No email"}</p>
                  <p className="text-[11px] text-gray-300 mt-1">{fmt(sub.createdAt)}</p>
                </div>
              </button>
            ))
          )}
        </div>
        <p className="text-[11px] text-gray-400 text-center">{submissions.length} results</p>
      </div>

      {/* Right: Detail */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {selected ? (
          <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 overflow-y-auto flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {servicePill(selected.service)}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[selected.status] || "bg-gray-100 text-gray-500"}`}>
                      {selected.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#252623]">{selected.clientName}</h2>
                  {selected.clientEmail && (
                    <a href={`mailto:${selected.clientEmail}`} className="text-sm text-[#b59354] hover:underline">
                      {selected.clientEmail}
                    </a>
                  )}
                  {selected.confirmationNumber && (
                    <p className="text-xs font-mono text-gray-400 mt-1">Ref: {selected.confirmationNumber}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">Submitted: {fmt(selected.createdAt)}</p>
                </div>
                {selected.clientEmail && (
                  <button
                    onClick={() => setReplyOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply via Email
                  </button>
                )}
              </div>

              {/* Service email note */}
              <div className="mb-5 px-4 py-3 bg-[#b59354]/5 border border-[#b59354]/15 rounded-xl text-xs text-[#886844]">
                Replies from:{" "}
                <strong className="font-mono">{SERVICE_EMAILS[selected.service] || "support@opulanz.com"}</strong>
              </div>

              {/* Payload details */}
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-3">Submission Data</p>
              <div className="bg-[#f6f8f8] rounded-xl p-4 mb-6 border border-gray-100">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(selected.payload || {}).map(([key, value]) => {
                      if (value === null || value === undefined || value === "") return null;
                      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
                      const display = typeof value === "object" ? JSON.stringify(value) : String(value);
                      return (
                        <tr key={key} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 pr-4 text-gray-400 font-medium w-48 align-top text-xs">{label}</td>
                          <td className="py-2 text-[#252623] break-all text-sm">{display}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Attached Documents */}
              {docs.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-3">
                    Attached Files ({docs.length})
                  </p>
                  <div className="space-y-2">
                    {(docs as Array<{id:number;file_name:string;file_url:string;mime_type:string|null;type:string;size?:number;file_size?:number;fromPayload?:boolean}>).map(doc => {
                      const isPdf = doc.mime_type === "application/pdf" || doc.file_name?.endsWith(".pdf");
                      const isImg = doc.mime_type?.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp)$/i.test(doc.file_name || "");
                      const hasUrl = !!doc.file_url;
                      const rawSize = doc.size || doc.file_size;
                      const sizeStr = rawSize ? (rawSize > 1024*1024 ? `${(rawSize/1024/1024).toFixed(1)} MB` : `${Math.round(rawSize/1024)} KB`) : null;
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-[#f6f8f8] border border-gray-100 rounded-xl">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                              {isPdf ? <FileText className="w-4 h-4 text-[#b59354]" /> : isImg ? <Eye className="w-4 h-4 text-[#b59354]" /> : <Paperclip className="w-4 h-4 text-[#b59354]" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#252623] truncate">{doc.file_name}</p>
                              <p className="text-xs text-gray-400 capitalize">
                                {doc.type?.replace(/_/g, " ")}
                                {sizeStr ? ` · ${sizeStr}` : ""}
                                {doc.fromPayload && !hasUrl ? " · stored in Azure" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                            {hasUrl ? (
                              <>
                                <a href={doc.file_url} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 text-[#252623] rounded-lg hover:bg-gray-50 transition-colors">
                                  <Eye className="w-3 h-3" /> View
                                </a>
                                <a href={doc.file_url} download={doc.file_name}
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                                  <Download className="w-3 h-3" /> Save
                                </a>
                              </>
                            ) : (
                              <span className="text-xs px-3 py-1.5 bg-[#b59354]/8 border border-[#b59354]/20 text-[#886844] rounded-lg">Uploaded</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reply History */}
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-3">Reply History</p>
              {replies.length === 0 ? (
                <div className="bg-[#f6f8f8] rounded-xl p-4 text-center text-sm text-gray-400 border border-gray-100">
                  No replies sent yet
                </div>
              ) : (
                <div className="space-y-3">
                  {replies.map(r => (
                    <div key={r.id} className="bg-[#252623]/[0.02] border border-[#b59354]/15 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-[#b59354] rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-[#252623]">You replied</span>
                        </div>
                        <span className="text-[11px] text-gray-400">{fmt(r.sent_at)}</span>
                      </div>
                      {r.subject && <p className="text-xs font-medium text-gray-500 mb-1">Subject: {r.subject}</p>}
                      <p className="text-sm text-[#252623] whitespace-pre-wrap leading-relaxed">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Panel */}
            {replyOpen && (
              <div className="bg-white rounded-xl border-t-2 border-t-[#b59354] border-x border-b border-gray-100 shadow-md p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252623] text-sm">
                    Reply to {selected.clientName}
                    <span className="ml-2 text-xs font-mono text-gray-400">
                      (from {SERVICE_EMAILS[selected.service] || "support@opulanz.com"})
                    </span>
                  </h3>
                  <button onClick={() => setReplyOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  value={replySubject}
                  onChange={e => setReplySubject(e.target.value)}
                  placeholder="Subject (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] mb-2 bg-[#f6f8f8]"
                />
                <textarea
                  value={replyMsg}
                  onChange={e => setReplyMsg(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] resize-none mb-3 bg-[#f6f8f8]"
                />

                {docs.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Attach submission files:</p>
                    <div className="flex flex-wrap gap-2">
                      {docs.map(doc => (
                        <label key={doc.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                          attachDocs.includes(doc.id) ? "border-[#b59354] bg-[#b59354]/8 text-[#886844]" : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={attachDocs.includes(doc.id)}
                            onChange={e => setAttachDocs(prev => e.target.checked ? [...prev, doc.id] : prev.filter(x => x !== doc.id))}
                          />
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{doc.file_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 rounded-lg text-xs hover:border-[#b59354] hover:text-[#b59354] transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    Attach new file (PDF, PNG, DOC…)
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={e => { const files = Array.from(e.target.files || []); setAttachFiles(prev => [...prev, ...files]); e.target.value = ""; }}
                  />
                  {attachFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {attachFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 bg-[#f6f8f8] border border-gray-200 rounded-lg text-xs text-gray-600">
                          <Paperclip className="w-3 h-3" />
                          <span>{f.name}</span>
                          <button onClick={() => setAttachFiles(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setReplyOpen(false); setAttachFiles([]); setAttachDocs([]); }}
                    className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendReply}
                    disabled={replySending || !replyMsg.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {replySending ? "Sending…" : `Send${attachFiles.length + attachDocs.length > 0 ? ` + ${attachFiles.length + attachDocs.length} file(s)` : ""}`}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyDetailState icon="submissions" />
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
      const res = await fetch(`${API}/api/support-chats/${chat.id}`, { headers: { "x-admin-token": getToken() } });
      const data = await res.json();
      if (data.success) setSelected(data.data);
    } catch (err) { console.error("Load chat error:", err); }
    finally { setChatLoading(false); }
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

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
      if (data.success) { showToast("Reply sent and emailed to visitor!"); setReplyMsg(""); loadChat(selected); loadChats(); }
      else { showToast(`Error: ${data.error}`); }
    } catch { showToast("Failed to send reply."); }
    finally { setReplySending(false); }
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

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#252623] text-white px-5 py-3 rounded-xl shadow-lg text-sm">{toast}</div>
      )}

      {/* Left: Chat List */}
      <div className="w-[340px] flex-shrink-0 flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex gap-1">
            {(["all","waiting","active","closed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  filter === f ? "bg-[#b59354] text-white" : "text-gray-400 hover:bg-[#f6f8f8]"
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
                className={`w-full text-left bg-white rounded-xl border transition-all overflow-hidden flex ${
                  selected?.id === chat.id ? "border-[#b59354]/40 shadow-md" : "border-gray-100 hover:border-gray-200 shadow-sm"
                }`}
              >
                {selected?.id === chat.id && <div className="w-[3px] bg-[#b59354] flex-shrink-0" />}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-[#252623] text-sm truncate">{chat.visitor_name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[chat.status] || "bg-gray-100 text-gray-400"}`}>
                      {chat.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{chat.visitor_email}</p>
                  {chat.last_message && <p className="text-xs text-gray-300 truncate mt-1">{chat.last_message}</p>}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-gray-300">{fmt(chat.last_message_at)}</p>
                    <span className="text-[11px] text-gray-300">{chat.message_count} msgs</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        <p className="text-[11px] text-gray-400 text-center">{filtered.length} chats</p>
      </div>

      {/* Right: Chat Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
              <div>
                <p className="font-semibold text-[#252623]">{selected.visitor_name}</p>
                <a href={`mailto:${selected.visitor_email}`} className="text-xs text-[#b59354] hover:underline">
                  {selected.visitor_email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-3 py-1 rounded-full font-semibold ${STATUS_COLORS[selected.status] || "bg-gray-100 text-gray-400"}`}>
                  {selected.status}
                </span>
                {selected.status !== "closed" && (
                  <button
                    onClick={() => closeChat(selected.id)}
                    className="text-xs px-3 py-1 border border-gray-200 text-gray-400 rounded-full hover:border-red-200 hover:text-red-400 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#f6f8f8]">
              {chatLoading ? <LoadingSpinner /> : !selected.messages?.length ? <EmptyState text="No messages yet" /> : (
                selected.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.sender_type === "admin"
                        ? "bg-gradient-to-br from-[#b59354] to-[#886844] text-white rounded-tr-sm"
                        : "bg-white text-[#252623] shadow-sm border border-gray-100 rounded-tl-sm"
                    }`}>
                      <p className={`text-[10px] font-semibold mb-1 ${msg.sender_type === "admin" ? "text-white/60" : "text-gray-400"}`}>
                        {msg.sender_name}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1.5 ${msg.sender_type === "admin" ? "text-white/40" : "text-gray-300"}`}>
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
              <div className="px-6 py-4 border-t border-gray-50 bg-white">
                <p className="text-[10px] text-gray-400 mb-2">Reply will be saved here and emailed to {selected.visitor_email}</p>
                <div className="flex gap-3">
                  <textarea
                    value={replyMsg}
                    onChange={e => setReplyMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(); }}
                    placeholder="Type your reply… (Ctrl+Enter to send)"
                    rows={3}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] resize-none bg-[#f6f8f8]"
                  />
                  <button
                    onClick={sendReply}
                    disabled={replySending || !replyMsg.trim()}
                    className="self-end px-5 py-3 bg-gradient-to-r from-[#b59354] to-[#886844] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                  >
                    {replySending ? "…" : "Send"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-3 bg-[#f6f8f8] border-t border-gray-50 text-center text-xs text-gray-400">
                This chat is closed
              </div>
            )}
          </div>
        ) : (
          <EmptyDetailState icon="chats" />
        )}
      </div>
    </div>
  );
}

// ─── Contacts Tab ─────────────────────────────────────────────────────────────
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
        setReplyOpen(false); setReplyMsg(""); setReplySubject("");
      } else { showToast(`Error: ${data.error}`); }
    } catch { showToast("Failed to send reply."); }
    finally { setReplySending(false); }
  };

  const filtered = filter === "all" ? contacts : contacts.filter(c => c.status === filter);

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#252623] text-white px-5 py-3 rounded-xl shadow-lg text-sm">{toast}</div>
      )}

      {/* Left: List */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Search name, email, subject…"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] bg-[#f6f8f8]"
          />
          <div className="flex gap-1">
            {(["all","open","replied","closed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  filter === f ? "bg-[#b59354] text-white" : "text-gray-400 hover:bg-[#f6f8f8]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState text="No support messages found" /> : (
            filtered.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); setReplyOpen(false); }}
                className={`w-full text-left bg-white rounded-xl border transition-all overflow-hidden flex ${
                  selected?.id === c.id ? "border-[#b59354]/40 shadow-md" : "border-gray-100 hover:border-gray-200 shadow-sm"
                }`}
              >
                {selected?.id === c.id && <div className="w-[3px] bg-[#b59354] flex-shrink-0" />}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-[#252623] text-sm truncate">{c.first_name} {c.last_name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-400"}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  <p className="text-xs font-medium text-[#252623]/70 truncate mt-1">{c.subject}</p>
                  <p className="text-[11px] text-gray-300 mt-1">{fmt(c.created_at)}</p>
                </div>
              </button>
            ))
          )}
        </div>
        <p className="text-[11px] text-gray-400 text-center">{filtered.length} messages</p>
      </div>

      {/* Right: Detail */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {selected ? (
          <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex-1 overflow-y-auto">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[selected.status] || "bg-gray-100 text-gray-400"}`}>
                    {selected.status}
                  </span>
                  <h2 className="text-xl font-bold text-[#252623] mt-1.5">
                    {selected.first_name} {selected.last_name}
                  </h2>
                  <a href={`mailto:${selected.email}`} className="text-sm text-[#b59354] hover:underline">
                    {selected.email}
                  </a>
                  {selected.phone && <p className="text-xs text-gray-400 mt-0.5">{selected.phone}</p>}
                  <p className="text-[11px] text-gray-400 mt-1">Received: {fmt(selected.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  {selected.status !== "replied" && (
                    <button
                      onClick={() => setReplyOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Reply
                    </button>
                  )}
                  {selected.status === "open" && (
                    <button onClick={() => markStatus(selected.id, "closed")}
                      className="px-3 py-2 text-xs border border-gray-200 text-gray-400 rounded-lg hover:border-red-200 hover:text-red-400 transition-colors">
                      Close
                    </button>
                  )}
                  {selected.status === "closed" && (
                    <button onClick={() => markStatus(selected.id, "open")}
                      className="px-3 py-2 text-xs border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-50 transition-colors">
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4 px-4 py-3 bg-[#f6f8f8] rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Subject</p>
                <p className="font-semibold text-[#252623]">{selected.subject}</p>
              </div>

              <div className="px-4 py-4 bg-[#f6f8f8] border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Message</p>
                <p className="text-[#252623] text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>

            {replyOpen && (
              <div className="bg-white rounded-xl border-t-2 border-t-[#b59354] border-x border-b border-gray-100 shadow-md p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#252623] text-sm">
                    Reply to {selected.first_name}
                    <span className="ml-2 text-xs font-mono text-gray-400">(from support@opulanz.com)</span>
                  </h3>
                  <button onClick={() => setReplyOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  value={replySubject}
                  onChange={e => setReplySubject(e.target.value)}
                  placeholder={`Re: ${selected.subject}`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] mb-2 bg-[#f6f8f8]"
                />
                <textarea
                  value={replyMsg}
                  onChange={e => setReplyMsg(e.target.value)}
                  placeholder="Type your reply…"
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] resize-none mb-3 bg-[#f6f8f8]"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setReplyOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">Cancel</button>
                  <button
                    onClick={sendReply}
                    disabled={replySending || !replyMsg.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-[#b59354] to-[#886844] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {replySending ? "Sending…" : "Send Reply"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyDetailState icon="messages" />
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-7 h-7 border-[2.5px] border-[#b59354] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200 mb-3 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}

function EmptyDetailState({ icon }: { icon: "submissions" | "chats" | "messages" }) {
  const cfg = {
    submissions: { Icon: FileText, text: "Select a submission to view details" },
    chats:       { Icon: MessageSquare, text: "Select a chat to view messages" },
    messages:    { Icon: Mail, text: "Select a message to view and reply" },
  };
  const { Icon, text } = cfg[icon];
  return (
    <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#f6f8f8] border border-gray-100 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-[#b59354]/50" />
        </div>
        <p className="text-sm text-gray-400 font-medium">{text}</p>
      </div>
    </div>
  );
}
