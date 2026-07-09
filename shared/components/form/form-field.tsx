/**
 * Reusable Form Field Component
 * Eliminates repetitive Input + Label + Error markup
 */

import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FieldError } from "react-hook-form";

export interface FormFieldProps extends InputProps {
  label: string;
  error?: FieldError;
  required?: boolean;
  helpText?: string;
  containerClassName?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      required,
      helpText,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={fieldId}
          ref={ref}
          className={cn(error && "border-red-500", className)}
          aria-invalid={!!error}
          {...props}
        />
        {helpText && !error && (
          <p className="text-xs text-brand-grayMed">{helpText}</p>
        )}
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
