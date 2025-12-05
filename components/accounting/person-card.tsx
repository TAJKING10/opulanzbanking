"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonWithRole } from "@/shared/types/person";

export type Person = PersonWithRole;

const ROLES = [
  { value: "ceo", label: "CEO" },
  { value: "cfo", label: "CFO" },
  { value: "owner", label: "Owner" },
  { value: "other", label: "Other" },
];

interface PersonCardProps {
  label: string;
  person: Person;
  onChange: (person: Person) => void;
  required?: boolean;
  errors?: Partial<Record<keyof Person, string>>;
}

export function PersonCard({
  label,
  person,
  onChange,
  required = false,
  errors = {},
}: PersonCardProps) {
  const updateField = (field: keyof Person, value: string) => {
    onChange({ ...person, [field]: value });
  };

  return (
    <div className="space-y-4 rounded-lg border border-brand-grayLight p-4">
      <h3 className="text-sm font-semibold text-brand-dark">
        {label} {required && <span className="text-red-500">*</span>}
      </h3>

      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-sm text-brand-dark">First Name</Label>
            <Input
              value={person.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="John"
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label className="text-sm text-brand-dark">Last Name</Label>
            <Input
              value={person.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Doe"
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm text-brand-dark">Role</Label>
          <Select
            value={person.role}
            onValueChange={(value) => updateField("role", value)}
          >
            <SelectTrigger className={errors.role ? "border-red-500" : ""}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="mt-1 text-xs text-red-500">{errors.role}</p>
          )}
        </div>

        <div>
          <Label className="text-sm text-brand-dark">Email</Label>
          <Input
            type="email"
            value={person.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="john@example.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <Label className="text-sm text-brand-dark">Phone</Label>
          <Input
            type="tel"
            value={person.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+352 123 456 789"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}
