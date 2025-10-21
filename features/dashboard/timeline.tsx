import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusChip } from "@/components/status-chip";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "in_progress" | "pending";
  date?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCompleted = item.status === "completed";
        const isInProgress = item.status === "in_progress";

        return (
          <div key={item.id} className="relative flex gap-4">
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-5 top-12 h-full w-0.5",
                  isCompleted ? "bg-brand-gold" : "bg-brand-grayLight"
                )}
              />
            )}

            {/* Status Icon */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  isCompleted && "bg-brand-gold text-white",
                  isInProgress && "bg-brand-goldLight text-brand-goldDark",
                  !isCompleted && !isInProgress && "bg-brand-grayLight text-brand-grayMed"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Circle
                    className={cn(
                      "h-4 w-4",
                      isInProgress && "animate-pulse fill-current"
                    )}
                  />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-base font-bold text-brand-dark">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="mt-1 text-sm text-brand-grayMed">
                      {item.description}
                    </p>
                  )}
                  {item.date && (
                    <p className="mt-2 text-xs text-brand-grayMed">
                      {item.date}
                    </p>
                  )}
                </div>
                <StatusChip status={item.status} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
