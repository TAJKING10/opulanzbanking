"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  const locale = useLocale();
  const isFr = locale === "fr";

  return (
    <>
      <Hero
        title={isFr ? "Politique de Confidentialité" : "Privacy Policy"}
        subtitle={
          isFr
            ? "Protection des données personnelles — Conformité RGPD"
            : "Personal Data Protection — GDPR Compliance"
        }
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              {isFr ? <FrContent /> : <EnContent />}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function EnContent() {
  return (
    <>
      <p className="text-brand-grayMed mb-8">
        This Privacy Policy describes how Opulanz entities collect, use, store, and protect your
        personal data in compliance with Regulation (EU) 2016/679 (GDPR) and applicable national laws.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Data Controllers</h2>
      <p className="text-brand-grayMed mb-4">
        Depending on the service used, the data controller is:
      </p>

      <div className="space-y-4 mb-6">
        <div className="pl-4 border-l-2 border-brand-gold/40">
          <p className="font-semibold text-brand-dark">Advensys Insurance-Finance SARL</p>
          <p className="text-brand-grayMed text-sm">
            For all services related to account opening, insurance, investment advisory, and company
            formation — 66 avenue des Champs-Élysées, 75008 Paris —{" "}
            contact@advensys-in-finance.com
          </p>
        </div>
        <div className="pl-4 border-l-2 border-brand-gold/40">
          <p className="font-semibold text-brand-dark">Groupe Advensys Luxembourg S.A.</p>
          <p className="text-brand-grayMed text-sm">
            For accounting, tax advisory, and company formation with accounting mandate — 49 Duarrefstrooss, L-9964 Huldange, Luxembourg — contact@advensys-conseil.lu
          </p>
        </div>
        <div className="pl-4 border-l-2 border-brand-gold/40">
          <p className="font-semibold text-brand-dark">Opulanz SIA</p>
          <p className="text-brand-grayMed text-sm">
            For all services related to account opening — For software licences and IT services —
            Vīlandes iela 5-36, LV-1010 Riga, Latvia — contact@opulanz.com
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Data Protection Officer (DPO)</h2>
      <p className="text-brand-grayMed mb-4">
        Given the nature of financial data processed, a DPO has been designated:
      </p>
      <div className="pl-4 border-l-2 border-brand-gold/40 text-brand-grayMed mb-6 space-y-1">
        <p><strong>DPO Contact:</strong> contact@opulanz.com — Subject: &apos;DPO / Personal Data&apos;</p>
        <p><strong>Address:</strong> 66 avenue des Champs-Élysées, 75008 Paris, France</p>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Data Collected &amp; Legal Basis</h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm text-brand-grayMed border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Data Category</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Data Points</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Legal Basis (GDPR Art. 6)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Identity data</td>
              <td className="p-3 border border-gray-200">Name, date of birth, nationality, government ID</td>
              <td className="p-3 border border-gray-200">Legal obligation (AML/KYC — Directive 2015/849)</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="p-3 border border-gray-200 font-medium">Contact data</td>
              <td className="p-3 border border-gray-200">Email, phone, postal address</td>
              <td className="p-3 border border-gray-200">Contract performance &amp; legitimate interest</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Financial data</td>
              <td className="p-3 border border-gray-200">Bank account details, source of funds, transaction history</td>
              <td className="p-3 border border-gray-200">Legal obligation (PSD2, AML) &amp; contract performance</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="p-3 border border-gray-200 font-medium">Professional data</td>
              <td className="p-3 border border-gray-200">Company name, RCS/registration number, UBO information</td>
              <td className="p-3 border border-gray-200">Legal obligation (KYC for legal entities)</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Navigation data</td>
              <td className="p-3 border border-gray-200">IP address, cookies, pages visited</td>
              <td className="p-3 border border-gray-200">Legitimate interest (analytics — Google Analytics) — 1 year retention</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="p-3 border border-gray-200 font-medium">Communication data</td>
              <td className="p-3 border border-gray-200">Emails, support tickets, chat history</td>
              <td className="p-3 border border-gray-200">Legitimate interest &amp; contract performance</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Data Retention Periods</h2>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>KYC/AML identity documents:</strong> 5 years after end of business relationship (AML legal obligation)</li>
        <li><strong>Financial transaction records:</strong> 5 years (AML legal obligation)</li>
        <li><strong>Accounting documents:</strong> 10 years (Luxembourg accounting law / French commercial code)</li>
        <li><strong>Navigation and analytics data:</strong> 1 year</li>
        <li><strong>Support communications:</strong> 3 years</li>
        <li><strong>Investment advisory records:</strong> 5 years (MiFID II — Article 72)</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Data Transfers Outside the EU</h2>
      <p className="text-brand-grayMed mb-6">
        Personal data is processed exclusively within the European Economic Area (EEA). No transfer
        outside the EEA takes place without appropriate safeguards (Standard Contractual Clauses or
        adequacy decision) in accordance with GDPR Chapter V.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Your Rights</h2>
      <p className="text-brand-grayMed mb-4">Under the GDPR, you have the following rights:</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-4 space-y-2">
        <li><strong>Right of access (Art. 15):</strong> You may request a copy of all personal data held about you.</li>
        <li><strong>Right to rectification (Art. 16):</strong> You may request correction of inaccurate personal data.</li>
        <li><strong>Right to erasure (Art. 17):</strong> You may request deletion of your data, subject to legal retention obligations.</li>
        <li><strong>Right to restriction (Art. 18):</strong> You may request that processing be restricted in certain circumstances.</li>
        <li><strong>Right to data portability (Art. 20):</strong> You may request your data in a structured, machine-readable format.</li>
        <li><strong>Right to object (Art. 21):</strong> You may object to processing based on legitimate interest.</li>
        <li><strong>Right to withdraw consent (Art. 7):</strong> Where processing is based on consent, you may withdraw it at any time.</li>
      </ul>
      <p className="text-brand-grayMed mb-6">
        To exercise any of the above rights, please contact:{" "}
        <strong>contact@opulanz.com</strong>. You also have the right to lodge a complaint with the
        competent supervisory authority:{" "}
        <strong>CNIL (France)</strong> — www.cnil.fr — or{" "}
        <strong>CNPD (Luxembourg)</strong> — www.cnpd.lu.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Cookies</h2>
      <p className="text-brand-grayMed mb-6">
        The Platform uses cookies for navigation, analytics (Google Analytics), and security purposes.
        Upon first visit, your consent is requested for non-essential cookies. You may manage your
        cookie preferences at any time via the cookie settings panel.
      </p>

      <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
        Last updated: July 2026
      </p>
    </>
  );
}

function FrContent() {
  return (
    <>
      <p className="text-brand-grayMed mb-8">
        La présente Politique de Confidentialité décrit comment les entités Opulanz collectent,
        utilisent, conservent et protègent vos données personnelles, conformément au Règlement (UE)
        2016/679 (RGPD) et aux lois nationales applicables.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Responsables du Traitement</h2>
      <p className="text-brand-grayMed mb-4">
        Selon le service utilisé, le responsable du traitement est :
      </p>

      <div className="space-y-4 mb-6">
        <div className="pl-4 border-l-2 border-brand-gold/40">
          <p className="font-semibold text-brand-dark">Advensys Insurance-Finance SARL</p>
          <p className="text-brand-grayMed text-sm">
            Pour tous les services liés à l'ouverture de compte, à l'assurance, au conseil en
            investissement et à la création de société — 66 avenue des Champs-Élysées, 75008 Paris —
            contact@advensys-in-finance.com
          </p>
        </div>
        <div className="pl-4 border-l-2 border-brand-gold/40">
          <p className="font-semibold text-brand-dark">Groupe Advensys Luxembourg S.A.</p>
          <p className="text-brand-grayMed text-sm">
            Pour la comptabilité, le conseil fiscal et la création de société avec mandat comptable — 49 Duarrefstrooss, L-9964 Huldange, Luxembourg — contact@advensys-conseil.lu
          </p>
        </div>
        <div className="pl-4 border-l-2 border-brand-gold/40">
          <p className="font-semibold text-brand-dark">Opulanz SIA</p>
          <p className="text-brand-grayMed text-sm">
            Pour tous les services liés à l'ouverture de compte — Pour les licences logicielles et
            services informatiques — Vīlandes iela 5-36, LV-1010 Riga, Lettonie — contact@opulanz.com
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Délégué à la Protection des Données (DPO)</h2>
      <p className="text-brand-grayMed mb-4">
        Compte tenu de la nature des données financières traitées, un DPO a été désigné :
      </p>
      <div className="pl-4 border-l-2 border-brand-gold/40 text-brand-grayMed mb-6 space-y-1">
        <p><strong>Contact DPO :</strong> contact@opulanz.com — Objet : &apos;DPO / Données personnelles&apos;</p>
        <p><strong>Adresse :</strong> 66 avenue des Champs-Élysées, 75008 Paris, France</p>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Données Collectées &amp; Base Juridique</h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm text-brand-grayMed border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Catégorie de données</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Données collectées</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Base juridique (Art. 6 RGPD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Données d'identité</td>
              <td className="p-3 border border-gray-200">Nom, date de naissance, nationalité, pièce d'identité officielle</td>
              <td className="p-3 border border-gray-200">Obligation légale (LCB-FT/KYC — Directive 2015/849)</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="p-3 border border-gray-200 font-medium">Données de contact</td>
              <td className="p-3 border border-gray-200">Email, téléphone, adresse postale</td>
              <td className="p-3 border border-gray-200">Exécution du contrat &amp; intérêt légitime</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Données financières</td>
              <td className="p-3 border border-gray-200">Coordonnées bancaires, origine des fonds, historique des transactions</td>
              <td className="p-3 border border-gray-200">Obligation légale (DSP2, LCB-FT) &amp; exécution du contrat</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="p-3 border border-gray-200 font-medium">Données professionnelles</td>
              <td className="p-3 border border-gray-200">Raison sociale, n° RCS/immatriculation, informations sur les bénéficiaires effectifs</td>
              <td className="p-3 border border-gray-200">Obligation légale (KYC pour personnes morales)</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Données de navigation</td>
              <td className="p-3 border border-gray-200">Adresse IP, cookies, pages consultées</td>
              <td className="p-3 border border-gray-200">Intérêt légitime (analytics — Google Analytics) — conservation 1 an</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="p-3 border border-gray-200 font-medium">Données de communication</td>
              <td className="p-3 border border-gray-200">Emails, tickets support, historique des chats</td>
              <td className="p-3 border border-gray-200">Intérêt légitime &amp; exécution du contrat</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Durées de Conservation</h2>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>Documents KYC/LCB-FT :</strong> 5 ans après la fin de la relation commerciale (obligation légale LCB-FT)</li>
        <li><strong>Enregistrements des transactions financières :</strong> 5 ans (obligation légale LCB-FT)</li>
        <li><strong>Documents comptables :</strong> 10 ans (droit comptable luxembourgeois / code de commerce français)</li>
        <li><strong>Données de navigation et analytics :</strong> 1 an</li>
        <li><strong>Communications support :</strong> 3 ans</li>
        <li><strong>Dossiers de conseil en investissement :</strong> 5 ans (MiFID II — Article 72)</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Transferts de Données Hors UE</h2>
      <p className="text-brand-grayMed mb-6">
        Les données personnelles sont traitées exclusivement au sein de l'Espace Économique Européen
        (EEE). Aucun transfert hors de l'EEE n'a lieu sans garanties appropriées (Clauses
        Contractuelles Types ou décision d'adéquation) conformément au Chapitre V du RGPD.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Vos Droits</h2>
      <p className="text-brand-grayMed mb-4">En vertu du RGPD, vous disposez des droits suivants :</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-4 space-y-2">
        <li><strong>Droit d'accès (Art. 15) :</strong> Vous pouvez demander une copie de toutes les données personnelles vous concernant.</li>
        <li><strong>Droit de rectification (Art. 16) :</strong> Vous pouvez demander la correction de données personnelles inexactes.</li>
        <li><strong>Droit à l'effacement (Art. 17) :</strong> Vous pouvez demander la suppression de vos données, sous réserve des obligations légales de conservation.</li>
        <li><strong>Droit à la limitation (Art. 18) :</strong> Vous pouvez demander que le traitement soit limité dans certaines circonstances.</li>
        <li><strong>Droit à la portabilité (Art. 20) :</strong> Vous pouvez demander vos données dans un format structuré et lisible par machine.</li>
        <li><strong>Droit d'opposition (Art. 21) :</strong> Vous pouvez vous opposer au traitement fondé sur l'intérêt légitime.</li>
        <li><strong>Droit de retrait du consentement (Art. 7) :</strong> Lorsque le traitement est fondé sur le consentement, vous pouvez le retirer à tout moment.</li>
      </ul>
      <p className="text-brand-grayMed mb-6">
        Pour exercer l'un de ces droits, veuillez contacter :{" "}
        <strong>contact@opulanz.com</strong>. Vous avez également le droit d'introduire une réclamation
        auprès de l'autorité de contrôle compétente :{" "}
        <strong>CNIL (France)</strong> — www.cnil.fr — ou{" "}
        <strong>CNPD (Luxembourg)</strong> — www.cnpd.lu.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Cookies</h2>
      <p className="text-brand-grayMed mb-6">
        La Plateforme utilise des cookies à des fins de navigation, d'analytique (Google Analytics) et
        de sécurité. Lors de la première visite, votre consentement est demandé pour les cookies
        non essentiels. Vous pouvez gérer vos préférences en matière de cookies à tout moment via le
        panneau de gestion des cookies.
      </p>

      <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
        Dernière mise à jour : juillet 2026
      </p>
    </>
  );
}
