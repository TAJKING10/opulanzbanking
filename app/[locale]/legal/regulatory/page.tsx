"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileCheck, Building2, Scale } from "lucide-react";

export default function RegulatoryPage() {
  const t = useTranslations();
  const locale = useLocale();

  const regulators = [
    {
      name: "ACPR",
      fullName: "Autorité de Contrôle Prudentiel et de Résolution",
      country: "France",
      description: "The French Prudential Supervision and Resolution Authority supervises banks, insurance companies, and financial institutions operating in France.",
      website: "https://acpr.banque-france.fr",
      icon: Shield,
    },
    {
      name: "AMF",
      fullName: "Autorité des Marchés Financiers",
      country: "France",
      description: "The French Financial Markets Authority regulates financial markets, investment services, and protects investors.",
      website: "https://www.amf-france.org",
      icon: Building2,
    },
  ];

  return (
    <>
      <Hero
        title="Regulatory Information"
        subtitle="Our commitment to compliance and regulatory oversight"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-lg text-brand-grayMed">
              Opulanz operates under strict regulatory oversight to ensure the highest standards of financial
              integrity, client protection, and operational transparency.
            </p>
          </div>

          <Card className="mb-12 border-none shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <Scale className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">Regulatory Framework</h2>
              <p className="mb-4 text-brand-grayMed">
                Opulanz is regulated by leading European financial authorities. Our operations comply with:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed space-y-2">
                <li>EU Payment Services Directive (PSD2)</li>
                <li>Markets in Financial Instruments Directive (MiFID II)</li>
                <li>Anti-Money Laundering Directives (AMLD5/6)</li>
                <li>General Data Protection Regulation (GDPR)</li>
                <li>Banking and financial services regulations in France</li>
              </ul>
            </CardContent>
          </Card>

          <h2 className="mb-8 text-center text-3xl font-bold text-brand-dark">Our Regulators</h2>

          <div className="space-y-6 mb-12">
            {regulators.map((regulator, index) => {
              const Icon = regulator.icon;
              return (
                <Card key={index} className="card-hover border-none">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                          <Icon className="h-8 w-8 text-brand-goldDark" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-brand-dark">{regulator.name}</h3>
                          <span className="rounded-full bg-brand-goldLight px-3 py-1 text-xs font-semibold text-brand-goldDark">
                            {regulator.country}
                          </span>
                        </div>
                        <p className="mb-3 text-sm font-semibold text-brand-gold">
                          {regulator.fullName}
                        </p>
                        <p className="mb-4 text-brand-grayMed">
                          {regulator.description}
                        </p>
                        <a
                          href={regulator.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand-gold hover:text-brand-goldDark transition-colors"
                        >
                          Visit Official Website →
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mb-12 border-none shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <FileCheck className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">Compliance Standards</h2>
              <p className="mb-4 text-brand-grayMed">
                We maintain the highest compliance standards across all aspects of our operations:
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">Anti-Money Laundering (AML)</h3>
              <p className="mb-4 text-brand-grayMed">
                We implement comprehensive AML policies and procedures to detect and prevent money laundering activities.
                This includes ongoing transaction monitoring, suspicious activity reporting, and staff training programs.
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">Know Your Customer (KYC)</h3>
              <p className="mb-4 text-brand-grayMed">
                All clients undergo thorough identity verification and due diligence procedures. We collect and verify
                personal information, beneficial ownership details, and source of funds to ensure regulatory compliance.
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">Counter-Terrorist Financing (CTF)</h3>
              <p className="mb-4 text-brand-grayMed">
                We screen all clients and transactions against international sanctions lists and watchlists to prevent
                terrorist financing and comply with international security regulations.
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">Data Protection</h3>
              <p className="mb-4 text-brand-grayMed">
                We comply with GDPR and implement robust data protection measures to safeguard your personal information.
                Your data is processed lawfully, transparently, and securely.
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">Client Fund Protection</h3>
              <p className="mb-4 text-brand-grayMed">
                Client funds are held in segregated accounts with licensed banking partners and are protected according to
                applicable deposit guarantee schemes. Your funds are kept separate from company operational funds.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">Licenses and Authorizations</h2>
              <p className="mb-6 text-brand-grayMed">
                Opulanz holds the necessary licenses and authorizations to provide financial services:
              </p>

              <div className="space-y-4">
                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">Banking Services - France</h3>
                  <p className="mb-2 text-sm text-brand-grayMed">
                    Licensed and supervised by ACPR (Autorité de Contrôle Prudentiel et de Résolution)
                  </p>
                  <p className="text-xs text-brand-grayMed">
                    Our French banking operations are fully compliant with French banking law and European banking directives.
                  </p>
                </div>

                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">Investment Services - France</h3>
                  <p className="mb-2 text-sm text-brand-grayMed">
                    Regulated by AMF (Autorité des Marchés Financiers)
                  </p>
                  <p className="text-xs text-brand-grayMed">
                    Our investment advisory services comply with MiFID II regulations and AMF requirements.
                  </p>
                </div>

                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">Payment Services</h3>
                  <p className="mb-2 text-sm text-brand-grayMed">
                    Authorized under PSD2 (Payment Services Directive 2)
                  </p>
                  <p className="text-xs text-brand-grayMed">
                    We provide secure payment services across the European Economic Area in compliance with PSD2 requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12 rounded-lg bg-brand-off p-8 text-center">
            <h3 className="mb-4 text-xl font-bold text-brand-dark">Questions About Our Regulatory Status?</h3>
            <p className="mb-6 text-brand-grayMed">
              For inquiries about our licenses, compliance procedures, or regulatory matters, please contact our compliance team.
            </p>
            <div className="space-y-2 text-sm text-brand-grayMed">
              <p><strong>Compliance Email:</strong> compliance@opulanz.com</p>
              <p><strong>General Inquiries:</strong> +352 20 30 40 50</p>
              <p><strong>Address:</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-brand-grayMed">
            Last updated: October 28, 2025
          </p>
        </div>
      </section>
    </>
  );
}
