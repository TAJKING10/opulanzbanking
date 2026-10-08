"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  ChevronRight,
  Phone,
  Mail,
  Loader2,
  Users,
  RotateCcw,
  X,
  CheckCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const FAQS_EN = [
  {
    q: "What services does Opulanz offer?",
    a: "Opulanz is an all-in-one platform with 7 services:\n1. Banking accounts (individual & company)\n2. Company formation in Luxembourg\n3. Tax advisory (5 services, from €100 to €299)\n4. Life insurance brokerage (free consultation)\n5. Investment advisory (min €100,000)\n6. Accounting & invoicing\n7. SPV real estate investment (qualified investors)",
  },
  {
    q: "How do I book a tax advisory consultation?",
    a: "Easy — 4 steps:\n1. Go to /tax-advisory and pick your service\n2. Enter your contact details\n3. Choose a time slot via Calendly\n4. Pay online (PayPal) → instant confirmation by email with video link",
  },
  {
    q: "How do I open a company account?",
    a: "Here are the steps:\n1. Not yet incorporated? Start with our Company Formation service (/company-formation).\n2. Go to /open-account → 'Company Account'.\n3. Upload: certificate of incorporation, UBO declaration, directors' IDs.\n4. Submit → approval within 3–5 business days.\n5. Receive your multi-currency IBAN (EUR, USD, GBP, CHF).",
  },
  {
    q: "What are your fees and approval timelines?",
    a: "Individual account: €10/month, approved in 24–48h.\nCompany account: €25/month, approved in 3–5 days.\nCompany formation: registered office from €600/year, completed in 2–3 weeks.",
  },
];

const FAQS_FR = [
  {
    q: "Je suis une société au Luxembourg — comment ouvrir un compte ?",
    a: "Voici les étapes :\n1. Société non immatriculée ? Commencez par notre service Création d'entreprise (/company-formation).\n2. Allez sur /open-account → « Compte Entreprise ».\n3. Téléchargez : acte d'immatriculation, déclaration UBO, pièces d'identité des dirigeants.\n4. Soumettez → approbation sous 3–5 jours ouvrés.\n5. Recevez votre IBAN multi-devises (EUR, USD, GBP, CHF).",
  },
  {
    q: "Quels services fiscaux proposez-vous et à quel prix ?",
    a: "5 services de conseil fiscal disponibles :\n1. Déclaration fiscale → €299\n2. Fiscalité internationale → €250\n3. Fiscalité entreprise → €150\n4. Conformité fiscale → €250\n5. Conseil fiscal personnel → €100\nConsultation de 60 min en visio, paiement en ligne. Réservez sur /tax-advisory.",
  },
  {
    q: "Comment créer une entreprise au Luxembourg ?",
    a: "Processus complet en 8 étapes :\n1. Choisissez la forme (SARL, SARL-S, SA, SCSp)\n2. Informations de la société\n3. Associés, dirigeants, UBO\n4. Capital social\n5. Activité (code NACE)\n6. Notaire & domiciliation\n7. Documents\n8. Soumission → finalisé en 2–3 semaines !",
  },
  {
    q: "Quels sont vos tarifs et délais d'approbation ?",
    a: "Compte individuel : €10/mois, approuvé en 24–48h.\nCompte entreprise : €25/mois, approuvé en 3–5 jours.\nCréation d'entreprise : domiciliation à partir de €600/an, finalisée en 2–3 semaines.",
  },
];

type Message = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

type HumanMessage = {
  id: number;
  sender_type: "visitor" | "admin";
  sender_name: string;
  content: string;
  created_at: string;
};

type View = "welcome" | "chat" | "human";
type HumanStep = "form" | "chatting";

function MessageContent({ text, streaming }: { text: string; streaming?: boolean }) {
  if (!text && streaming) {
    return (
      <span className="inline-block h-4 w-1.5 animate-pulse bg-gray-400 align-middle" />
    );
  }

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)/);
    const bulletMatch = line.match(/^[-•*]\s+(.+)/);

    if (numberedMatch) {
      elements.push(
        <div key={i} className="mt-1.5 flex items-start gap-2.5 first:mt-0">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354] text-[10px] font-bold text-white">
            {numberedMatch[1]}
          </span>
          <span className="leading-snug">{numberedMatch[2]}</span>
        </div>
      );
    } else if (bulletMatch) {
      elements.push(
        <div key={i} className="mt-1.5 flex items-start gap-2.5 first:mt-0">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#b59354]" />
          <span className="leading-snug">{bulletMatch[1]}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={i} className="mt-1.5 leading-snug first:mt-0">{line}</p>
      );
    }
    i++;
  }

  return (
    <div className="text-sm">
      {elements}
      {streaming && (
        <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-gray-400 align-middle" />
      )}
    </div>
  );
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function LiveChat() {
  const pathname = usePathname();
  const locale = useLocale();
  const isFr = locale === "fr";
  const FAQS = isFr ? FAQS_FR : FAQS_EN;
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<View>("welcome");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [suggestHuman, setSuggestHuman] = React.useState(false);
  const [unread, setUnread] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Human live chat states
  const [humanStep, setHumanStep] = React.useState<HumanStep>("form");
  const [chatId, setChatId] = React.useState<number | null>(null);
  const [humanMessages, setHumanMessages] = React.useState<HumanMessage[]>([]);
  const [visitorName, setVisitorName] = React.useState("");
  const [visitorEmail, setVisitorEmail] = React.useState("");
  const [humanInput, setHumanInput] = React.useState("");
  const [humanSending, setHumanSending] = React.useState(false);
  const [humanFormLoading, setHumanFormLoading] = React.useState(false);
  const humanMessagesEndRef = React.useRef<HTMLDivElement>(null);
  const humanInputRef = React.useRef<HTMLInputElement>(null);



  // External open trigger
  React.useEffect(() => {
    function handleExternalOpen() { setOpen(true); }
    window.addEventListener("opulanz:open-chat", handleExternalOpen);
    return () => window.removeEventListener("opulanz:open-chat", handleExternalOpen);
  }, []);

  // Scroll AI chat
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll human chat
  React.useEffect(() => {
    humanMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [humanMessages]);

  // Focus input when opening chat view
  React.useEffect(() => {
    if (open && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (open && view === "human" && humanStep === "chatting") {
      setTimeout(() => humanInputRef.current?.focus(), 50);
    }
    if (open) setUnread(false);
  }, [open, view, humanStep]);

  // Poll for new human messages every 3s
  React.useEffect(() => {
    if (view !== "human" || humanStep !== "chatting" || !chatId) return;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/support-chats/${chatId}`);
        const data = await res.json();
        if (data.success && data.data.messages) {
          setHumanMessages(data.data.messages);
          // Show unread dot if panel is closed and admin replied
          if (!open) {
            const lastMsg = data.data.messages[data.data.messages.length - 1];
            if (lastMsg?.sender_type === "admin") setUnread(true);
          }
        }
      } catch {
        // silently ignore polling errors
      }
    };

    poll(); // immediate first poll
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [view, humanStep, chatId, open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    setSuggestHuman(false);

    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          locale,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { text } = JSON.parse(data);
            fullText += text;
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { role: "assistant", content: fullText, streaming: true },
            ]);
          } catch { /* ignore */ }
        }
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: fullText, streaming: false },
      ]);

      if (fullText.toLowerCase().includes("human agent")) setSuggestHuman(true);
      if (!open) setUnread(true);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: err.message || "I'm sorry, I couldn't process your request. Please try again or contact us at contact@opulanz.com.",
          streaming: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function startHumanChat(e: React.FormEvent) {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim()) return;
    setHumanFormLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/support-chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor_name: visitorName.trim(), visitor_email: visitorEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setChatId(data.data.id);
        setHumanMessages([]);
        setHumanStep("chatting");
      }
    } catch {
      // fallback: still show chat UI even if backend is down
      setChatId(-1);
      setHumanStep("chatting");
    } finally {
      setHumanFormLoading(false);
    }
  }

  async function sendHumanMessage() {
    if (!humanInput.trim() || humanSending || !chatId || chatId === -1) return;
    const text = humanInput.trim();
    setHumanInput("");
    setHumanSending(true);

    // Optimistic update
    const optimistic: HumanMessage = {
      id: Date.now(),
      sender_type: "visitor",
      sender_name: visitorName,
      content: text,
      created_at: new Date().toISOString(),
    };
    setHumanMessages((prev) => [...prev, optimistic]);

    try {
      await fetch(`${API_BASE}/api/support-chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_type: "visitor", sender_name: visitorName, content: text }),
      });
    } catch { /* ignore */ }
    setHumanSending(false);
  }

  function handleFAQ(faq: { q: string; a: string }) {
    setView("chat");
    setMessages([
      { role: "user", content: faq.q },
      { role: "assistant", content: faq.a },
    ]);
  }

  function reset() {
    setView("welcome");
    setMessages([]);
    setInput("");
    setLoading(false);
    setSuggestHuman(false);
    setHumanStep("form");
    setChatId(null);
    setHumanMessages([]);
    setVisitorName("");
    setVisitorEmail("");
    setHumanInput("");
  }

  const adminReplied = humanMessages.some((m) => m.sender_type === "admin");

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            bottom: "80px",
            right: "16px",
            left: "16px",
            width: "auto",
            maxWidth: "460px",
            height: "min(620px, calc(100dvh - 100px))",
            marginLeft: "auto",
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between bg-[#252623] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b59354]">
                {view === "human" && humanStep === "chatting" ? (
                  <Users className="h-5 w-5 text-white" />
                ) : (
                  <Bot className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold">Opulanz Support</p>
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${view === "human" && humanStep === "chatting" && adminReplied ? "bg-green-400" : view === "human" && humanStep === "chatting" ? "bg-amber-400 animate-pulse" : "bg-green-400"}`} />
                  <p className="text-xs text-gray-400">
                    {view === "human" && humanStep === "chatting"
                      ? adminReplied
                        ? (isFr ? "Agent connecté" : "Agent connected")
                        : (isFr ? "En attente d'un agent..." : "Waiting for agent...")
                      : (isFr ? "Assistant IA · En ligne" : "AI Assistant · Online")}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 transition-colors hover:bg-white/10"
              aria-label="Minimize chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* WELCOME VIEW */}
          {view === "welcome" && (
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-800">
                  {isFr
                    ? "Bonjour ! Je suis l'assistant IA d'Opulanz. Comment puis-je vous aider aujourd'hui ?"
                    : "Hello! I'm the Opulanz AI assistant. How can I help you today?"}
                </div>
              </div>

              <p className="pl-10 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {isFr ? "Questions fréquentes" : "Frequently Asked Questions"}
              </p>

              <div className="space-y-2">
                {FAQS.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => handleFAQ(faq)}
                    className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:border-[#b59354] hover:bg-amber-50"
                  >
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#b59354]" />
                    <span>{faq.q}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setView("chat")}
                  className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#b59354] px-3 py-3 text-left text-sm font-medium text-[#b59354] transition-colors hover:bg-amber-50"
                >
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  {isFr ? "Poser votre propre question..." : "Ask your own question..."}
                </button>
                <button
                  onClick={() => setView("human")}
                  className="flex w-full items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-3 text-left text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  <Users className="h-4 w-4 flex-shrink-0" />
                  {isFr ? "Contacter un agent" : "Chat with a human agent"}
                </button>
              </div>
            </div>
          )}

          {/* AI CHAT VIEW */}
          {view === "chat" && (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.length === 0 && (
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-800">
                      {isFr ? "Que souhaitez-vous savoir sur Opulanz ?" : "What would you like to know about Opulanz?"}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "rounded-tr-sm bg-[#252623] text-white"
                          : "rounded-tl-sm bg-gray-100 text-gray-800"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p className="text-sm leading-snug">{msg.content}</p>
                      ) : (
                        <MessageContent text={msg.content} streaming={msg.streaming} />
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {suggestHuman && (
                <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <Users className="h-4 w-4 flex-shrink-0 text-[#b59354]" />
                  <p className="flex-1 text-xs text-gray-600">{isFr ? "Souhaitez-vous parler à un agent ?" : "Would you like to speak with a human agent?"}</p>
                  <button onClick={() => setView("human")} className="text-xs font-semibold text-[#b59354] hover:underline">
                    {isFr ? "Connecter" : "Connect now"}
                  </button>
                </div>
              )}

              {!suggestHuman && (
                <div className="px-4 pb-1">
                  <button
                    onClick={() => setView("human")}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-gray-400 transition-colors hover:bg-amber-50 hover:text-[#b59354]"
                  >
                    <Users className="h-3.5 w-3.5" />
                    {isFr ? "Parler à un agent" : "Talk to a human agent"}
                  </button>
                </div>
              )}

              <div className="flex-shrink-0 px-4 pb-4">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 transition-colors focus-within:border-[#b59354]">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
                    }}
                    placeholder={isFr ? "Écrivez votre message..." : "Type your message..."}
                    className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#b59354] transition-colors hover:bg-[#886844] disabled:opacity-40"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Send className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* HUMAN LIVE CHAT VIEW */}
          {view === "human" && (
            <>
              {/* Back button */}
              <div className="flex-shrink-0 border-b border-gray-100 px-4 py-2">
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {isFr ? "Retour à l'assistant IA" : "Back to AI assistant"}
                </button>
              </div>

              {/* FORM STEP */}
              {humanStep === "form" && (
                <div className="flex flex-1 flex-col items-center justify-center p-6">
                  <div className="w-full max-w-sm space-y-5">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                        <Users className="h-7 w-7 text-[#b59354]" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">{isFr ? "Chattez avec notre équipe" : "Chat with our team"}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {isFr ? "Disponible Lun–Ven, 9h00–18h00 CET" : "Available Mon–Fri, 9:00–18:00 CET"}
                      </p>
                    </div>

                    <form onSubmit={startHumanChat} className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">{isFr ? "Votre nom" : "Your name"}</label>
                        <input
                          type="text"
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          placeholder="Jean Dupont"
                          required
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#b59354] placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">{isFr ? "Votre email" : "Your email"}</label>
                        <input
                          type="email"
                          value={visitorEmail}
                          onChange={(e) => setVisitorEmail(e.target.value)}
                          placeholder="jean@example.com"
                          required
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#b59354] placeholder:text-gray-400"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={humanFormLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#252623] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3a3936] disabled:opacity-60"
                      >
                        {humanFormLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4" />
                            {isFr ? "Démarrer le chat" : "Start Live Chat"}
                          </>
                        )}
                      </button>
                    </form>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-xs text-gray-400">{isFr ? "ou contactez-nous directement" : "or reach us directly"}</span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    <div className="space-y-2">
                      <a
                        href="tel:+35228797626"
                        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 text-left transition-colors hover:border-[#b59354] hover:bg-amber-50"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]/10">
                          <Phone className="h-3.5 w-3.5 text-[#b59354]" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-800">Luxembourg</p>
                          <p className="text-xs text-gray-500">+352 28 79 76 26</p>
                        </div>
                      </a>
                      <a
                        href="mailto:contact@opulanz.com"
                        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 text-left transition-colors hover:border-[#b59354] hover:bg-amber-50"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]/10">
                          <Mail className="h-3.5 w-3.5 text-[#b59354]" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-800">{isFr ? "Envoyez-nous un email" : "Email us"}</p>
                          <p className="text-xs text-gray-500">contact@opulanz.com</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE CHAT STEP */}
              {humanStep === "chatting" && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* System message */}
                    <div className="flex justify-center">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                        {isFr ? "Chat démarré — un agent vous répondra bientôt" : "Chat started — an agent will reply shortly"}
                      </span>
                    </div>

                    {humanMessages.length === 0 && (
                      <div className="flex justify-center py-4">
                        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-[#b59354]" />
                          <p className="text-sm text-gray-600">{isFr ? "En attente d'un agent..." : "Waiting for an agent to join..."}</p>
                        </div>
                      </div>
                    )}

                    {humanMessages.map((msg, i) => (
                      <div
                        key={msg.id || i}
                        className={`flex gap-2 ${msg.sender_type === "visitor" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.sender_type === "admin" && (
                          <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                            <Users className="h-4 w-4 text-indigo-600" />
                          </div>
                        )}
                        <div className="max-w-[78%]">
                          {msg.sender_type === "admin" && (
                            <p className="mb-1 text-xs font-medium text-gray-500">{msg.sender_name}</p>
                          )}
                          <div
                            className={`rounded-2xl px-3 py-2.5 text-sm ${
                              msg.sender_type === "visitor"
                                ? "rounded-tr-sm bg-[#252623] text-white"
                                : "rounded-tl-sm bg-indigo-50 text-gray-800"
                            }`}
                          >
                            {msg.content}
                          </div>
                          <p className={`mt-1 text-[10px] text-gray-400 ${msg.sender_type === "visitor" ? "text-right" : ""}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                        {msg.sender_type === "visitor" && (
                          <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}

                    {adminReplied && (
                      <div className="flex justify-center">
                        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {isFr ? "Agent connecté" : "Agent connected"}
                        </span>
                      </div>
                    )}

                    <div ref={humanMessagesEndRef} />
                  </div>

                  <div className="flex-shrink-0 px-4 pb-4">
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 transition-colors focus-within:border-[#b59354]">
                      <input
                        ref={humanInputRef}
                        value={humanInput}
                        onChange={(e) => setHumanInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendHumanMessage(); }
                        }}
                        placeholder={isFr ? "Écrivez votre message..." : "Type your message..."}
                        className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                        disabled={humanSending}
                      />
                      <button
                        onClick={sendHumanMessage}
                        disabled={!humanInput.trim() || humanSending}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#b59354] transition-colors hover:bg-[#886844] disabled:opacity-40"
                      >
                        {humanSending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <Send className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#252623] shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Minimize chat" : "Open support chat"}
      >
        <MessageCircle className="h-6 w-6 text-[#b59354]" />
        {unread && !open && (
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-[#252623] bg-red-500" />
        )}
      </button>
    </>
  );
}
