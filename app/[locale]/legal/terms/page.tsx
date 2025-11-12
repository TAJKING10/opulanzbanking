"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      <Hero
        title="Legal Information"
        subtitle="Terms and Conditions"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Company Identification</h2>
              <div className="text-brand-grayMed mb-6 space-y-2">
                <p><strong>Company Name:</strong> Advensys Insurance Finance SARL</p>
                <p><strong>Capital:</strong> 20,000 EUR</p>
                <p><strong>Address:</strong> 66 avenue des Champs Elysées, 75008 Paris</p>
                <p><strong>Phone:</strong> +33 6 98 21 44 46</p>
                <p><strong>Email:</strong> contact@advensys-in-finance.com</p>
                <p><strong>Website:</strong> www.advensys-in-finance.com</p>
                <p><strong>SIRET:</strong> 89511129200010</p>
                <p><strong>APE:</strong> 6622Z</p>
                <p><strong>VAT Number:</strong> FR50895111292</p>
                <p><strong>Registration:</strong> Company registered with the Paris Commercial Court under number 895111292</p>
              </div>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Services Provided</h2>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>Investment Advisory Services</li>
                <li>Insurance Brokerage Services</li>
                <li>Banking Intermediation Services</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Professional Civil Liability Insurance</h2>
              <p className="text-brand-grayMed mb-6">
                Professional civil liability insurance covering our activities is held with AXA France.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Contact Information</h2>
              <div className="text-brand-grayMed mb-6 space-y-2">
                <p><strong>Name:</strong> Irfan Abdul</p>
                <p><strong>Address:</strong> 66 avenue des Champs Elysées, 75008 Paris</p>
                <p><strong>Phone:</strong> 06 98 21 44 46</p>
                <p><strong>Email:</strong> contact@advensys-in-finance.com</p>
              </div>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Intellectual Property</h2>
              <p className="text-brand-grayMed mb-6">
                The name and logo "Advensys In-Finance" are registered trademarks of the company "Advensys Insurance Finance".
              </p>
              <p className="text-brand-grayMed mb-6">
                The website www.advensys-in-finance.com is the property of "Advensys Insurance Finance Sarl".
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">General Conditions of Use</h2>
              <p className="text-brand-grayMed mb-4">
                By accessing this website, you agree to comply with these terms and conditions of use.
              </p>
              <p className="text-brand-grayMed mb-4">
                The company disclaims any responsibility for damages resulting from the use of this website.
              </p>
              <p className="text-brand-grayMed mb-4">
                These terms and conditions may be modified at any time without prior notice.
              </p>
              <p className="text-brand-grayMed mb-6">
                Any dispute relating to the use of this website is subject to French law and the jurisdiction of French courts.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Design and Hosting</h2>
              <div className="text-brand-grayMed mb-6 space-y-2">
                <p><strong>Design:</strong> Advensys Insurance Finance S.A.R.L. – 66 Avenue des Champs Elysées, F-75008 Paris – SIRET: 89511129200010</p>
                <p><strong>Development:</strong> Advensys Insurance Finance S.A.R.L. – 66 Avenue des Champs Elysées, F-75008 Paris – SIRET: 89511129200010</p>
                <p><strong>Hosting:</strong> OVH SAS – 2 rue Kellermann – 59100 Roubaix – France – SIRET: 424 761 419 00045</p>
              </div>

              <div className="mt-8 p-4 bg-brand-goldLight/20 rounded-lg">
                <p className="text-sm text-brand-grayMed italic">
                  All information provided is subject to change without notice. Please verify current terms and conditions.
                </p>
              </div>

              <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
                Last updated: January 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
