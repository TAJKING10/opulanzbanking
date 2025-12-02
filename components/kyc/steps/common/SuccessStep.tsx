"use client";

import React from 'react';
import { useKYCWizard } from '@/contexts/KYCWizardContext';
import { CheckCircle, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SuccessStep() {
  const { data, resetWizard } = useKYCWizard();

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `opulanz-kyc-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-brand-dark mb-4">Application Submitted Successfully!</h2>
        <p className="text-lg text-brand-grayMed max-w-2xl mx-auto">
          Thank you for completing your client onboarding. Your information has been received
          and will be reviewed by our compliance team.
        </p>
      </div>

      <div className="bg-brand-goldLight/10 border border-brand-gold/30 rounded-xl p-8 max-w-2xl mx-auto mb-8">
        <h3 className="text-xl font-semibold text-brand-dark mb-4">What Happens Next?</h3>
        <ul className="space-y-3 text-left">
          <li className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-semibold mt-0.5">
              1
            </div>
            <div>
              <p className="text-sm text-brand-dark font-semibold">Document Generation</p>
              <p className="text-sm text-brand-grayMed">
                We'll automatically generate your regulatory documents (Lettre de mission, Déclaration d'adéquation, etc.)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-semibold mt-0.5">
              2
            </div>
            <div>
              <p className="text-sm text-brand-dark font-semibold">Compliance Review</p>
              <p className="text-sm text-brand-grayMed">
                Our team will review your application within 2-3 business days
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-semibold mt-0.5">
              3
            </div>
            <div>
              <p className="text-sm text-brand-dark font-semibold">DocuSign Signature</p>
              <p className="text-sm text-brand-grayMed">
                You'll receive an email with documents to sign electronically via DocuSign
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center text-sm font-semibold mt-0.5">
              4
            </div>
            <div>
              <p className="text-sm text-brand-dark font-semibold">Account Activation</p>
              <p className="text-sm text-brand-grayMed">
                Once signed, your investment account will be activated
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="bg-white border border-brand-grayLight rounded-xl p-6 max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-brand-gold" />
            <div className="text-left">
              <p className="text-sm font-semibold text-brand-dark">Application Reference</p>
              <p className="text-xs text-brand-grayMed">KYC-{Date.now().toString().slice(-8)}</p>
            </div>
          </div>
          <Button
            onClick={handleDownloadJSON}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Data
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => window.location.href = '/'}
          className="bg-brand-gold hover:bg-brand-goldDark"
        >
          Return to Homepage
        </Button>
        <Button
          onClick={resetWizard}
          variant="outline"
        >
          Start New Application
        </Button>
      </div>

      <div className="mt-12 pt-8 border-t border-brand-grayLight">
        <p className="text-sm text-brand-grayMed">
          Questions? Contact us at <a href="mailto:support@opulanz.com" className="text-brand-gold hover:underline">support@opulanz.com</a>
        </p>
      </div>
    </div>
  );
}
