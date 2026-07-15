"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export const COUNTRY_DIAL_CODES = [
  { dial: "+93", country: "Afghanistan", flag: "🇦🇫" },
  { dial: "+355", country: "Albania", flag: "🇦🇱" },
  { dial: "+213", country: "Algeria", flag: "🇩🇿" },
  { dial: "+376", country: "Andorra", flag: "🇦🇩" },
  { dial: "+244", country: "Angola", flag: "🇦🇴" },
  { dial: "+54", country: "Argentina", flag: "🇦🇷" },
  { dial: "+374", country: "Armenia", flag: "🇦🇲" },
  { dial: "+61", country: "Australia", flag: "🇦🇺" },
  { dial: "+43", country: "Austria", flag: "🇦🇹" },
  { dial: "+994", country: "Azerbaijan", flag: "🇦🇿" },
  { dial: "+973", country: "Bahrain", flag: "🇧🇭" },
  { dial: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { dial: "+375", country: "Belarus", flag: "🇧🇾" },
  { dial: "+32", country: "Belgium", flag: "🇧🇪" },
  { dial: "+229", country: "Benin", flag: "🇧🇯" },
  { dial: "+975", country: "Bhutan", flag: "🇧🇹" },
  { dial: "+591", country: "Bolivia", flag: "🇧🇴" },
  { dial: "+387", country: "Bosnia", flag: "🇧🇦" },
  { dial: "+55", country: "Brazil", flag: "🇧🇷" },
  { dial: "+673", country: "Brunei", flag: "🇧🇳" },
  { dial: "+359", country: "Bulgaria", flag: "🇧🇬" },
  { dial: "+855", country: "Cambodia", flag: "🇰🇭" },
  { dial: "+237", country: "Cameroon", flag: "🇨🇲" },
  { dial: "+1", country: "Canada", flag: "🇨🇦" },
  { dial: "+56", country: "Chile", flag: "🇨🇱" },
  { dial: "+86", country: "China", flag: "🇨🇳" },
  { dial: "+57", country: "Colombia", flag: "🇨🇴" },
  { dial: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { dial: "+385", country: "Croatia", flag: "🇭🇷" },
  { dial: "+53", country: "Cuba", flag: "🇨🇺" },
  { dial: "+357", country: "Cyprus", flag: "🇨🇾" },
  { dial: "+420", country: "Czech Republic", flag: "🇨🇿" },
  { dial: "+45", country: "Denmark", flag: "🇩🇰" },
  { dial: "+593", country: "Ecuador", flag: "🇪🇨" },
  { dial: "+20", country: "Egypt", flag: "🇪🇬" },
  { dial: "+503", country: "El Salvador", flag: "🇸🇻" },
  { dial: "+372", country: "Estonia", flag: "🇪🇪" },
  { dial: "+251", country: "Ethiopia", flag: "🇪🇹" },
  { dial: "+358", country: "Finland", flag: "🇫🇮" },
  { dial: "+33", country: "France", flag: "🇫🇷" },
  { dial: "+995", country: "Georgia", flag: "🇬🇪" },
  { dial: "+49", country: "Germany", flag: "🇩🇪" },
  { dial: "+233", country: "Ghana", flag: "🇬🇭" },
  { dial: "+30", country: "Greece", flag: "🇬🇷" },
  { dial: "+502", country: "Guatemala", flag: "🇬🇹" },
  { dial: "+509", country: "Haiti", flag: "🇭🇹" },
  { dial: "+504", country: "Honduras", flag: "🇭🇳" },
  { dial: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { dial: "+36", country: "Hungary", flag: "🇭🇺" },
  { dial: "+354", country: "Iceland", flag: "🇮🇸" },
  { dial: "+91", country: "India", flag: "🇮🇳" },
  { dial: "+62", country: "Indonesia", flag: "🇮🇩" },
  { dial: "+98", country: "Iran", flag: "🇮🇷" },
  { dial: "+964", country: "Iraq", flag: "🇮🇶" },
  { dial: "+353", country: "Ireland", flag: "🇮🇪" },
  { dial: "+972", country: "Israel", flag: "🇮🇱" },
  { dial: "+39", country: "Italy", flag: "🇮🇹" },
  { dial: "+81", country: "Japan", flag: "🇯🇵" },
  { dial: "+962", country: "Jordan", flag: "🇯🇴" },
  { dial: "+7", country: "Kazakhstan", flag: "🇰🇿" },
  { dial: "+254", country: "Kenya", flag: "🇰🇪" },
  { dial: "+965", country: "Kuwait", flag: "🇰🇼" },
  { dial: "+371", country: "Latvia", flag: "🇱🇻" },
  { dial: "+961", country: "Lebanon", flag: "🇱🇧" },
  { dial: "+218", country: "Libya", flag: "🇱🇾" },
  { dial: "+370", country: "Lithuania", flag: "🇱🇹" },
  { dial: "+352", country: "Luxembourg", flag: "🇱🇺" },
  { dial: "+60", country: "Malaysia", flag: "🇲🇾" },
  { dial: "+960", country: "Maldives", flag: "🇲🇻" },
  { dial: "+356", country: "Malta", flag: "🇲🇹" },
  { dial: "+52", country: "Mexico", flag: "🇲🇽" },
  { dial: "+373", country: "Moldova", flag: "🇲🇩" },
  { dial: "+377", country: "Monaco", flag: "🇲🇨" },
  { dial: "+976", country: "Mongolia", flag: "🇲🇳" },
  { dial: "+382", country: "Montenegro", flag: "🇲🇪" },
  { dial: "+212", country: "Morocco", flag: "🇲🇦" },
  { dial: "+95", country: "Myanmar", flag: "🇲🇲" },
  { dial: "+977", country: "Nepal", flag: "🇳🇵" },
  { dial: "+31", country: "Netherlands", flag: "🇳🇱" },
  { dial: "+64", country: "New Zealand", flag: "🇳🇿" },
  { dial: "+234", country: "Nigeria", flag: "🇳🇬" },
  { dial: "+47", country: "Norway", flag: "🇳🇴" },
  { dial: "+968", country: "Oman", flag: "🇴🇲" },
  { dial: "+92", country: "Pakistan", flag: "🇵🇰" },
  { dial: "+970", country: "Palestine", flag: "🇵🇸" },
  { dial: "+507", country: "Panama", flag: "🇵🇦" },
  { dial: "+51", country: "Peru", flag: "🇵🇪" },
  { dial: "+63", country: "Philippines", flag: "🇵🇭" },
  { dial: "+48", country: "Poland", flag: "🇵🇱" },
  { dial: "+351", country: "Portugal", flag: "🇵🇹" },
  { dial: "+974", country: "Qatar", flag: "🇶🇦" },
  { dial: "+40", country: "Romania", flag: "🇷🇴" },
  { dial: "+7", country: "Russia", flag: "🇷🇺" },
  { dial: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { dial: "+221", country: "Senegal", flag: "🇸🇳" },
  { dial: "+381", country: "Serbia", flag: "🇷🇸" },
  { dial: "+65", country: "Singapore", flag: "🇸🇬" },
  { dial: "+421", country: "Slovakia", flag: "🇸🇰" },
  { dial: "+386", country: "Slovenia", flag: "🇸🇮" },
  { dial: "+27", country: "South Africa", flag: "🇿🇦" },
  { dial: "+82", country: "South Korea", flag: "🇰🇷" },
  { dial: "+34", country: "Spain", flag: "🇪🇸" },
  { dial: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { dial: "+46", country: "Sweden", flag: "🇸🇪" },
  { dial: "+41", country: "Switzerland", flag: "🇨🇭" },
  { dial: "+963", country: "Syria", flag: "🇸🇾" },
  { dial: "+886", country: "Taiwan", flag: "🇹🇼" },
  { dial: "+66", country: "Thailand", flag: "🇹🇭" },
  { dial: "+216", country: "Tunisia", flag: "🇹🇳" },
  { dial: "+90", country: "Turkey", flag: "🇹🇷" },
  { dial: "+971", country: "UAE", flag: "🇦🇪" },
  { dial: "+44", country: "UK", flag: "🇬🇧" },
  { dial: "+1", country: "USA", flag: "🇺🇸" },
  { dial: "+598", country: "Uruguay", flag: "🇺🇾" },
  { dial: "+998", country: "Uzbekistan", flag: "🇺🇿" },
  { dial: "+58", country: "Venezuela", flag: "🇻🇪" },
  { dial: "+84", country: "Vietnam", flag: "🇻🇳" },
  { dial: "+967", country: "Yemen", flag: "🇾🇪" },
  { dial: "+260", country: "Zambia", flag: "🇿🇲" },
  { dial: "+263", country: "Zimbabwe", flag: "🇿🇼" },
];

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

interface PhoneInputProps {
  dialCode: string;
  number: string;
  onDialCodeChange: (v: string) => void;
  onNumberChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  dialCode,
  number,
  onDialCodeChange,
  onNumberChange,
  placeholder = "Phone number",
  disabled,
  className,
}: PhoneInputProps) {
  const selected = COUNTRY_DIAL_CODES.find((c) => c.dial === dialCode);

  return (
    <div
      className={cn(
        "flex items-center border border-input rounded-md bg-background h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
    >
      <Select value={dialCode} onValueChange={onDialCodeChange} disabled={disabled}>
        <SelectTrigger className="h-full border-0 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 w-[120px] px-3 gap-1.5 shrink-0">
          <SelectValue placeholder="Code">
            {selected ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xl leading-none">{selected.flag}</span>
                <span className="text-sm font-medium">{selected.dial}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Code</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {COUNTRY_DIAL_CODES.map((item) => (
            <SelectItem key={`${item.dial}-${item.country}`} value={item.dial}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.flag}</span>
                <span className="text-sm font-medium w-[52px]">{item.dial}</span>
                <span className="text-sm text-muted-foreground">{item.country}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="h-5 w-px bg-border shrink-0" />

      <Input
        type="tel"
        value={number}
        onChange={(e) => onNumberChange(e.target.value.replace(/[^\d\s\-()+]/g, ""))}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none"
      />
    </div>
  );
}
