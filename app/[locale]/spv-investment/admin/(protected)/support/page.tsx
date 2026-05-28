"use client";

import * as React from "react";
import {
  MessageSquare,
  Send,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  User,
  Circle,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/investment-api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Chat = {
  id: number;
  visitor_name: string;
  visitor_email: string;
  status: "waiting" | "active" | "closed";
  created_at: string;
  last_message_at: string;
  last_message?: string;
  message_count: number;
};

type Message = {
  id: number;
  chat_id: number;
  sender_type: "visitor" | "admin";
  sender_name: string;
  content: string;
  created_at: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

const STATUS_COLORS: Record<Chat["status"], string> = {
  waiting: "bg-amber-100 text-amber-700 ring-1 ring-amber-300",
  active: "bg-green-100 text-green-700 ring-1 ring-green-300",
  closed: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
};

const STATUS_DOTS: Record<Chat["status"], string> = {
  waiting: "bg-amber-400 animate-pulse",
  active: "bg-green-400",
  closed: "bg-gray-400",
};

export default function AdminSupportPage() {
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [replyText, setReplyText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [loadingChats, setLoadingChats] = React.useState(true);
  const [closingId, setClosingId] = React.useState<number | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const replyInputRef = React.useRef<HTMLTextAreaElement>(null);

  const adminName = React.useMemo(() => getCurrentAdmin()?.name || "Support Agent", []);

  // Fetch all chats
  const fetchChats = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/support-chats`);
      const data = await res.json();
      if (data.success) setChats(data.data);
    } catch { /* ignore */ }
    setLoadingChats(false);
  }, []);

  // Fetch messages for selected chat
  const fetchMessages = React.useCallback(async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/support-chats/${id}`);
      const data = await res.json();
      if (data.success) setMessages(data.data.messages || []);
    } catch { /* ignore */ }
  }, []);

  // Poll chats list every 5s
  React.useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  // Poll selected chat messages every 3s
  React.useEffect(() => {
    if (!selectedId) return;
    fetchMessages(selectedId);
    const interval = setInterval(() => fetchMessages(selectedId), 3000);
    return () => clearInterval(interval);
  }, [selectedId, fetchMessages]);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus reply input when chat selected
  React.useEffect(() => {
    if (selectedId) setTimeout(() => replyInputRef.current?.focus(), 100);
  }, [selectedId]);

  async function sendReply() {
    if (!replyText.trim() || sending || !selectedId) return;
    const text = replyText.trim();
    setReplyText("");
    setSending(true);

    // Optimistic update
    const optimistic: Message = {
      id: Date.now(),
      chat_id: selectedId,
      sender_type: "admin",
      sender_name: adminName,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await fetch(`${API_BASE}/api/support-chats/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_type: "admin", sender_name: adminName, content: text }),
      });
      // Refresh chat list to update status
      fetchChats();
    } catch { /* ignore */ }
    setSending(false);
  }

  async function closeChat(id: number) {
    setClosingId(id);
    try {
      await fetch(`${API_BASE}/api/support-chats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      fetchChats();
      if (selectedId === id) setSelectedId(null);
    } catch { /* ignore */ }
    setClosingId(null);
  }

  async function reopenChat(id: number) {
    try {
      await fetch(`${API_BASE}/api/support-chats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      fetchChats();
    } catch { /* ignore */ }
  }

  const selectedChat = chats.find((c) => c.id === selectedId);
  const openChats = chats.filter((c) => c.status !== "closed");
  const closedChats = chats.filter((c) => c.status === "closed");

  return (
    <div className="flex bg-slate-100" style={{ height: "calc(100vh - 144px)" }}>
      {/* LEFT: Chat list */}
      <div className="flex w-80 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Live Support</h2>
            <p className="text-xs text-slate-500">
              {openChats.length} open · {chats.filter((c) => c.status === "waiting").length} waiting
            </p>
          </div>
          <button
            onClick={fetchChats}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <MessageSquare className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No chats yet</p>
              <p className="mt-1 text-xs text-slate-400">
                When visitors start a live chat, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Open chats first */}
              {openChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedId(chat.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                    selectedId === chat.id ? "bg-indigo-50 hover:bg-indigo-50" : ""
                  }`}
                >
                  <div className="relative mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${STATUS_DOTS[chat.status]}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{chat.visitor_name}</p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(chat.last_message_at)}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">{chat.visitor_email}</p>
                    {chat.last_message && (
                      <p className="mt-0.5 truncate text-xs text-slate-400">{chat.last_message}</p>
                    )}
                    <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[chat.status]}`}>
                      {chat.status === "waiting" ? "Waiting" : "Active"}
                    </span>
                  </div>
                </button>
              ))}

              {/* Closed chats section */}
              {closedChats.length > 0 && (
                <>
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Closed</p>
                  </div>
                  {closedChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedId(chat.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 opacity-60 ${
                        selectedId === chat.id ? "bg-indigo-50 opacity-100 hover:bg-indigo-50" : ""
                      }`}
                    >
                      <div className="relative mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-slate-700">{chat.visitor_name}</p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(chat.last_message_at)}</span>
                        </div>
                        <p className="truncate text-xs text-slate-400">{chat.visitor_email}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Conversation */}
      <div className="flex flex-1 flex-col">
        {!selectedId ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
              <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-700">Select a conversation</h3>
            <p className="mt-1 text-sm text-slate-500">
              Choose a chat from the left to view and reply.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                  <User className="h-5 w-5 text-slate-500" />
                  {selectedChat && (
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${STATUS_DOTS[selectedChat.status]}`} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{selectedChat?.visitor_name}</p>
                  <p className="text-xs text-slate-500">{selectedChat?.visitor_email}</p>
                </div>
                {selectedChat && (
                  <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[selectedChat.status]}`}>
                    <Circle className="h-2 w-2 fill-current" />
                    {selectedChat.status.charAt(0).toUpperCase() + selectedChat.status.slice(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedChat?.status !== "closed" ? (
                  <button
                    onClick={() => closeChat(selectedId)}
                    disabled={closingId === selectedId}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    {closingId === selectedId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Close Chat
                  </button>
                ) : (
                  <button
                    onClick={() => reopenChat(selectedId)}
                    className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-100"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Reopen
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* System message */}
              <div className="flex justify-center">
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-500">
                  Chat started {selectedChat ? timeAgo(selectedChat.created_at) : ""}
                </span>
              </div>

              {messages.length === 0 && (
                <div className="flex justify-center py-4">
                  <p className="text-sm text-slate-400">No messages yet. The visitor is waiting for your reply.</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex gap-3 ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender_type === "visitor" && (
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                  <div className="max-w-[70%]">
                    {msg.sender_type === "visitor" && (
                      <p className="mb-1 text-xs font-medium text-slate-500">{msg.sender_name}</p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender_type === "admin"
                          ? "rounded-tr-sm bg-indigo-600 text-white"
                          : "rounded-tl-sm bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className={`mt-1 text-[10px] text-slate-400 ${msg.sender_type === "admin" ? "text-right" : ""}`}>
                      {msg.sender_type === "admin" ? `You · ` : ""}{formatTime(msg.created_at)}
                    </p>
                  </div>
                  {msg.sender_type === "admin" && (
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            {selectedChat?.status !== "closed" ? (
              <div className="flex-shrink-0 border-t border-slate-200 bg-white p-4">
                <div className="flex items-end gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-colors focus-within:border-indigo-400">
                  <textarea
                    ref={replyInputRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                    }}
                    placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    className="flex-1 resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    disabled={sending}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!replyText.trim() || sending}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 transition-colors hover:bg-indigo-700 disabled:opacity-40"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Send className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Replying as <strong>{adminName}</strong>
                </p>
              </div>
            ) : (
              <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <p className="text-center text-sm text-slate-500">This chat is closed. Reopen it to reply.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
