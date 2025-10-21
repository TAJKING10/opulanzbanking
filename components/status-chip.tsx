import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusChipVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      status: {
        pending: "bg-brand-grayLight text-brand-dark",
        started: "bg-blue-100 text-blue-700",
        in_progress: "bg-amber-100 text-amber-700",
        submitted: "bg-purple-100 text-purple-700",
        approved: "bg-emerald-100 text-emerald-700",
        active: "bg-green-100 text-green-700",
        declined: "bg-red-100 text-red-700",
        clicked: "bg-gray-100 text-gray-700",
        completed: "bg-brand-goldLight text-brand-goldDark",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
);

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChipVariants> {
  label?: string;
}

export function StatusChip({
  status,
  label,
  className,
  ...props
}: StatusChipProps) {
  const displayLabel =
    label ||
    (status
      ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "");

  return (
    <span
      className={cn(statusChipVariants({ status }), className)}
      {...props}
    >
      {displayLabel}
    </span>
  );
}
