import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  overline?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  overline,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={cn("mb-12 max-w-3xl", alignClass, className)}>
      {overline && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-gold">
          {overline}
        </p>
      )}
      <h2
        className={cn(
          "gold-underline text-balance text-3xl font-bold tracking-tight text-brand-dark md:text-4xl lg:text-5xl",
          align === "center" && "inline-block"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-6 text-balance text-lg text-brand-grayMed">
          {description}
        </p>
      )}
    </div>
  );
}
