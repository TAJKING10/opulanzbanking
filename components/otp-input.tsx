"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, length = 6, disabled }: OtpInputProps) {
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  function handleChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, "");
    if (!v) {
      const next = value.split("");
      next[idx] = "";
      onChange(next.join("").slice(0, length));
      return;
    }
    // Paste handling: if multiple digits pasted
    if (v.length > 1) {
      const pasted = v.slice(0, length - idx);
      const next = value.split("").concat(Array(length).fill("")).slice(0, length);
      for (let i = 0; i < pasted.length; i++) {
        next[idx + i] = pasted[i];
      }
      onChange(next.join("").slice(0, length));
      inputs.current[Math.min(idx + pasted.length, length - 1)]?.focus();
      return;
    }
    const next = value.split("").concat(Array(length).fill("")).slice(0, length);
    next[idx] = v;
    onChange(next.join("").slice(0, length));
    if (idx < length - 1) inputs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all",
            "border-gray-200 focus:border-[#b59354] focus:ring-2 focus:ring-[#b59354]/20",
            digits[idx] ? "border-[#b59354] bg-[#b59354]/5" : "bg-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}
