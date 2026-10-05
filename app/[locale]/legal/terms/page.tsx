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
      title: isFr ? "Conditions Générales d'Utilisation" : "Terms & Conditions",
      subtitle: isFr
        ? "Régissant l'utilisation de la plateforme Opulanz et des services associés"
        : "Governing the use of the Opulanz platform and services provided thereunder",
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
    <p className="text-brand-grayMed mb-8">
      These Terms and Conditions govern the use of the Opulanz platform (www.opulanz.com) and the
      services provided thereunder. By accessing or using the Platform, you agree to be bound by these Terms.
      If you do not agree, please discontinue use immediately.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Identification of Service Providers</h2>
    <p className="text-brand-grayMed mb-4">
      The Opulanz platform is operated by a group of regulated entities, each providing services within its
      specific licensed scope:
    </p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-3">
      <li>
        <strong>Payment account opening &amp; payment intermediation:</strong> Opulanz SIA (Latvia, reg.
        40203750214) acting as introducer, in partnership with licensed EMI partners within the European Union.
      </li>
      <li>
        <strong>Insurance brokerage:</strong> Advensys Insurance-Finance SARL (ORIAS n°21003660, COA since 16/04/2021).
      </li>
      <li>
        <strong>Banking brokerage (COBSP):</strong> Advensys Insurance-Finance SARL (ORIAS n°21003660, COBSP since 16/04/2021).
      </li>
      <li>
        <strong>Investment advisory (CIF):</strong> Advensys Insurance-Finance SARL (ORIAS n°21003660, CIF since 28/05/2021, AMF registered).
      </li>
      <li>
        <strong>Accounting, tax advisory &amp; company formation (combined with accounting mandate):</strong> Groupe Advensys Luxembourg S.A. (RCS Luxembourg B197138, NACE 69.200).
      </li>
      <li>
        <strong>Company formation, standalone (without accounting mandate):</strong> Advensys Insurance-Finance SARL, under its CJA (Conseil Juridique et Administratif) qualification.
      </li>
      <li>
        <strong>Accounting software licences &amp; IT services:</strong> Opulanz SIA (Latvia, reg. 40203750214).
      </li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Eligibility</h2>
    <p className="text-brand-grayMed mb-6">
      Access to the Platform is reserved for legal entities, professionals, investment funds, freelancers, and
      individuals meeting the regulatory eligibility criteria applicable to each service. Clients must be at
      least 18 years of age and legally capable of entering into binding contractual obligations under
      applicable law.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">3. KYC / AML Obligations</h2>
    <p className="text-brand-grayMed mb-4">
      In compliance with Directive (EU) 2015/849, as amended by Directive (EU) 2018/843, and applicable national
      transpositions, all users are required to provide identity documentation and proof of address prior to
      accessing any regulated financial service. The Platform reserves the right to refuse access or suspend
      an account in the event of incomplete or fraudulent documentation.
    </p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Valid government-issued photo identification (passport or national identity card)</li>
      <li>Proof of residential address (utility bill or bank statement dated within 3 months)</li>
      <li>
        For legal entities: certificate of incorporation, beneficial ownership declaration, and proof of
        registered address
      </li>
      <li>Source of funds declaration where required by applicable AML regulations</li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Services &amp; Scope</h2>
    <p className="text-brand-grayMed mb-4">
      The Platform provides access to the following services, each governed by specific service agreements
      entered into at the time of subscription:
    </p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Business and personal payment account opening (via licensed EMI partners)</li>
      <li>Company formation in Luxembourg (with or without accounting mandate; see eligibility per entity)</li>
      <li>Professional accounting and payroll services</li>
      <li>Accounting software licensing and invoice management</li>
      <li>Tax advisory for individuals and legal entities</li>
      <li>Investment advisory services (MiFID II compliant)</li>
      <li>Life insurance and general insurance brokerage</li>
      <li>Special Purpose Vehicle (SPV) structuring and real estate investment advisory (in the future)</li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Fees &amp; Pricing</h2>
    <p className="text-brand-grayMed mb-6">
      Fees applicable to each service are set out in the specific service agreement or pricing schedule
      communicated prior to engagement. The Platform reserves the right to modify its fee schedule with a
      minimum notice period of 30 days, in accordance with PSD2 requirements (Directive 2015/2366/EU)
      for payment-related services.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Account Termination</h2>
    <p className="text-brand-grayMed mb-6">
      Either party may terminate a service agreement by giving written notice. For payment services, a
      minimum notice period of 30 days applies in accordance with PSD2. In the event of breach of these
      Terms, KYC/AML non-compliance, or fraudulent activity, the Platform reserves the right to suspend
      or terminate access without prior notice.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Limitation of Liability</h2>
    <p className="text-brand-grayMed mb-6">
      To the fullest extent permitted by applicable law, Opulanz entities shall not be liable for indirect,
      incidental, special, or consequential damages arising from the use of the Platform. Liability for direct
      damages is limited to the amounts paid by the client for the specific service during the 12 months
      preceding the claim.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Intellectual Property</h2>
    <p className="text-brand-grayMed mb-6">
      All content, software, trademarks, and materials available on the Platform are the exclusive property
      of Groupe Advensys Luxembourg S.A. No licence is granted to reproduce, copy, or distribute any
      content without prior written consent.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Modification of Terms</h2>
    <p className="text-brand-grayMed mb-6">
      These Terms may be modified at any time. For payment services, any modification will be notified to
      clients with a minimum of 30 days' prior notice, as required by PSD2. Continued use of the Platform
      after the effective date constitutes acceptance of the updated Terms.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Governing Law &amp; Jurisdiction</h2>
    <p className="text-brand-grayMed mb-6">
      These Terms are governed by the laws of the Grand Duchy of Luxembourg for services provided by
      Groupe Advensys Luxembourg S.A., and by French law for services provided by Advensys Insurance-Finance
      SARL, and by Latvian law for services provided by Opulanz SIA. Any dispute shall be subject to the
      exclusive jurisdiction of the courts of Luxembourg City or Paris or Riga, respectively, depending on
      the entity concerned.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Complaints Procedure</h2>
    <p className="text-brand-grayMed mb-4">
      Any complaint relating to services provided through the Platform must be submitted in writing to the
      Compliance Department:
    </p>
    <div className="text-brand-grayMed mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1">
      <p><strong>Email:</strong> contact@opulanz.com</p>
      <p>
        <strong>Address:</strong> 66 avenue des Champs-Élysées, 75008 Paris (AIF) /
        49 Duarrefstrooss, L-9964 Huldange (GAL SA) /
        Vīlandes iela 5-36, Rīga, LV-1010, Latvia
      </p>
      <p><strong>Response time:</strong> 15 business days maximum (France, per ACPR requirements)</p>
    </div>
    <p className="text-brand-grayMed mb-6">
      In the event of an unresolved dispute regarding investment advisory services, clients may refer the
      matter to the <strong>Médiateur de l'AMF</strong> (Autorité des Marchés Financiers). For banking
      intermediation disputes, clients may contact <strong>CNPM Médiation Consommation</strong>,
      27 avenue de la Libération, 42400 Saint-Chamond, website: www.cnpm-mediation-consommation.eu,
      email: contact-admin@cnpm-mediation-consommation.eu.
    </p>

    <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
      Last updated: July 2026
    </p>
  </>
);

const frContent = (
  <>
    <p className="text-brand-grayMed mb-8">
      Les présentes Conditions Générales d'Utilisation régissent l'utilisation de la plateforme Opulanz
      (www.opulanz.com) et des services qui y sont proposés. En accédant à la Plateforme ou en l'utilisant,
      vous acceptez d'être lié par les présentes Conditions. Si vous n'acceptez pas, veuillez cesser
      immédiatement toute utilisation.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Identification des Prestataires de Services</h2>
    <p className="text-brand-grayMed mb-4">
      La plateforme Opulanz est exploitée par un groupe d'entités réglementées, chacune fournissant des
      services dans le cadre de son périmètre d'agrément spécifique :
    </p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-3">
      <li>
        <strong>Ouverture de compte de paiement &amp; intermédiation en paiement :</strong> Opulanz SIA
        (Lettonie, n° 40203750214), agissant en qualité d'apporteur d'affaires, en partenariat avec des
        établissements de monnaie électronique (EME) agréés au sein de l'Union européenne.
      </li>
      <li>
        <strong>Courtage en assurance :</strong> Advensys Insurance-Finance SARL (ORIAS n°21003660, COA
        depuis le 16/04/2021).
      </li>
      <li>
        <strong>Courtage en opérations de banque et services de paiement (COBSP) :</strong> Advensys
        Insurance-Finance SARL (ORIAS n°21003660, COBSP depuis le 16/04/2021).
      </li>
      <li>
        <strong>Conseil en investissements financiers (CIF) :</strong> Advensys Insurance-Finance SARL
        (ORIAS n°21003660, CIF depuis le 28/05/2021, enregistré auprès de l'AMF).
      </li>
      <li>
        <strong>Comptabilité, conseil fiscal &amp; création de société (avec mandat comptable) :</strong>{" "}
        Groupe Advensys Luxembourg S.A. (RCS Luxembourg B197138, NACE 69.200).
      </li>
      <li>
        <strong>Création de société, seule (sans mandat comptable) :</strong> Advensys Insurance-Finance
        SARL, au titre de sa qualification de Conseil Juridique et Administratif (CJA).
      </li>
      <li>
        <strong>Licences logicielles de comptabilité &amp; services informatiques :</strong> Opulanz SIA
        (Lettonie, n° 40203750214).
      </li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Éligibilité</h2>
    <p className="text-brand-grayMed mb-6">
      L'accès à la Plateforme est réservé aux personnes morales, aux professionnels, aux fonds
      d'investissement, aux travailleurs indépendants et aux particuliers satisfaisant aux critères
      d'éligibilité réglementaires applicables à chaque service. Les clients doivent être âgés d'au moins
      18 ans et avoir la capacité juridique de contracter des obligations contraignantes en vertu du droit
      applicable.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Obligations KYC / LCB-FT</h2>
    <p className="text-brand-grayMed mb-4">
      Conformément à la Directive (UE) 2015/849, telle que modifiée par la Directive (UE) 2018/843, et à ses
      transpositions nationales applicables, tous les utilisateurs sont tenus de fournir des pièces
      d'identité et un justificatif de domicile avant d'accéder à tout service financier réglementé. La
      Plateforme se réserve le droit de refuser l'accès ou de suspendre un compte en cas de documentation
      incomplète ou frauduleuse.
    </p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Pièce d'identité officielle avec photo en cours de validité (passeport ou carte nationale d'identité)</li>
      <li>Justificatif de domicile (facture de services ou relevé bancaire datant de moins de 3 mois)</li>
      <li>
        Pour les personnes morales : extrait K-bis ou équivalent, déclaration des bénéficiaires effectifs
        et justificatif du siège social
      </li>
      <li>Déclaration d'origine des fonds lorsqu'exigée par la réglementation LCB-FT applicable</li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Services &amp; Périmètre</h2>
    <p className="text-brand-grayMed mb-4">
      La Plateforme donne accès aux services suivants, chacun étant régi par des conventions de service
      spécifiques conclues au moment de la souscription :
    </p>
    <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
      <li>Ouverture de compte de paiement professionnel et personnel (via des partenaires EME agréés)</li>
      <li>Création de société au Luxembourg (avec ou sans mandat comptable ; voir l'éligibilité par entité)</li>
      <li>Services de comptabilité professionnelle et de gestion de la paie</li>
      <li>Licence de logiciel comptable et gestion des factures</li>
      <li>Conseil fiscal pour les particuliers et les personnes morales</li>
      <li>Services de conseil en investissement (conformes à MiFID II)</li>
      <li>Courtage en assurance vie et en assurance générale</li>
      <li>Structuration de Véhicules à But Spécial (SPV) et conseil en investissement immobilier (à venir)</li>
    </ul>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Tarifs &amp; Frais</h2>
    <p className="text-brand-grayMed mb-6">
      Les frais applicables à chaque service sont définis dans la convention de service spécifique ou le
      barème tarifaire communiqué préalablement à l'engagement. La Plateforme se réserve le droit de
      modifier son barème tarifaire moyennant un préavis minimum de 30 jours, conformément aux exigences
      de la DSP2 (Directive 2015/2366/UE) pour les services liés aux paiements.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Résiliation du Compte</h2>
    <p className="text-brand-grayMed mb-6">
      Chaque partie peut résilier une convention de service par notification écrite. Pour les services de
      paiement, un préavis minimum de 30 jours s'applique conformément à la DSP2. En cas de manquement
      aux présentes Conditions, de non-conformité KYC/LCB-FT ou d'activité frauduleuse, la Plateforme se
      réserve le droit de suspendre ou de résilier l'accès sans préavis.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Limitation de Responsabilité</h2>
    <p className="text-brand-grayMed mb-6">
      Dans les limites autorisées par le droit applicable, les entités Opulanz ne pourront être tenues
      responsables des dommages indirects, accessoires, spéciaux ou consécutifs découlant de l'utilisation
      de la Plateforme. La responsabilité pour dommages directs est limitée aux sommes versées par le
      client pour le service concerné au cours des 12 mois précédant la réclamation.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Propriété Intellectuelle</h2>
    <p className="text-brand-grayMed mb-6">
      L'ensemble des contenus, logiciels, marques et matériaux disponibles sur la Plateforme sont la
      propriété exclusive de Groupe Advensys Luxembourg S.A. Aucune licence n'est accordée pour
      reproduire, copier ou distribuer tout contenu sans consentement écrit préalable.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Modification des Conditions</h2>
    <p className="text-brand-grayMed mb-6">
      Les présentes Conditions peuvent être modifiées à tout moment. Pour les services de paiement, toute
      modification sera notifiée aux clients avec un préavis minimum de 30 jours, comme l'exige la DSP2.
      L'utilisation continue de la Plateforme après la date d'entrée en vigueur vaut acceptation des
      Conditions mises à jour.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Droit Applicable &amp; Juridiction Compétente</h2>
    <p className="text-brand-grayMed mb-6">
      Les présentes Conditions sont régies par le droit du Grand-Duché de Luxembourg pour les services
      fournis par Groupe Advensys Luxembourg S.A., par le droit français pour les services fournis par
      Advensys Insurance-Finance SARL, et par le droit letton pour les services fournis par Opulanz SIA.
      Tout litige relève de la compétence exclusive des tribunaux de Luxembourg-Ville, de Paris ou de
      Riga, respectivement, selon l'entité concernée.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Procédure de Réclamation</h2>
    <p className="text-brand-grayMed mb-4">
      Toute réclamation relative aux services fournis via la Plateforme doit être adressée par écrit au
      Département Conformité :
    </p>
    <div className="text-brand-grayMed mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1">
      <p><strong>Email :</strong> contact@opulanz.com</p>
      <p>
        <strong>Adresse :</strong> 66 avenue des Champs-Élysées, 75008 Paris (AIF) /
        49 Duarrefstrooss, L-9964 Huldange (GAL SA) /
        Vīlandes iela 5-36, Rīga, LV-1010, Lettonie
      </p>
      <p><strong>Délai de réponse :</strong> 15 jours ouvrés maximum (France, conformément aux exigences de l'ACPR)</p>
    </div>
    <p className="text-brand-grayMed mb-6">
      En cas de litige non résolu relatif aux services de conseil en investissement, les clients peuvent
      saisir le <strong>Médiateur de l'AMF</strong> (Autorité des Marchés Financiers). Pour les litiges
      relatifs à l'intermédiation bancaire, les clients peuvent contacter <strong>CNPM Médiation
      Consommation</strong>, 27 avenue de la Libération, 42400 Saint-Chamond, site :
      www.cnpm-mediation-consommation.eu, courriel : contact-admin@cnpm-mediation-consommation.eu.
    </p>

    <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
      Dernière mise à jour : juillet 2026
    </p>
  </>
);
