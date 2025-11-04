"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Building2, FileText } from "lucide-react";

interface CompanyFormationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function CompanyFormationStep({ data, onUpdate, onNext }: CompanyFormationStepProps) {
  const [proposedName, setProposedName] = React.useState(data.proposedCompanyName || "");
  const [businessActivity, setBusinessActivity] = React.useState(data.businessActivity || "");
  const [shareCapital, setShareCapital] = React.useState(data.shareCapital || "");

  const handleContinue = () => {
    if (proposedName && businessActivity && shareCapital) {
      onUpdate({
        proposedCompanyName: proposedName,
        businessActivity,
        shareCapital,
      });
      onNext();
    }
  };

  const canContinue = proposedName && businessActivity && shareCapital;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Company Formation Details</h2>
        <p className="text-brand-grayMed">
          Provide information for forming your new company in {data.jurisdiction === "LU" ? "Luxembourg" : data.jurisdiction === "FR" ? "France" : data.jurisdiction === "FI" ? "Finland" : "your chosen jurisdiction"}.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-brand-grayLight bg-white p-6">
          <div className="flex items-start gap-4">
            <Building2 className="h-8 w-8 flex-shrink-0 text-brand-gold" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-brand-dark">Company Formation Service</h3>
              <p className="text-sm text-brand-grayMed">
                We'll handle the entire company formation process including registration,
                drafting articles of association, and setting up your corporate structure.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposedName">Proposed Company Name *</Label>
          <Input
            id="proposedName"
            type="text"
            value={proposedName}
            onChange={(e) => setProposedName(e.target.value)}
            placeholder="Enter your proposed company name"
          />
          <p className="text-xs text-brand-grayMed">
            We'll check availability and suggest alternatives if needed
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessActivity">Business Activity / Description *</Label>
          <Textarea
            id="businessActivity"
            value={businessActivity}
            onChange={(e) => setBusinessActivity(e.target.value)}
            placeholder="Describe your business activities (e.g., software development, consulting, e-commerce)"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shareCapital">Initial Share Capital *</Label>
          <Input
            id="shareCapital"
            type="text"
            value={shareCapital}
            onChange={(e) => setShareCapital(e.target.value)}
            placeholder="e.g., €12,000"
          />
          <p className="text-xs text-brand-grayMed">
            Minimum requirements vary by jurisdiction
            {data.jurisdiction === "LU" && " (Luxembourg: €12,000 for S.à r.l.)"}
            {data.jurisdiction === "FR" && " (France: €1 for SAS/SARL)"}
            {data.jurisdiction === "FI" && " (Finland: €2,500 for Oy)"}
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
            <FileText className="h-4 w-4" />
            What's Included
          </h4>
          <ul className="space-y-1 text-sm text-amber-800">
            <li>• Company name reservation and registration</li>
            <li>• Articles of association preparation</li>
            <li>• Company registration with authorities</li>
            <li>• Tax registration</li>
            <li>• Bank account opening</li>
            <li>• Registered office address (if needed)</li>
          </ul>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">Formation Timeline</h4>
          <p className="text-sm text-blue-800">
            The company formation process typically takes 2-4 weeks. We'll keep you updated at
            each stage and coordinate the bank account opening to minimize delays.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="bg-brand-gold text-white hover:bg-brand-goldDark"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
