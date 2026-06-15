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
        subtitle={isFr ? "Protection des Données et Conformité RGPD" : "Data Protection and GDPR Compliance"}
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
      <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Introduction</h2>
      <p className="text-brand-grayMed mb-6">
        Opulanz S.A. ("Opulanz", "we", "us", "our") is committed to protecting your personal data and respecting your privacy rights in accordance with Regulation (EU) 2016/679 — the General Data Protection Regulation ("GDPR") — and any applicable national data protection legislation.
      </p>
      <p className="text-brand-grayMed mb-6">
        This Privacy Policy explains how we collect, use, store, and share your personal data when you use our platform and services. Please read it carefully.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Data Controller</h2>
      <p className="text-brand-grayMed mb-4">
        The data controller responsible for your personal data is:
      </p>
      <div className="text-brand-grayMed mb-6 space-y-2">
        <p><strong>Company:</strong> Opulanz S.A.</p>
        <p><strong>Address:</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
        <p><strong>Email:</strong> privacy@opulanz.com</p>
        <p><strong>Phone:</strong> +352 20 30 40 50</p>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Data We Collect</h2>
      <p className="text-brand-grayMed mb-4">Depending on the services you use, we may collect the following categories of personal data:</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-4 space-y-2">
        <li><strong>Identity Data:</strong> First name, last name, date of birth, nationality, gender, government-issued identification documents</li>
        <li><strong>Contact Data:</strong> Email address, postal address, telephone number</li>
        <li><strong>Financial Data:</strong> Bank account details, transaction history, source of funds, income information</li>
        <li><strong>KYC / Due Diligence Data:</strong> Identity verification documents, proof of address, beneficial ownership information, politically exposed person (PEP) status</li>
        <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies and usage data</li>
        <li><strong>Communications Data:</strong> Records of your communications with our support and compliance teams</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Legal Basis for Processing</h2>
      <p className="text-brand-grayMed mb-4">We process your personal data on the following legal bases:</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>Contractual Necessity (Art. 6(1)(b) GDPR):</strong> To perform the contract for the provision of our financial services</li>
        <li><strong>Legal Obligation (Art. 6(1)(c) GDPR):</strong> To comply with anti-money laundering (AML), know-your-customer (KYC), tax, and other financial regulations</li>
        <li><strong>Legitimate Interests (Art. 6(1)(f) GDPR):</strong> To improve our services, detect fraud, and ensure platform security</li>
        <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> For marketing communications and cookies where required</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Purposes of Processing</h2>
      <p className="text-brand-grayMed mb-4">We use your personal data for the following purposes:</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li>Opening and managing your account</li>
        <li>Processing payments and financial transactions</li>
        <li>Conducting identity verification and ongoing due diligence</li>
        <li>Complying with AML, CTF, and sanctions screening obligations</li>
        <li>Providing customer support</li>
        <li>Detecting, preventing, and investigating fraud and financial crime</li>
        <li>Improving and personalising our Platform and services</li>
        <li>Sending service-related communications</li>
        <li>Marketing communications (where you have given consent)</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Data Sharing and Recipients</h2>
      <p className="text-brand-grayMed mb-4">We may share your personal data with the following categories of recipients:</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>Regulatory and Supervisory Authorities:</strong> CSSF (Luxembourg), ACPR, AMF (France), and other competent authorities as required by law</li>
        <li><strong>KYC / Identity Verification Providers:</strong> Third-party providers used to verify your identity</li>
        <li><strong>Payment Partners:</strong> Licensed payment institutions and banking partners required to execute transactions</li>
        <li><strong>IT Service Providers:</strong> Cloud hosting, security, and infrastructure providers under strict data processing agreements</li>
        <li><strong>Legal and Compliance Advisors:</strong> Where necessary to protect our legal rights or comply with obligations</li>
      </ul>
      <p className="text-brand-grayMed mb-6">
        We do not sell your personal data to third parties. All third-party processors are bound by contractual obligations consistent with GDPR requirements.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">7. International Data Transfers</h2>
      <p className="text-brand-grayMed mb-6">
        Where we transfer personal data outside the European Economic Area (EEA), we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission, or transfers to countries with an adequate level of data protection as determined by the European Commission.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Data Retention</h2>
      <p className="text-brand-grayMed mb-4">We retain your personal data only for as long as necessary for the purposes for which it was collected:</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>Active Account Data:</strong> For the duration of your relationship with us</li>
        <li><strong>KYC and Transaction Records:</strong> Minimum of 5 years following the end of the business relationship, as required by AML regulations</li>
        <li><strong>Technical and Log Data:</strong> Up to 12 months</li>
        <li><strong>Marketing Preferences:</strong> Until you withdraw consent or object</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Your Rights</h2>
      <p className="text-brand-grayMed mb-4">Under the GDPR, you have the following rights:</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>Right of Access (Art. 15):</strong> Request a copy of the personal data we hold about you</li>
        <li><strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate or incomplete data</li>
        <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your data, subject to legal retention obligations</li>
        <li><strong>Right to Restriction of Processing (Art. 18):</strong> Request that we limit processing of your data in certain circumstances</li>
        <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format</li>
        <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests or for direct marketing</li>
        <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing</li>
      </ul>
      <p className="text-brand-grayMed mb-6">
        To exercise any of these rights, please contact us at privacy@opulanz.com. We will respond within 30 days. You also have the right to lodge a complaint with the CSSF (Luxembourg) or the CNIL (France) if you believe your data is being processed unlawfully.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Cookies and Tracking Technologies</h2>
      <p className="text-brand-grayMed mb-6">
        We use cookies and similar tracking technologies to improve the functionality and performance of our Platform, analyse usage, and personalise your experience. You can manage your cookie preferences through our cookie consent banner or your browser settings. Disabling certain cookies may affect the functionality of the Platform.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Data Security</h2>
      <p className="text-brand-grayMed mb-6">
        We implement robust technical and organisational security measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These include encryption, access controls, regular security audits, and staff training. In the event of a personal data breach affecting your rights and freedoms, we will notify the relevant supervisory authority and, where required, you as the data subject.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Updates to This Policy</h2>
      <p className="text-brand-grayMed mb-6">
        We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of material changes via the Platform or by email. The date of the most recent revision is indicated below.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">13. Contact for Data Protection</h2>
      <div className="text-brand-grayMed mb-6 space-y-2">
        <p><strong>Data Protection Officer (DPO):</strong> dpo@opulanz.com</p>
        <p><strong>General Privacy Enquiries:</strong> privacy@opulanz.com</p>
        <p><strong>Address:</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
        <p><strong>Phone:</strong> +352 20 30 40 50</p>
      </div>

      <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
        Last updated: June 2025
      </p>
    </>
  );
}

function FrContent() {
  return (
    <>
      <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Introduction</h2>
      <p className="text-brand-grayMed mb-6">
        Opulanz S.A. (« Opulanz », « nous », « notre ») s'engage à protéger vos données personnelles et à respecter vos droits en matière de protection de la vie privée, conformément au Règlement (UE) 2016/679 — le Règlement Général sur la Protection des Données (« RGPD ») — et à toute législation nationale applicable en matière de protection des données.
      </p>
      <p className="text-brand-grayMed mb-6">
        La présente Politique de Confidentialité explique comment nous collectons, utilisons, conservons et partageons vos données personnelles lorsque vous utilisez notre plateforme et nos services. Veuillez la lire attentivement.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Responsable du Traitement</h2>
      <p className="text-brand-grayMed mb-4">
        Le responsable du traitement de vos données personnelles est :
      </p>
      <div className="text-brand-grayMed mb-6 space-y-2">
        <p><strong>Société :</strong> Opulanz S.A.</p>
        <p><strong>Adresse :</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
        <p><strong>E-mail :</strong> privacy@opulanz.com</p>
        <p><strong>Téléphone :</strong> +352 20 30 40 50</p>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Données Collectées</h2>
      <p className="text-brand-grayMed mb-4">Selon les services que vous utilisez, nous pouvons collecter les catégories de données personnelles suivantes :</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-4 space-y-2">
        <li><strong>Données d'Identité :</strong> Prénom, nom, date de naissance, nationalité, genre, documents d'identité délivrés par les autorités</li>
        <li><strong>Données de Contact :</strong> Adresse e-mail, adresse postale, numéro de téléphone</li>
        <li><strong>Données Financières :</strong> Coordonnées bancaires, historique des transactions, origine des fonds, informations sur les revenus</li>
        <li><strong>Données KYC / Diligence Raisonnable :</strong> Documents de vérification d'identité, justificatif de domicile, informations sur les bénéficiaires effectifs, statut de personne politiquement exposée (PPE)</li>
        <li><strong>Données Techniques :</strong> Adresse IP, type de navigateur, informations sur l'appareil, cookies et données d'utilisation</li>
        <li><strong>Données de Communications :</strong> Enregistrements de vos échanges avec nos équipes de support et de conformité</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Base Juridique du Traitement</h2>
      <p className="text-brand-grayMed mb-4">Nous traitons vos données personnelles sur les bases juridiques suivantes :</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>Nécessité Contractuelle (Art. 6(1)(b) RGPD) :</strong> Pour exécuter le contrat de fourniture de nos services financiers</li>
        <li><strong>Obligation Légale (Art. 6(1)(c) RGPD) :</strong> Pour respecter les réglementations LCB-FT, KYC, fiscales et autres obligations financières</li>
        <li><strong>Intérêts Légitimes (Art. 6(1)(f) RGPD) :</strong> Pour améliorer nos services, détecter les fraudes et assurer la sécurité de la plateforme</li>
        <li><strong>Consentement (Art. 6(1)(a) RGPD) :</strong> Pour les communications marketing et les cookies lorsque cela est requis</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Finalités du Traitement</h2>
      <p className="text-brand-grayMed mb-4">Nous utilisons vos données personnelles aux fins suivantes :</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li>Ouverture et gestion de votre compte</li>
        <li>Traitement des paiements et transactions financières</li>
        <li>Vérification d'identité et diligence raisonnable continue</li>
        <li>Respect des obligations LCB, CTF et de criblage des sanctions</li>
        <li>Fourniture d'un service client</li>
        <li>Détection, prévention et investigation de la fraude et des crimes financiers</li>
        <li>Amélioration et personnalisation de notre Plateforme et services</li>
        <li>Envoi de communications liées aux services</li>
        <li>Communications marketing (sous réserve de votre consentement)</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Partage des Données et Destinataires</h2>
      <p className="text-brand-grayMed mb-4">Nous pouvons partager vos données personnelles avec les catégories de destinataires suivantes :</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>Autorités de Régulation et de Supervision :</strong> CSSF (Luxembourg), ACPR, AMF (France) et autres autorités compétentes conformément à la loi</li>
        <li><strong>Prestataires KYC / Vérification d'Identité :</strong> Tiers utilisés pour vérifier votre identité</li>
        <li><strong>Partenaires de Paiement :</strong> Établissements de paiement agréés et partenaires bancaires nécessaires à l'exécution des transactions</li>
        <li><strong>Prestataires de Services Informatiques :</strong> Hébergement cloud, sécurité et infrastructure dans le cadre d'accords de traitement stricts</li>
        <li><strong>Conseillers Juridiques et de Conformité :</strong> Si nécessaire pour protéger nos droits légaux ou respecter nos obligations</li>
      </ul>
      <p className="text-brand-grayMed mb-6">
        Nous ne vendons pas vos données personnelles à des tiers. Tous les sous-traitants sont liés par des obligations contractuelles conformes aux exigences du RGPD.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Transferts Internationaux de Données</h2>
      <p className="text-brand-grayMed mb-6">
        Lorsque nous transférons des données personnelles en dehors de l'Espace Économique Européen (EEE), nous veillons à ce que des garanties appropriées soient en place, telles que les Clauses Contractuelles Types (CCT) approuvées par la Commission européenne, ou des transferts vers des pays bénéficiant d'un niveau de protection adéquat reconnu par la Commission européenne.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Durée de Conservation des Données</h2>
      <p className="text-brand-grayMed mb-4">Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>Données de Compte Actif :</strong> Pendant toute la durée de votre relation avec nous</li>
        <li><strong>Dossiers KYC et Transactions :</strong> Minimum de 5 ans après la fin de la relation d'affaires, conformément aux réglementations LCB-FT</li>
        <li><strong>Données Techniques et Journaux :</strong> Jusqu'à 12 mois</li>
        <li><strong>Préférences Marketing :</strong> Jusqu'au retrait de votre consentement ou à votre opposition</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Vos Droits</h2>
      <p className="text-brand-grayMed mb-4">En vertu du RGPD, vous disposez des droits suivants :</p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li><strong>Droit d'Accès (Art. 15) :</strong> Demander une copie des données personnelles que nous détenons à votre sujet</li>
        <li><strong>Droit de Rectification (Art. 16) :</strong> Demander la correction de données inexactes ou incomplètes</li>
        <li><strong>Droit à l'Effacement (Art. 17) :</strong> Demander la suppression de vos données, sous réserve des obligations légales de conservation</li>
        <li><strong>Droit à la Limitation du Traitement (Art. 18) :</strong> Demander que nous limitions le traitement de vos données dans certaines circonstances</li>
        <li><strong>Droit à la Portabilité des Données (Art. 20) :</strong> Recevoir vos données dans un format structuré et lisible par machine</li>
        <li><strong>Droit d'Opposition (Art. 21) :</strong> Vous opposer au traitement fondé sur des intérêts légitimes ou à des fins de prospection directe</li>
        <li><strong>Droit de Retrait du Consentement :</strong> Retirer votre consentement à tout moment lorsque le traitement est fondé sur celui-ci, sans affecter la licéité du traitement antérieur</li>
      </ul>
      <p className="text-brand-grayMed mb-6">
        Pour exercer l'un de ces droits, veuillez nous contacter à privacy@opulanz.com. Nous répondrons dans un délai de 30 jours. Vous avez également le droit de déposer une réclamation auprès de la CSSF (Luxembourg) ou de la CNIL (France) si vous estimez que vos données sont traitées de manière illicite.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Cookies et Technologies de Suivi</h2>
      <p className="text-brand-grayMed mb-6">
        Nous utilisons des cookies et des technologies de suivi similaires pour améliorer les fonctionnalités et les performances de notre Plateforme, analyser l'utilisation et personnaliser votre expérience. Vous pouvez gérer vos préférences en matière de cookies via notre bandeau de consentement ou les paramètres de votre navigateur. La désactivation de certains cookies peut affecter le fonctionnement de la Plateforme.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Sécurité des Données</h2>
      <p className="text-brand-grayMed mb-6">
        Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles robustes pour protéger vos données personnelles contre tout accès non autorisé, toute modification, divulgation ou destruction. Ces mesures comprennent le chiffrement, les contrôles d'accès, des audits de sécurité réguliers et la formation du personnel. En cas de violation de données personnelles affectant vos droits et libertés, nous en informerons l'autorité de contrôle compétente et, si nécessaire, vous en tant que personne concernée.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Mises à Jour de la Présente Politique</h2>
      <p className="text-brand-grayMed mb-6">
        Nous pouvons mettre à jour la présente Politique de Confidentialité pour refléter des modifications de nos pratiques ou de la législation applicable. Nous vous informerons des changements importants via la Plateforme ou par e-mail. La date de la dernière révision est indiquée ci-dessous.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">13. Contact pour la Protection des Données</h2>
      <div className="text-brand-grayMed mb-6 space-y-2">
        <p><strong>Délégué à la Protection des Données (DPO) :</strong> dpo@opulanz.com</p>
        <p><strong>Questions Générales sur la Confidentialité :</strong> privacy@opulanz.com</p>
        <p><strong>Adresse :</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
        <p><strong>Téléphone :</strong> +352 20 30 40 50</p>
      </div>

      <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
        Dernière mise à jour : juin 2025
      </p>
    </>
  );
}
