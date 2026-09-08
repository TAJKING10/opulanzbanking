"use client";

import * as React from "react";
import { Calendar, CreditCard, FileText, Pen, ShieldCheck, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

const SECTION_ICONS = [Calendar, CreditCard, FileText, Pen, ShieldCheck];

function TechCard({ icon: Icon, title, items }: { icon: React.ElementType; title: string; items: string[] }) {
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
  const tp = useTranslations("iat.page");
  const sections = tp.raw("techSections") as { title: string; items: string[] }[];

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900">
        <strong>{tp("techOverline")}. </strong>{tp("techInternalNote")}
      </div>

      {sections.map((s, i) => (
        <TechCard key={s.title} icon={SECTION_ICONS[i] ?? ShieldCheck} title={s.title} items={s.items} />
      ))}
    </div>
  );
}
