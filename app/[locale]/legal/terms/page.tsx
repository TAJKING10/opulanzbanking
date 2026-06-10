"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  const locale = useLocale();
  const isFr = locale === "fr";

  const content = {
    hero: {
      title: isFr ? "Informations Légales" : "Legal Information",
      subtitle: isFr ? "Conditions Générales d'Utilisation" : "Terms and Conditions",
    },
    sections: isFr ? frContent : enContent,
  };

  return (
    <>
      <Hero title={content.hero.title} subtitle={content.hero.subtitle} />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              {content.sections}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

const enContent = (
  <>
    <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Company Identification</h2>
    <div className="text-brand-grayMed mb-6 space-y-2">
      <p><strong>Company Name:</strong> Opulanz S.A.</p>
      <p><strong>Registered Address:</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
      <p><strong>Email:</strong> legal@opulanz.com</p>
      <p><strong>Phone:</strong> +352 20 30 40 50</p>
      <p><strong>Website:</strong> www.opulanz.com</p>
      <p><strong>Regulatory Authority (Luxembourg):</strong> Commission de Surveillance du Secteur Financier (CSSF)</p>
      <p><strong>Regulatory Authority (France):</strong> Autorité de Contrôle Prudentiel et de Résolution (ACPR) and Autorité des Marchés Financiers (AMF)</p>
    </div>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Acceptance of Terms</h2>
    <p className="text-brand-grayMed mb-4">
      By accessing and using the Opulanz platform (the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms in their entirety, you must immediately cease using the Platform.
    </p>
    <p className="text-brand-grayMed mb-6">
      These Terms constitute a legally binding agreement between you ("User", "Client") and Opulanz S.A. ("Opulanz", "we", "us", "our"). We reserve the right to amend these Terms at any time. Continued use of the Platform following notification of any changes constitutes your acceptance of the revised Terms.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Services Provided</h2>
    <p className="text-brand-grayMed mb-4">Opulanz provides the following financial services through its Platform:</p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Personal and business account opening and management</li>
      <li>Payment and money transfer services (SEPA, SWIFT, international transfers)</li>
      <li>Investment advisory services</li>
      <li>Insurance brokerage and intermediation</li>
      <li>Company formation and corporate services</li>
      <li>Tax advisory and accounting services</li>
      <li>Wealth management and financial planning</li>
    </ul>
    <p className="text-brand-grayMed mb-6">
      The availability of specific services may vary depending on your country of residence and applicable regulatory requirements.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Eligibility</h2>
    <p className="text-brand-grayMed mb-4">To use the Opulanz Platform, you must:</p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Be at least 18 years of age</li>
      <li>Have the legal capacity to enter into binding contracts</li>
      <li>Not be a resident of a jurisdiction where the use of our services is prohibited</li>
      <li>Successfully complete our identity verification (KYC) process</li>
      <li>Not be listed on any applicable sanctions list or watchlist</li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Account Registration and Security</h2>
    <p className="text-brand-grayMed mb-4">
      You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorised use of your account or any security breach. Opulanz will not be liable for any loss arising from your failure to keep your credentials secure.
    </p>
    <p className="text-brand-grayMed mb-6">
      You agree to provide accurate, current, and complete information during registration and to keep this information updated. Providing false or misleading information may result in immediate account suspension and potential legal action.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Know Your Customer (KYC) and Anti-Money Laundering (AML)</h2>
    <p className="text-brand-grayMed mb-4">
      In compliance with applicable anti-money laundering and counter-terrorist financing regulations, including the EU Anti-Money Laundering Directives (AMLD5/6), Opulanz is required to verify the identity of all clients and to monitor transactions.
    </p>
    <p className="text-brand-grayMed mb-6">
      You agree to provide all documentation requested for identity verification and due diligence purposes. We reserve the right to refuse, suspend, or terminate services if we are unable to complete satisfactory KYC checks or if we detect suspicious activity.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Fees and Charges</h2>
    <p className="text-brand-grayMed mb-6">
      Our fee schedule is available on the Platform and is subject to change with prior notice. Fees will be clearly communicated before any transaction is executed. You authorise Opulanz to deduct applicable fees directly from your account balance.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Prohibited Uses</h2>
    <p className="text-brand-grayMed mb-4">You agree not to use the Platform for:</p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Any unlawful, fraudulent, or deceptive activity</li>
      <li>Money laundering, terrorist financing, or sanctions evasion</li>
      <li>Transactions involving prohibited goods or services</li>
      <li>Circumventing any technical or security measures</li>
      <li>Any activity that violates applicable laws or regulations</li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Intellectual Property</h2>
    <p className="text-brand-grayMed mb-6">
      All content, trademarks, logos, and intellectual property on the Platform are the exclusive property of Opulanz S.A. or its licensors. You may not reproduce, distribute, or create derivative works from any content on the Platform without our express written consent.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Limitation of Liability</h2>
    <p className="text-brand-grayMed mb-6">
      To the maximum extent permitted by applicable law, Opulanz shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform. Our total aggregate liability shall not exceed the fees paid by you to Opulanz in the twelve (12) months preceding the event giving rise to the claim.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Governing Law and Dispute Resolution</h2>
    <p className="text-brand-grayMed mb-6">
      These Terms are governed by the laws of the Grand Duchy of Luxembourg. Any dispute arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Luxembourg City, without prejudice to your right as a consumer to seek recourse before the courts of your country of residence.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Contact</h2>
    <div className="text-brand-grayMed mb-6 space-y-2">
      <p><strong>Legal Enquiries:</strong> legal@opulanz.com</p>
      <p><strong>General Support:</strong> contact@opulanz.com</p>
      <p><strong>Phone:</strong> +352 20 30 40 50</p>
      <p><strong>Address:</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
    </div>

    <div className="mt-8 p-4 bg-brand-goldLight/20 rounded-lg">
      <p className="text-sm text-brand-grayMed italic">
        These Terms and Conditions are provided for informational purposes. Please ensure you have read and understood them fully before using our services.
      </p>
    </div>

    <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
      Last updated: June 2025
    </p>
  </>
);

const frContent = (
  <>
    <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Identification de la Société</h2>
    <div className="text-brand-grayMed mb-6 space-y-2">
      <p><strong>Raison Sociale :</strong> Opulanz S.A.</p>
      <p><strong>Adresse du Siège Social :</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
      <p><strong>E-mail :</strong> legal@opulanz.com</p>
      <p><strong>Téléphone :</strong> +352 20 30 40 50</p>
      <p><strong>Site Web :</strong> www.opulanz.com</p>
      <p><strong>Autorité de Régulation (Luxembourg) :</strong> Commission de Surveillance du Secteur Financier (CSSF)</p>
      <p><strong>Autorité de Régulation (France) :</strong> Autorité de Contrôle Prudentiel et de Résolution (ACPR) et Autorité des Marchés Financiers (AMF)</p>
    </div>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Acceptation des Conditions</h2>
    <p className="text-brand-grayMed mb-4">
      En accédant à la plateforme Opulanz (la « Plateforme ») et en l'utilisant, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (les « Conditions »). Si vous n'acceptez pas l'intégralité des présentes Conditions, vous devez immédiatement cesser d'utiliser la Plateforme.
    </p>
    <p className="text-brand-grayMed mb-6">
      Les présentes Conditions constituent un accord juridiquement contraignant entre vous (l'« Utilisateur », le « Client ») et Opulanz S.A. (« Opulanz », « nous », « notre »). Nous nous réservons le droit de modifier ces Conditions à tout moment. L'utilisation continue de la Plateforme après notification de toute modification constitue votre acceptation des Conditions révisées.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Services Proposés</h2>
    <p className="text-brand-grayMed mb-4">Opulanz fournit les services financiers suivants via sa Plateforme :</p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Ouverture et gestion de comptes personnels et professionnels</li>
      <li>Services de paiement et de transfert d'argent (SEPA, SWIFT, virements internationaux)</li>
      <li>Services de conseil en investissement</li>
      <li>Courtage et intermédiation en assurance</li>
      <li>Services de création d'entreprise et services aux sociétés</li>
      <li>Conseil fiscal et comptable</li>
      <li>Gestion de patrimoine et planification financière</li>
    </ul>
    <p className="text-brand-grayMed mb-6">
      La disponibilité de services spécifiques peut varier selon votre pays de résidence et les exigences réglementaires applicables.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Conditions d'Éligibilité</h2>
    <p className="text-brand-grayMed mb-4">Pour utiliser la Plateforme Opulanz, vous devez :</p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Être âgé d'au moins 18 ans</li>
      <li>Avoir la capacité juridique de conclure des contrats contraignants</li>
      <li>Ne pas résider dans une juridiction où l'utilisation de nos services est interdite</li>
      <li>Réussir notre processus de vérification d'identité (KYC)</li>
      <li>Ne figurer sur aucune liste de sanctions ou de surveillance applicable</li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Inscription au Compte et Sécurité</h2>
    <p className="text-brand-grayMed mb-4">
      Vous êtes responsable du maintien de la confidentialité de vos identifiants de compte. Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte ou de toute violation de la sécurité. Opulanz ne pourra être tenu responsable de toute perte résultant de votre manquement à protéger vos identifiants.
    </p>
    <p className="text-brand-grayMed mb-6">
      Vous vous engagez à fournir des informations exactes, actuelles et complètes lors de votre inscription et à les tenir à jour. La fourniture d'informations fausses ou trompeuses peut entraîner la suspension immédiate du compte et d'éventuelles poursuites judiciaires.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Connaissance du Client (KYC) et Lutte contre le Blanchiment d'Argent (LCB)</h2>
    <p className="text-brand-grayMed mb-4">
      Conformément aux réglementations applicables en matière de lutte contre le blanchiment de capitaux et le financement du terrorisme, notamment les Directives européennes anti-blanchiment (LCB/FT 5e et 6e directive), Opulanz est tenu de vérifier l'identité de tous ses clients et de surveiller les transactions.
    </p>
    <p className="text-brand-grayMed mb-6">
      Vous acceptez de fournir tous les documents demandés à des fins de vérification d'identité et de diligence raisonnable. Nous nous réservons le droit de refuser, suspendre ou résilier les services si nous ne sommes pas en mesure d'effectuer des vérifications KYC satisfaisantes ou si nous détectons une activité suspecte.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Frais et Commissions</h2>
    <p className="text-brand-grayMed mb-6">
      Notre grille tarifaire est disponible sur la Plateforme et est susceptible d'évoluer avec un préavis approprié. Les frais vous seront clairement communiqués avant l'exécution de toute transaction. Vous autorisez Opulanz à prélever les frais applicables directement sur le solde de votre compte.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Utilisations Interdites</h2>
    <p className="text-brand-grayMed mb-4">Vous vous engagez à ne pas utiliser la Plateforme pour :</p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Toute activité illégale, frauduleuse ou trompeuse</li>
      <li>Le blanchiment d'argent, le financement du terrorisme ou la contournement des sanctions</li>
      <li>Des transactions impliquant des biens ou services interdits</li>
      <li>Le contournement de toute mesure technique ou de sécurité</li>
      <li>Toute activité violant les lois ou réglementations applicables</li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Propriété Intellectuelle</h2>
    <p className="text-brand-grayMed mb-6">
      Tous les contenus, marques, logos et propriétés intellectuelles présents sur la Plateforme sont la propriété exclusive d'Opulanz S.A. ou de ses concédants de licence. Vous ne pouvez reproduire, distribuer ou créer des œuvres dérivées à partir de tout contenu de la Plateforme sans notre consentement écrit exprès.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Limitation de Responsabilité</h2>
    <p className="text-brand-grayMed mb-6">
      Dans les limites permises par la loi applicable, Opulanz ne pourra être tenu responsable de tout dommage indirect, accessoire, consécutif ou punitif découlant de votre utilisation de la Plateforme. Notre responsabilité totale cumulée ne pourra excéder les frais que vous nous avez versés au cours des douze (12) mois précédant l'événement à l'origine de la réclamation.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Droit Applicable et Résolution des Litiges</h2>
    <p className="text-brand-grayMed mb-6">
      Les présentes Conditions sont régies par le droit du Grand-Duché de Luxembourg. Tout litige découlant des présentes Conditions ou en rapport avec celles-ci sera soumis à la compétence exclusive des tribunaux de Luxembourg-Ville, sans préjudice de votre droit, en tant que consommateur, de saisir les juridictions de votre pays de résidence.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Contact</h2>
    <div className="text-brand-grayMed mb-6 space-y-2">
      <p><strong>Questions Juridiques :</strong> legal@opulanz.com</p>
      <p><strong>Support Général :</strong> contact@opulanz.com</p>
      <p><strong>Téléphone :</strong> +352 20 30 40 50</p>
      <p><strong>Adresse :</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
    </div>

    <div className="mt-8 p-4 bg-brand-goldLight/20 rounded-lg">
      <p className="text-sm text-brand-grayMed italic">
        Les présentes Conditions Générales d'Utilisation sont fournies à titre informatif. Veuillez vous assurer de les avoir lues et comprises dans leur intégralité avant d'utiliser nos services.
      </p>
    </div>

    <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
      Dernière mise à jour : juin 2025
    </p>
  </>
);
