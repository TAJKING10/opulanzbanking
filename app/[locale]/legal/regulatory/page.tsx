"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileCheck, Building2, Scale } from "lucide-react";

export default function RegulatoryPage() {
  const locale = useLocale();
  const isFr = locale === "fr";

  const regulators = isFr
    ? [
        {
          name: "CSSF",
          fullName: "Commission de Surveillance du Secteur Financier",
          country: "Luxembourg",
          description:
            "La CSSF est l'autorité de surveillance du secteur financier au Luxembourg. Elle supervise les banques, établissements de paiement, gestionnaires de fonds et autres entités financières opérant au Luxembourg.",
          website: "https://www.cssf.lu",
          icon: Shield,
        },
        {
          name: "ACPR",
          fullName: "Autorité de Contrôle Prudentiel et de Résolution",
          country: "France",
          description:
            "L'ACPR est l'autorité de supervision prudentielle et de résolution française. Elle supervise les banques, compagnies d'assurance et établissements financiers opérant en France.",
          website: "https://acpr.banque-france.fr",
          icon: Building2,
        },
        {
          name: "AMF",
          fullName: "Autorité des Marchés Financiers",
          country: "France",
          description:
            "L'AMF est l'autorité française des marchés financiers. Elle régule les marchés financiers, les services d'investissement et protège les investisseurs.",
          website: "https://www.amf-france.org",
          icon: Scale,
        },
      ]
    : [
        {
          name: "CSSF",
          fullName: "Commission de Surveillance du Secteur Financier",
          country: "Luxembourg",
          description:
            "The CSSF is Luxembourg's financial sector supervisory authority. It supervises banks, payment institutions, fund managers, and other financial entities operating in Luxembourg.",
          website: "https://www.cssf.lu",
          icon: Shield,
        },
        {
          name: "ACPR",
          fullName: "Autorité de Contrôle Prudentiel et de Résolution",
          country: "France",
          description:
            "The French Prudential Supervision and Resolution Authority supervises banks, insurance companies, and financial institutions operating in France.",
          website: "https://acpr.banque-france.fr",
          icon: Building2,
        },
        {
          name: "AMF",
          fullName: "Autorité des Marchés Financiers",
          country: "France",
          description:
            "The French Financial Markets Authority regulates financial markets, investment services, and protects investors.",
          website: "https://www.amf-france.org",
          icon: Scale,
        },
      ];

  return (
    <>
      <Hero
        title={isFr ? "Informations Réglementaires" : "Regulatory Information"}
        subtitle={
          isFr
            ? "Notre engagement envers la conformité et la supervision réglementaire"
            : "Our commitment to compliance and regulatory oversight"
        }
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-lg text-brand-grayMed">
              {isFr
                ? "Opulanz opère sous une supervision réglementaire stricte afin de garantir les plus hauts standards d'intégrité financière, de protection des clients et de transparence opérationnelle."
                : "Opulanz operates under strict regulatory oversight to ensure the highest standards of financial integrity, client protection, and operational transparency."}
            </p>
          </div>

          {/* Regulatory Framework */}
          <Card className="mb-12 border-none shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <Scale className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">
                {isFr ? "Cadre Réglementaire" : "Regulatory Framework"}
              </h2>
              <p className="mb-4 text-brand-grayMed">
                {isFr
                  ? "Opulanz est réglementé par les principales autorités financières européennes. Nos activités respectent :"
                  : "Opulanz is regulated by leading European financial authorities. Our operations comply with:"}
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed space-y-2">
                {isFr ? (
                  <>
                    <li>Directive européenne sur les services de paiement (DSP2)</li>
                    <li>Directive sur les marchés d'instruments financiers (MiFID II)</li>
                    <li>Directives anti-blanchiment (LCB-FT 5e et 6e directive)</li>
                    <li>Règlement général sur la protection des données (RGPD)</li>
                    <li>Réglementation bancaire et financière luxembourgeoise (loi du 5 avril 1993)</li>
                    <li>Réglementation bancaire et financière française (Code monétaire et financier)</li>
                  </>
                ) : (
                  <>
                    <li>EU Payment Services Directive (PSD2)</li>
                    <li>Markets in Financial Instruments Directive (MiFID II)</li>
                    <li>Anti-Money Laundering Directives (AMLD5/6)</li>
                    <li>General Data Protection Regulation (GDPR)</li>
                    <li>Luxembourg Banking and Financial Services Law (Law of 5 April 1993)</li>
                    <li>French Monetary and Financial Code (Code monétaire et financier)</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Regulators */}
          <h2 className="mb-8 text-center text-3xl font-bold text-brand-dark">
            {isFr ? "Nos Autorités de Régulation" : "Our Regulators"}
          </h2>

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
                        <p className="mb-4 text-brand-grayMed">{regulator.description}</p>
                        <a
                          href={regulator.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand-gold hover:text-brand-goldDark transition-colors"
                        >
                          {isFr ? "Visiter le site officiel →" : "Visit Official Website →"}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Compliance Standards */}
          <Card className="mb-12 border-none shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                <FileCheck className="h-8 w-8 text-brand-goldDark" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">
                {isFr ? "Standards de Conformité" : "Compliance Standards"}
              </h2>
              <p className="mb-4 text-brand-grayMed">
                {isFr
                  ? "Nous maintenons les plus hauts standards de conformité dans tous les aspects de nos activités :"
                  : "We maintain the highest compliance standards across all aspects of our operations:"}
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">
                {isFr ? "Lutte contre le Blanchiment de Capitaux (LCB)" : "Anti-Money Laundering (AML)"}
              </h3>
              <p className="mb-4 text-brand-grayMed">
                {isFr
                  ? "Nous mettons en œuvre des politiques et procédures LCB-FT complètes pour détecter et prévenir le blanchiment d'argent. Cela inclut la surveillance continue des transactions, la déclaration d'opérations suspectes et des programmes de formation du personnel."
                  : "We implement comprehensive AML/CFT policies and procedures to detect and prevent money laundering and terrorist financing. This includes ongoing transaction monitoring, suspicious activity reporting, and staff training programmes."}
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">
                {isFr ? "Connaissance du Client (KYC)" : "Know Your Customer (KYC)"}
              </h3>
              <p className="mb-4 text-brand-grayMed">
                {isFr
                  ? "Tous les clients font l'objet de procédures rigoureuses de vérification d'identité et de diligence raisonnable. Nous collectons et vérifions les informations personnelles, les détails sur les bénéficiaires effectifs et l'origine des fonds afin d'assurer la conformité réglementaire."
                  : "All clients undergo thorough identity verification and due diligence procedures. We collect and verify personal information, beneficial ownership details, and source of funds to ensure regulatory compliance."}
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">
                {isFr ? "Lutte contre le Financement du Terrorisme (LFT)" : "Counter-Terrorist Financing (CTF)"}
              </h3>
              <p className="mb-4 text-brand-grayMed">
                {isFr
                  ? "Nous effectuons le criblage de tous les clients et transactions contre les listes de sanctions internationales et les listes de surveillance afin de prévenir le financement du terrorisme et de nous conformer aux réglementations de sécurité internationales."
                  : "We screen all clients and transactions against international sanctions lists and watchlists to prevent terrorist financing and comply with international security regulations."}
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">
                {isFr ? "Protection des Données" : "Data Protection"}
              </h3>
              <p className="mb-4 text-brand-grayMed">
                {isFr
                  ? "Nous respectons le RGPD et mettons en œuvre des mesures robustes de protection des données afin de préserver vos informations personnelles. Vos données sont traitées de manière licite, transparente et sécurisée."
                  : "We comply with the GDPR and implement robust data protection measures to safeguard your personal information. Your data is processed lawfully, transparently, and securely."}
              </p>

              <h3 className="mt-6 mb-3 text-xl font-semibold text-brand-dark">
                {isFr ? "Protection des Fonds Clients" : "Client Fund Protection"}
              </h3>
              <p className="mb-4 text-brand-grayMed">
                {isFr
                  ? "Les fonds des clients sont détenus sur des comptes ségrégués auprès de partenaires bancaires agréés et sont protégés conformément aux systèmes de garantie des dépôts applicables. Vos fonds sont maintenus séparément des fonds opérationnels de la société."
                  : "Client funds are held in segregated accounts with licensed banking partners and are protected in accordance with applicable deposit guarantee schemes. Your funds are maintained separately from company operational funds."}
              </p>
            </CardContent>
          </Card>

          {/* Licences */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-brand-dark">
                {isFr ? "Licences et Autorisations" : "Licences and Authorisations"}
              </h2>
              <p className="mb-6 text-brand-grayMed">
                {isFr
                  ? "Opulanz détient les licences et autorisations nécessaires pour fournir des services financiers :"
                  : "Opulanz holds the necessary licences and authorisations to provide financial services:"}
              </p>

              <div className="space-y-4">
                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">
                    {isFr ? "Services Bancaires — Luxembourg" : "Banking Services — Luxembourg"}
                  </h3>
                  <p className="mb-2 text-sm text-brand-grayMed">
                    {isFr
                      ? "Agréé et supervisé par la CSSF (Commission de Surveillance du Secteur Financier)"
                      : "Licensed and supervised by the CSSF (Commission de Surveillance du Secteur Financier)"}
                  </p>
                  <p className="text-xs text-brand-grayMed">
                    {isFr
                      ? "Nos activités bancaires luxembourgeoises sont entièrement conformes à la loi bancaire luxembourgeoise et aux directives bancaires européennes."
                      : "Our Luxembourg banking operations are fully compliant with Luxembourg banking law and European banking directives."}
                  </p>
                </div>

                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">
                    {isFr ? "Services Bancaires — France" : "Banking Services — France"}
                  </h3>
                  <p className="mb-2 text-sm text-brand-grayMed">
                    {isFr
                      ? "Agréé et supervisé par l'ACPR (Autorité de Contrôle Prudentiel et de Résolution)"
                      : "Licensed and supervised by the ACPR (Autorité de Contrôle Prudentiel et de Résolution)"}
                  </p>
                  <p className="text-xs text-brand-grayMed">
                    {isFr
                      ? "Nos activités bancaires françaises sont entièrement conformes au droit bancaire français et aux directives bancaires européennes."
                      : "Our French banking operations are fully compliant with French banking law and European banking directives."}
                  </p>
                </div>

                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">
                    {isFr ? "Services d'Investissement — France" : "Investment Services — France"}
                  </h3>
                  <p className="mb-2 text-sm text-brand-grayMed">
                    {isFr
                      ? "Réglementé par l'AMF (Autorité des Marchés Financiers)"
                      : "Regulated by the AMF (Autorité des Marchés Financiers)"}
                  </p>
                  <p className="text-xs text-brand-grayMed">
                    {isFr
                      ? "Nos services de conseil en investissement sont conformes aux réglementations MiFID II et aux exigences de l'AMF."
                      : "Our investment advisory services comply with MiFID II regulations and AMF requirements."}
                  </p>
                </div>

                <div className="rounded-lg border border-brand-grayLight/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-brand-dark">
                    {isFr ? "Services de Paiement" : "Payment Services"}
                  </h3>
                  <p className="mb-2 text-sm text-brand-grayMed">
                    {isFr
                      ? "Autorisé au titre de la DSP2 (Directive sur les Services de Paiement 2)"
                      : "Authorised under PSD2 (Payment Services Directive 2)"}
                  </p>
                  <p className="text-xs text-brand-grayMed">
                    {isFr
                      ? "Nous fournissons des services de paiement sécurisés à travers l'Espace Économique Européen en conformité avec les exigences de la DSP2."
                      : "We provide secure payment services across the European Economic Area in compliance with PSD2 requirements."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <div className="mt-12 rounded-lg bg-brand-off p-8 text-center">
            <h3 className="mb-4 text-xl font-bold text-brand-dark">
              {isFr
                ? "Des Questions sur notre Statut Réglementaire ?"
                : "Questions About Our Regulatory Status?"}
            </h3>
            <p className="mb-6 text-brand-grayMed">
              {isFr
                ? "Pour toute question relative à nos licences, procédures de conformité ou questions réglementaires, veuillez contacter notre équipe de conformité."
                : "For enquiries about our licences, compliance procedures, or regulatory matters, please contact our compliance team."}
            </p>
            <div className="space-y-2 text-sm text-brand-grayMed">
              <p>
                <strong>{isFr ? "E-mail Conformité :" : "Compliance Email:"}</strong>{" "}
                compliance@opulanz.com
              </p>
              <p>
                <strong>{isFr ? "Renseignements Généraux :" : "General Enquiries:"}</strong>{" "}
                +352 20 30 40 50
              </p>
              <p>
                <strong>{isFr ? "Adresse :" : "Address:"}</strong> 1 Avenue de la Liberté,
                L-1931 Luxembourg
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-brand-grayMed">
            {isFr ? "Dernière mise à jour : juin 2025" : "Last updated: June 2025"}
          </p>
        </div>
      </section>
    </>
  );
}
