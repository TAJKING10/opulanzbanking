"use client";

import * as React from "react";
import { Calendar, CreditCard, FileText, Pen, ShieldCheck, ChevronDown } from "lucide-react";

const SECTIONS = [
  {
    icon: Calendar,
    title: "Calendly / Appointment Scheduling",
    items: [
      "60-minute video consultation per session",
      "Calendar synchronisation (Google Calendar, Outlook)",
      "ICS confirmation email to client",
      "Rescheduling rules to be defined at production stage",
      "Time zone handling: CET/CEST (Europe/Paris)",
    ],
  },
  {
    icon: CreditCard,
    title: "Payment",
    items: [
      "Payment-service provider: to be confirmed",
      "Billing entity: Advensys Insurance Finance, France",
      "Production invoice process: to be confirmed",
      "VAT/tax treatment: subject to final legal validation",
      "No card data is collected on this demonstration page",
    ],
  },
  {
    icon: FileText,
    title: "Document Storage",
    items: [
      "Secure encrypted storage required for production",
      "Role-based access controls required",
      "File-retention rules: approximately 5–10 years (subject to final legal validation)",
      "Malware scanning required for all uploads",
      "Full audit logging of access and modifications",
    ],
  },
  {
    icon: Pen,
    title: "DocuSign — Electronic Signature",
    items: [
      "Developer environment required during implementation",
      "Production integration only after written approval",
      "Signed suitability report stored as final record",
      "Full signature audit trail (timestamps, IP, identity)",
      "Secure archival in compliance with MiFID II requirements",
      "No DocuSign API keys or integration keys are present in this prototype",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Compliance and Regulatory",
    items: [
      "MiFID II suitability assessment (Article 25)",
      "Decision journaling: advisor rationale must be documented",
      "Conflict-of-interest register maintained by Advensys Insurance Finance",
      "Record retention: approximately 5–10 years (subject to final legal validation)",
      "GDPR consent management and data-subject rights process required",
      "Non-independent advisory model: disclosed to client before engagement",
    ],
  },
];

function TechCard({ icon: Icon, title, items }: (typeof SECTIONS)[0]) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="rounded-xl border border-brand-grayLight bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-inset transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/10">
            <Icon className="h-4 w-4 text-brand-gold" />
          </div>
          <span className="text-sm font-semibold text-brand-dark">{title}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-brand-gold transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul className="border-t border-brand-grayLight px-5 py-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-brand-grayMed">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-gold" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function IATTechSection() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900">
        <strong>Internal review only.</strong> The information below describes the intended production requirements.
        This section is for management review and does not constitute legal, regulatory, or commercial guarantees.
      </div>

      {SECTIONS.map((s) => (
        <TechCard key={s.title} {...s} />
      ))}
    </div>
  );
}
