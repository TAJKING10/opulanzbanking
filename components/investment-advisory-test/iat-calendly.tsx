"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IATFormData } from "./iat-types";

interface Props {
  formData: IATFormData;
  onChange: (data: Partial<IATFormData>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

const CALENDLY_URL = "https://calendly.com/opulanz-banking/conseil-en-investissement";

export function IATCalendly({ formData, onChange, onNext, error, setError }: Props) {
  const t = useTranslations("iat");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const existing = document.querySelector(
      'script[src="https://assets.calendly.com/assets/external/widget.js"]'
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleNext = () => {
    if (!formData.appointment.booked) {
      setError(t("calendly.errNotBooked"));
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-brand-dark mb-1">{t("calendly.title")}</h3>
        <p className="text-sm text-brand-grayMed">
          {t("calendly.subtitle")}
        </p>
      </div>

      <div className="rounded-xl bg-brand-gold/5 border border-brand-gold/30 px-4 py-3 flex items-start gap-3">
        <Calendar className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
        <div className="text-xs text-brand-dark">
          <strong>{t("calendly.consultationInfo")}</strong>
          <br />
          {t("calendly.calendarSync")}
        </div>
      </div>

      {/* Calendly inline widget */}
      <div
        className="calendly-inline-widget rounded-xl overflow-hidden border border-brand-grayLight"
        data-url={CALENDLY_URL}
        style={{ minWidth: "320px", height: "680px" }}
      />

      {/* Fallback link */}
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-brand-gold font-semibold hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        {t("calendly.openInNewTab")}
      </a>

      {/* Booking confirmation */}
      <div className={`rounded-xl border-2 p-4 transition-all ${formData.appointment.booked ? "border-brand-gold bg-brand-gold/5" : "border-brand-grayLight bg-white"}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={formData.appointment.booked}
            onCheckedChange={(v) =>
              onChange({ appointment: { ...formData.appointment, booked: !!v } })
            }
            className="mt-0.5"
          />
          <span className="text-sm leading-snug">
            <strong>{t("calendly.confirmLabel")}</strong>
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
        {t("calendly.nextBtn")}
      </Button>
    </div>
  );
}
