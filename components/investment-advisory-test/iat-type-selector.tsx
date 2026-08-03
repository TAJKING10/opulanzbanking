"use client";
import * as React from "react";
import { Building2, User } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ClientType } from "./iat-types";

interface Props {
  onSelect: (type: ClientType) => void;
}

export function IATTypeSelector({ onSelect }: Props) {
  const t = useTranslations("iat");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-dark mb-1">
          {t("typeSelector.heading")}
        </h2>
        <p className="text-sm text-brand-grayMed">
          {t("typeSelector.subtext")}
        </p>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900">
        <strong>{t("typeSelector.disclaimerStrong")}</strong>{" "}
        {t("typeSelector.disclaimer")}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelect("personal")}
          className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-brand-grayLight bg-white p-8 text-center hover:border-brand-gold hover:bg-brand-gold/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition-all"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors">
            <User className="h-8 w-8 text-brand-gold" />
          </div>
          <div>
            <p className="text-base font-bold text-brand-dark">{t("typeSelector.naturalPersonTitle")}</p>
            <p className="text-xs text-brand-grayMed mt-1">
              {t("typeSelector.naturalPersonDesc")}
            </p>
          </div>
          <span className="mt-2 inline-block rounded-full bg-brand-gold px-4 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {t("typeSelector.select")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect("company")}
          className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-brand-grayLight bg-white p-8 text-center hover:border-brand-gold hover:bg-brand-gold/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition-all"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors">
            <Building2 className="h-8 w-8 text-brand-gold" />
          </div>
          <div>
            <p className="text-base font-bold text-brand-dark">{t("typeSelector.legalEntityTitle")}</p>
            <p className="text-xs text-brand-grayMed mt-1">
              {t("typeSelector.legalEntityDesc")}
            </p>
          </div>
          <span className="mt-2 inline-block rounded-full bg-brand-gold px-4 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {t("typeSelector.select")}
          </span>
        </button>
      </div>
    </div>
  );
}
