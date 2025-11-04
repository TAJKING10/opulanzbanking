"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Info } from "lucide-react";

interface JurisdictionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function JurisdictionStep({ data, onUpdate, onNext }: JurisdictionStepProps) {
  const [jurisdiction, setJurisdiction] = React.useState(data.jurisdiction || "");

  const handleJurisdictionChange = (value: string) => {
    setJurisdiction(value);
    onUpdate({ jurisdiction: value });
  };

  const handleContinue = () => {
    if (jurisdiction) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Intended Jurisdiction</h2>
        <p className="text-brand-grayMed">
          {data.companyStatus === "existing"
            ? "Where is your company registered?"
            : "Where would you like to form your company?"}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="jurisdiction" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-gold" />
            <span>Select Jurisdiction *</span>
          </Label>
          <Select value={jurisdiction} onValueChange={handleJurisdictionChange}>
            <SelectTrigger id="jurisdiction" className="w-full">
              <SelectValue placeholder="Choose a jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LU">Luxembourg</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="FI">Finland</SelectItem>
              <SelectItem value="BE">Belgium</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="NL">Netherlands</SelectItem>
              <SelectItem value="ES">Spain</SelectItem>
              <SelectItem value="IT">Italy</SelectItem>
              <SelectItem value="PT">Portugal</SelectItem>
              <SelectItem value="AT">Austria</SelectItem>
              <SelectItem value="OTHER">Other EU Country</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-brand-grayMed">
            This determines which banking partner and regulatory framework will apply
          </p>
        </div>

        {jurisdiction && (
          <div className="rounded-lg border border-brand-grayLight bg-white p-6">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-brand-dark">
              <Info className="h-5 w-5 text-brand-gold" />
              Jurisdiction Information
            </h4>

            {jurisdiction === "LU" && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>
                  <strong>Luxembourg:</strong> Premier financial center with favorable tax regime for
                  holding companies. Corporate tax rate: ~24%.
                </p>
                <p>Minimum share capital: €12,000 for S.à r.l. (limited liability company)</p>
              </div>
            )}

            {jurisdiction === "FR" && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>
                  <strong>France:</strong> Large economy with access to EU market. Corporate tax rate: ~25%.
                </p>
                <p>Minimum share capital: €1 for SAS/SARL (most common structures)</p>
              </div>
            )}

            {jurisdiction === "FI" && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>
                  <strong>Finland:</strong> Stable Nordic economy with strong digital infrastructure.
                  Corporate tax rate: 20%.
                </p>
                <p>Minimum share capital: €2,500 for Oy (limited company)</p>
              </div>
            )}

            {!["LU", "FR", "FI"].includes(jurisdiction) && (
              <div className="space-y-2 text-sm text-brand-grayMed">
                <p>
                  We'll match you with Opulanz Partner Bank that serves companies in your selected
                  jurisdiction. Specific requirements and timelines will be provided after application
                  review.
                </p>
              </div>
            )}
          </div>
        )}

        {data.companyStatus === "new" && jurisdiction && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-blue-900">Company Formation Timeline</h4>
            <p className="text-sm text-blue-800">
              Company formation in {jurisdiction === "LU" ? "Luxembourg" : jurisdiction === "FR" ? "France" : jurisdiction === "FI" ? "Finland" : "your jurisdiction"} typically takes 2-4 weeks. We'll guide you through the entire
              process and help you open your bank account simultaneously.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!jurisdiction}
          className="bg-brand-gold text-white hover:bg-brand-goldDark"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
