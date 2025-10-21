import * as React from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: React.ReactNode;
  required?: boolean;
  error?: string;
  links?: Array<{ text: string; href: string }>;
  className?: string;
}

export function ConsentCheckbox({
  id,
  checked,
  onCheckedChange,
  label,
  required = false,
  error,
  links,
  className,
}: ConsentCheckboxProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-required={required}
          aria-invalid={!!error}
          className="mt-0.5"
        />
        <Label
          htmlFor={id}
          className="flex-1 cursor-pointer text-sm font-normal leading-relaxed text-brand-dark"
        >
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
          {links && links.length > 0 && (
            <span className="mt-1 block space-x-3">
              {links.map((link, index) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold underline underline-offset-2 hover:text-brand-goldDark"
                  >
                    {link.text}
                  </Link>
                  {index < links.length - 1 && <span>•</span>}
                </React.Fragment>
              ))}
            </span>
          )}
        </Label>
      </div>
      {error && (
        <p className="ml-8 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
