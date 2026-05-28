"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Minus,
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
} from "lucide-react";

const FAQS = [
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
  {
    q: "What services does Opulanz offer?",
    a: "Opulanz is an all-in-one platform with 7 services:\n1. Banking accounts (individual & company)\n2. Company formation in Luxembourg\n3. Tax advisory (5 services, from €100 to €299)\n4. Life insurance brokerage (free consultation)\n5. Investment advisory (min €100,000)\n6. Accounting & invoicing\n7. SPV real estate investment (qualified investors)",
  },
  {
    q: "How do I book a tax advisory consultation?",
    a: "Easy — 4 steps:\n1. Go to /tax-advisory and pick your service\n2. Enter your contact details\n3. Choose a time slot via Calendly\n4. Pay online (PayPal) → instant confirmation by email with video link",
  },
];

type Message = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

type View = "welcome" | "chat" | "human";

// ── Renders AI message text with numbered steps and bullets on separate lines ──
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
    if (!line) {
      i++;
      continue;
    }

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
        <p key={i} className="mt-1.5 leading-snug first:mt-0">
          {line}
        </p>
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

export function LiveChat() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<View>("welcome");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [suggestHuman, setSuggestHuman] = React.useState(false);
  const [unread, setUnread] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-open on homepage after a short delay
  const isHomePage = /^\/[a-z]{2}\/?$/.test(pathname ?? "");
  React.useEffect(() => {
    if (!isHomePage) return;
    const timer = setTimeout(() => {
      setOpen(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isHomePage]);

  // Listen for external open trigger (e.g. "Start Chat" button on support page)
  React.useEffect(() => {
    function handleExternalOpen() {
      setOpen(true);
    }
    window.addEventListener("opulanz:open-chat", handleExternalOpen);
    return () => window.removeEventListener("opulanz:open-chat", handleExternalOpen);
  }, []);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opening chat view
  React.useEffect(() => {
    if (open && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (open) setUnread(false);
  }, [open, view]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    setSuggestHuman(false);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", streaming: true },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
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
          } catch {
            // ignore
          }
        }
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: fullText, streaming: false },
      ]);

      if (fullText.toLowerCase().includes("human agent")) {
        setSuggestHuman(true);
      }

      // Show unread dot on bubble if panel is minimized
      if (!open) setUnread(true);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            err.message ||
            "I'm sorry, I couldn't process your request. Please try again or contact us at contact@opulanz.com.",
          streaming: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleFAQ(faq: (typeof FAQS)[0]) {
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
  }

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            width: 460,
            maxWidth: "calc(100vw - 24px)",
            height: 620,
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between bg-[#252623] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b59354]">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Opulanz Support</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <p className="text-xs text-gray-400">
                    {view === "human" ? "Human agents" : "AI Assistant · Online"}
                  </p>
                </div>
              </div>
            </div>
            {/* Minimize button — collapses to bubble, preserves conversation */}
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 transition-colors hover:bg-white/10"
              aria-label="Minimize chat"
              title="Minimize"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── WELCOME VIEW ── */}
          {view === "welcome" && (
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-800">
                  Bonjour ! Je suis l'assistant IA d'Opulanz. Comment puis-je vous aider aujourd'hui ? <br className="hidden sm:block" />
                  <span className="text-gray-500 text-xs">Hello! I'm the Opulanz AI. How can I help you?</span>
                </div>
              </div>

              <p className="pl-12 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Questions fréquentes / FAQ
              </p>

              <div className="space-y-2 pl-2">
                {FAQS.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => handleFAQ(faq)}
                    className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-left text-sm text-gray-700 transition-colors hover:border-[#b59354] hover:bg-amber-50"
                  >
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#b59354]" />
                    <span>{faq.q}</span>
                  </button>
                ))}
              </div>

              <div className="pl-2">
                <button
                  onClick={() => setView("chat")}
                  className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#b59354] px-3 py-3 text-left text-sm font-medium text-[#b59354] transition-colors hover:bg-amber-50"
                >
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  Poser votre propre question... / Ask your own question...
                </button>
              </div>
            </div>
          )}

          {/* ── CHAT VIEW ── */}
          {view === "chat" && (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.length === 0 && (
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-800">
                      Que souhaitez-vous savoir sur Opulanz ? / What would you like to know about Opulanz?
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

              {/* Human escalation banner */}
              {suggestHuman && (
                <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <Users className="h-4 w-4 flex-shrink-0 text-[#b59354]" />
                  <p className="flex-1 text-xs text-gray-600">
                    Would you like to speak with a human agent?
                  </p>
                  <button
                    onClick={() => setView("human")}
                    className="text-xs font-semibold text-[#b59354] hover:underline"
                  >
                    Connect now
                  </button>
                </div>
              )}

              {/* Talk to human link */}
              {!suggestHuman && (
                <div className="px-4 pb-1">
                  <button
                    onClick={() => setView("human")}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-gray-400 transition-colors hover:bg-amber-50 hover:text-[#b59354]"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Talk to a human agent
                  </button>
                </div>
              )}

              {/* Input bar */}
              <div className="flex-shrink-0 px-4 pb-4">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 transition-colors focus-within:border-[#b59354]">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#b59354] transition-colors hover:bg-[#886844] disabled:opacity-40"
                    aria-label="Send message"
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

          {/* ── HUMAN TRANSFER VIEW ── */}
          {view === "human" && (
            <div className="flex flex-1 flex-col items-center justify-center space-y-5 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                <Users className="h-8 w-8 text-[#b59354]" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-gray-900">
                  Connect with our team
                </h3>
                <p className="text-sm text-gray-500">
                  Our agents are available Mon–Fri, 9:00–18:00 CET
                </p>
              </div>

              <div className="w-full space-y-3">
                <a
                  href="tel:+35228797626"
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 text-left transition-colors hover:border-[#b59354] hover:bg-amber-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]/10">
                    <Phone className="h-4 w-4 text-[#b59354]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Call us (Luxembourg)</p>
                    <p className="text-xs text-gray-500">+352 28 79 76 26</p>
                  </div>
                </a>

                <a
                  href="tel:+33698214446"
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 text-left transition-colors hover:border-[#b59354] hover:bg-amber-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]/10">
                    <Phone className="h-4 w-4 text-[#b59354]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Call us (France)</p>
                    <p className="text-xs text-gray-500">+33 6 98 21 44 46</p>
                  </div>
                </a>

                <a
                  href="mailto:contact@opulanz.com"
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 text-left transition-colors hover:border-[#b59354] hover:bg-amber-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#b59354]/10">
                    <Mail className="h-4 w-4 text-[#b59354]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email us</p>
                    <p className="text-xs text-gray-500">contact@opulanz.com</p>
                  </div>
                </a>
              </div>

              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Back to AI assistant
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Floating bubble ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#252623] shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Minimize chat" : "Open support chat"}
      >
        <MessageCircle className="h-6 w-6 text-[#b59354]" />
        {/* Unread dot */}
        {unread && !open && (
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-[#252623] bg-red-500" />
        )}
      </button>
    </>
  );
}
