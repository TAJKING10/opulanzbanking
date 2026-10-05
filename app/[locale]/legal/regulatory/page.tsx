"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";

export default function RegulatoryPage() {
  const locale = useLocale();
  const isFr = locale === "fr";

  return (
    <>
      <Hero
        title={isFr ? "Informations Réglementaires" : "Regulatory Information"}
        subtitle={
          isFr
            ? "Identité réglementaire complète de toutes les entités du groupe Opulanz"
            : "Full regulatory identity of all entities contributing to the Opulanz platform"
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
        This page sets out the full regulatory identity of all entities contributing to the Opulanz
        platform, their respective licences, agréments, and the services each is authorised to provide.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Group Structure Overview</h2>
      <p className="text-brand-grayMed mb-4">
        The Opulanz platform is operated by a group of independent but coordinated regulated
        entities, each contributing specific licensed activities:
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li>
          <strong>Groupe Advensys Luxembourg S.A. (Luxembourg):</strong> RCS licensed; accounting,
          tax advisory, company formation with accounting mandate
        </li>
        <li>
          <strong>Advensys Insurance-Finance SARL (France):</strong> ORIAS regulated; CIF, COBSP, COA, CJA
        </li>
        <li>
          <strong>Opulanz SIA (Latvia):</strong> Commercial entity; software licences, IT services,
          banking introductions
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        2. Groupe Advensys Luxembourg S.A.: Full Regulatory Profile
      </h2>
      <div className="mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1 text-brand-grayMed text-sm">
        <p><strong>Company name:</strong> Groupe Advensys Luxembourg S.A.</p>
        <p><strong>Trade names:</strong> Advensys Conseil · Location Rolls Royce · Opulanz Group</p>
        <p><strong>Legal form:</strong> Société anonyme (SA)</p>
        <p><strong>RCS Luxembourg:</strong> B197138</p>
        <p><strong>Share capital:</strong> EUR 31,000, fixed, fully paid up</p>
        <p><strong>NACE code:</strong> 69.200, Accounting activities</p>
        <p><strong>Registered office:</strong> 49 Duarrefstrooss, L-9964 Huldange, Grand Duchy of Luxembourg</p>
        <p><strong>Incorporation date:</strong> 12/05/2015</p>
        <p><strong>Sole director:</strong> DULBERG Irvin Regnard, sole signatory authority</p>
        <p><strong>Director mandate:</strong> Appointed 23/11/2020, expires 23/11/2026</p>
        <p><strong>Statutory auditor:</strong> Advensys Conseil LTD (Companies House UK n°07464304)</p>
        <p><strong>Email:</strong> contact@advensys-conseil.lu</p>
        <p><strong>Phone:</strong> +352 28 79 76 26</p>
      </div>

      <p className="text-brand-grayMed mb-3 text-sm font-semibold">
        Services authorised for Groupe Advensys Luxembourg S.A. on the Opulanz platform:
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-3 space-y-1 text-sm">
        <li>Professional accounting and payroll services</li>
        <li>Tax advisory for individuals and legal entities (persons physiques et morales)</li>
        <li>Company formation in Luxembourg, only when coupled with an accounting mandate</li>
        <li>Business creation consulting and operational support</li>
      </ul>
      <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-brand-grayMed">
        <strong>Important:</strong> Groupe Advensys Luxembourg S.A. may NOT provide company
        formation services as a standalone service (without an accounting mandate). Standalone
        company formation must be processed through Advensys Insurance-Finance SARL under its CJA
        qualification.
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        3. Advensys Insurance-Finance SARL: Full Regulatory Profile
      </h2>
      <div className="mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1 text-brand-grayMed text-sm">
        <p><strong>Company name:</strong> Advensys Insurance-Finance SARL</p>
        <p><strong>Trade name:</strong> AIF</p>
        <p><strong>RCS Paris:</strong> 895 111 292</p>
        <p><strong>SIRET:</strong> 895 111 292 00010</p>
        <p><strong>EUID:</strong> FR7501.895111292</p>
        <p><strong>VAT (intracommunautaire):</strong> FR50895111292</p>
        <p><strong>Share capital:</strong> EUR 20,000</p>
        <p><strong>Registered office:</strong> 66 avenue des Champs-Élysées, 75008 Paris, France</p>
        <p><strong>Phone:</strong> +33 6 98 21 44 46</p>
        <p><strong>Email:</strong> contact@advensys-in-finance.com</p>
        <p><strong>APE:</strong> 6622Z, Autres activités auxiliaires d&apos;assurance et de retraite</p>
        <p><strong>ORIAS n°:</strong> 21003660</p>
        <p>
          <strong>ORIAS link:</strong>{" "}
          <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-brand-goldDark">
            www.orias.fr
          </a>{" "}
          (public register, verifiable online)
        </p>
      </div>

      <p className="text-brand-grayMed mb-3 text-sm italic">
        Licences and authorisations confirmed by ORIAS attestation dated 17/02/2026:
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm text-brand-grayMed border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Qualification</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Since</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Valid Until</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Regulator</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-gray-200">CIF: Conseiller en Investissements Financiers</td>
              <td className="p-3 border border-gray-200">28/05/2021</td>
              <td className="p-3 border border-gray-200">28/02/2027</td>
              <td className="p-3 border border-gray-200">AMF / ORIAS</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="p-3 border border-gray-200">COBSP: Courtier en Opérations de Banque et Services de Paiement</td>
              <td className="p-3 border border-gray-200">16/04/2021</td>
              <td className="p-3 border border-gray-200">28/02/2027</td>
              <td className="p-3 border border-gray-200">ACPR / ORIAS</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200">COA: Courtier d&apos;Assurance ou de Réassurance</td>
              <td className="p-3 border border-gray-200">16/04/2021</td>
              <td className="p-3 border border-gray-200">28/02/2027</td>
              <td className="p-3 border border-gray-200">ACPR / ORIAS</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-brand-grayMed mb-3 text-sm font-semibold">
        Services authorised for Advensys Insurance-Finance SARL on the Opulanz platform:
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-1 text-sm">
        <li>Banking account opening intermediation (COBSP)</li>
        <li>Insurance brokerage, life insurance and general insurance products (COA)</li>
        <li>Investment advisory services, MiFID II compliant (CIF)</li>
        <li>Company formation, standalone (CJA qualification)</li>
        <li>Legal and administrative advisory (CJA qualification)</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        4. Opulanz SIA: Full Regulatory Profile
      </h2>
      <div className="mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1 text-brand-grayMed text-sm">
        <p><strong>Company name:</strong> Opulanz SIA</p>
        <p><strong>Legal form:</strong> Sabiedrība ar ierobežotu atbildību (SIA), Latvian LLC</p>
        <p><strong>Registration number:</strong> 40203750214</p>
        <p><strong>Registration date:</strong> 27/05/2026</p>
        <p><strong>Share capital:</strong> EUR 3,000, fully paid up</p>
        <p><strong>Registered office:</strong> Vīlandes iela 5-36, Rīga, LV-1010, Republic of Latvia</p>
        <p><strong>SEPA identifier:</strong> LV44ZZZ40203750214</p>
        <p><strong>Sole shareholder:</strong> DULBERG Irvin Regnard</p>
        <p><strong>Board member:</strong> DULBERG Irvin Regnard, sole right of representation</p>
        <p><strong>Email:</strong> contact@opulanz.com</p>
      </div>

      <p className="text-brand-grayMed mb-3 text-sm font-semibold">
        Services provided by Opulanz SIA on the Opulanz platform:
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-3 space-y-1 text-sm">
        <li>IT services and platform development</li>
        <li>
          Banking account opening introductions (acting as introducer to licensed EU EMI partners,
          not as a licensed EMI itself)
        </li>
      </ul>
      <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-brand-grayMed">
        <strong>Important:</strong> Opulanz SIA does not hold an EMI licence, payment institution
        licence, or any financial services licence. Banking and payment services are provided
        exclusively through licensed EMI partners operating within the EU regulatory framework under
        introduction contract.
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Complaints &amp; Dispute Resolution</h2>
      <p className="text-brand-grayMed mb-3">
        All complaints must be submitted in writing to the Compliance Department:
      </p>
      <div className="mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1 text-brand-grayMed text-sm">
        <p><strong>Email:</strong> contact@opulanz.com</p>
        <p><strong>Subject line:</strong> &apos;COMPLAINT: [Service Name] / [Your Name]&apos;</p>
        <p><strong>Response time (France):</strong> 15 business days maximum (ACPR requirement)</p>
        <p><strong>Response time (Luxembourg):</strong> 30 calendar days maximum</p>
      </div>
      <p className="text-brand-grayMed mb-3 text-sm font-semibold">
        External dispute resolution, if not resolved internally about Advensys Insurance-Finance SARL:
      </p>
      <div className="mb-6 pl-4 border-l-2 border-brand-gold/40 text-brand-grayMed text-sm space-y-1">
        <p>
          <strong>CNPM - MÉDIATION-CONSOMMATION</strong>
        </p>
        <p>27 avenue de la Libération, 42400 Saint-Chamond</p>
        <p>Tél : 04 77 42 10 58</p>
        <p>Courriel : contact-admin@cnpm-mediation-consommation.eu</p>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Regulatory Notices</h2>
      <p className="text-brand-grayMed mb-3">
        The following regulatory information applies to all services:
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-3 text-sm">
        <li>
          Advensys Insurance-Finance SARL is registered with the ORIAS (Organisme pour le Registre
          des Intermédiaires en Assurance), verifiable at{" "}
          <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-brand-goldDark">
            www.orias.fr
          </a>{" "}
          using n°21003660.
        </li>
        <li>
          Advensys Insurance-Finance SARL acts under the prudential supervision of the ACPR
          (Autorité de Contrôle Prudentiel et de Résolution) for insurance and banking
          intermediation.
        </li>
        <li>
          Investment advisory services provided by Advensys Insurance-Finance SARL are conducted
          under the supervision of the AMF (Autorité des Marchés Financiers) in its capacity as CIF.
        </li>
        <li>
          Groupe Advensys Luxembourg S.A. operates under Luxembourg law and is registered with the
          Luxembourg Business Registers (LBR), verifiable at{" "}
          <a href="https://www.lbr.lu" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-brand-goldDark">
            www.lbr.lu
          </a>{" "}
          using RCS B197138 and accounting and business licence under Ministry of Economy of Luxembourg.
        </li>
        <li>
          Opulanz SIA is registered with the Latvian Commercial Register, verifiable at{" "}
          <a href="https://www.ur.gov.lv" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-brand-goldDark">
            www.ur.gov.lv
          </a>.
        </li>
      </ul>

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
        La présente page expose l&apos;identité réglementaire complète de toutes les entités
        contribuant à la plateforme Opulanz, leurs licences et agréments respectifs, ainsi que les
        services que chacune est autorisée à fournir.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Présentation de la Structure du Groupe</h2>
      <p className="text-brand-grayMed mb-4">
        La plateforme Opulanz est exploitée par un groupe d&apos;entités réglementées indépendantes
        mais coordonnées, chacune apportant des activités spécifiques sous licence :
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li>
          <strong>Groupe Advensys Luxembourg S.A. (Luxembourg) :</strong> Enregistrée au RCS ;
          comptabilité, conseil fiscal, création de société avec mandat comptable
        </li>
        <li>
          <strong>Advensys Insurance-Finance SARL (France) :</strong> Réglementée par l&apos;ORIAS ; CIF, COBSP, COA, CJA
        </li>
        <li>
          <strong>Opulanz SIA (Lettonie) :</strong> Entité commerciale ; licences logicielles,
          services informatiques, apport d&apos;affaires bancaires
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        2. Groupe Advensys Luxembourg S.A. : Profil Réglementaire Complet
      </h2>
      <div className="mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1 text-brand-grayMed text-sm">
        <p><strong>Dénomination sociale :</strong> Groupe Advensys Luxembourg S.A.</p>
        <p><strong>Enseignes commerciales :</strong> Advensys Conseil · Location Rolls Royce · Opulanz Group</p>
        <p><strong>Forme juridique :</strong> Société anonyme (SA)</p>
        <p><strong>RCS Luxembourg :</strong> B197138</p>
        <p><strong>Capital social :</strong> 31 000 EUR, fixe, entièrement libéré</p>
        <p><strong>Code NACE :</strong> 69.200, Activités comptables</p>
        <p><strong>Siège social :</strong> 49 Duarrefstrooss, L-9964 Huldange, Grand-Duché de Luxembourg</p>
        <p><strong>Date de constitution :</strong> 12/05/2015</p>
        <p><strong>Administrateur unique :</strong> DULBERG Irvin Regnard, pouvoir de signature unique</p>
        <p><strong>Mandat administrateur :</strong> Nommé le 23/11/2020, expire le 23/11/2026</p>
        <p><strong>Commissaire aux comptes :</strong> Advensys Conseil LTD (Companies House UK n°07464304)</p>
        <p><strong>Email :</strong> contact@advensys-conseil.lu</p>
        <p><strong>Téléphone :</strong> +352 28 79 76 26</p>
      </div>

      <p className="text-brand-grayMed mb-3 text-sm font-semibold">
        Services autorisés pour Groupe Advensys Luxembourg S.A. sur la plateforme Opulanz :
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-3 space-y-1 text-sm">
        <li>Services de comptabilité professionnelle et de gestion de la paie</li>
        <li>Conseil fiscal pour les personnes physiques et morales</li>
        <li>Création de société au Luxembourg, uniquement couplée à un mandat comptable</li>
        <li>Conseil à la création d&apos;entreprise et accompagnement opérationnel</li>
      </ul>
      <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-brand-grayMed">
        <strong>Important :</strong> Groupe Advensys Luxembourg S.A. ne peut PAS fournir de
        services de création de société en prestation autonome (sans mandat comptable). La création
        de société en autonome doit impérativement être traitée par Advensys Insurance-Finance SARL
        au titre de sa qualification CJA.
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        3. Advensys Insurance-Finance SARL : Profil Réglementaire Complet
      </h2>
      <div className="mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1 text-brand-grayMed text-sm">
        <p><strong>Dénomination sociale :</strong> Advensys Insurance-Finance SARL</p>
        <p><strong>Sigle :</strong> AIF</p>
        <p><strong>RCS Paris :</strong> 895 111 292</p>
        <p><strong>SIRET :</strong> 895 111 292 00010</p>
        <p><strong>EUID :</strong> FR7501.895111292</p>
        <p><strong>TVA intracommunautaire :</strong> FR50895111292</p>
        <p><strong>Capital social :</strong> 20 000 EUR</p>
        <p><strong>Siège social :</strong> 66 avenue des Champs-Élysées, 75008 Paris, France</p>
        <p><strong>Téléphone :</strong> +33 6 98 21 44 46</p>
        <p><strong>Email :</strong> contact@advensys-in-finance.com</p>
        <p><strong>APE :</strong> 6622Z, Autres activités auxiliaires d&apos;assurance et de retraite</p>
        <p><strong>ORIAS n° :</strong> 21003660</p>
        <p>
          <strong>Lien ORIAS :</strong>{" "}
          <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-brand-goldDark">
            www.orias.fr
          </a>{" "}
          (registre public consultable en ligne)
        </p>
      </div>

      <p className="text-brand-grayMed mb-3 text-sm italic">
        Licences et autorisations confirmées par l&apos;attestation ORIAS du 17/02/2026 :
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm text-brand-grayMed border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Qualification</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Depuis</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Valable jusqu&apos;au</th>
              <th className="text-left p-3 border border-gray-200 font-semibold text-brand-dark">Régulateur</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-gray-200">CIF: Conseiller en Investissements Financiers</td>
              <td className="p-3 border border-gray-200">28/05/2021</td>
              <td className="p-3 border border-gray-200">28/02/2027</td>
              <td className="p-3 border border-gray-200">AMF / ORIAS</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="p-3 border border-gray-200">COBSP: Courtier en Opérations de Banque et Services de Paiement</td>
              <td className="p-3 border border-gray-200">16/04/2021</td>
              <td className="p-3 border border-gray-200">28/02/2027</td>
              <td className="p-3 border border-gray-200">ACPR / ORIAS</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200">COA: Courtier d&apos;Assurance ou de Réassurance</td>
              <td className="p-3 border border-gray-200">16/04/2021</td>
              <td className="p-3 border border-gray-200">28/02/2027</td>
              <td className="p-3 border border-gray-200">ACPR / ORIAS</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-brand-grayMed mb-3 text-sm font-semibold">
        Services autorisés pour Advensys Insurance-Finance SARL sur la plateforme Opulanz :
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-1 text-sm">
        <li>Intermédiation à l&apos;ouverture de compte bancaire (COBSP)</li>
        <li>Courtage en assurance, assurance vie et produits d&apos;assurance générale (COA)</li>
        <li>Services de conseil en investissement, conformes MiFID II (CIF)</li>
        <li>Création de société, en autonome (qualification CJA)</li>
        <li>Conseil juridique et administratif (qualification CJA)</li>
      </ul>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        4. Opulanz SIA : Profil Réglementaire Complet
      </h2>
      <div className="mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1 text-brand-grayMed text-sm">
        <p><strong>Dénomination sociale :</strong> Opulanz SIA</p>
        <p><strong>Forme juridique :</strong> Sabiedrība ar ierobežotu atbildību (SIA), SARL lettone</p>
        <p><strong>Numéro d&apos;enregistrement :</strong> 40203750214</p>
        <p><strong>Date d&apos;enregistrement :</strong> 27/05/2026</p>
        <p><strong>Capital social :</strong> 3 000 EUR, intégralement libéré</p>
        <p><strong>Siège social :</strong> Vīlandes iela 5-36, Rīga, LV-1010, République de Lettonie</p>
        <p><strong>Identifiant SEPA :</strong> LV44ZZZ40203750214</p>
        <p><strong>Actionnaire unique :</strong> DULBERG Irvin Regnard</p>
        <p><strong>Membre du Conseil :</strong> DULBERG Irvin Regnard, droit de représentation unique</p>
        <p><strong>Email :</strong> contact@opulanz.com</p>
      </div>

      <p className="text-brand-grayMed mb-3 text-sm font-semibold">
        Services fournis par Opulanz SIA sur la plateforme Opulanz :
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-3 space-y-1 text-sm">
        <li>Services informatiques et développement de la plateforme</li>
        <li>
          Apport d&apos;affaires pour l&apos;ouverture de comptes bancaires (agissant en qualité
          d&apos;apporteur auprès de partenaires EME agréés au sein de l&apos;UE, et non en tant
          qu&apos;EME agréé lui-même)
        </li>
      </ul>
      <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-brand-grayMed">
        <strong>Important :</strong> Opulanz SIA ne détient pas d&apos;agrément EME, de licence
        d&apos;établissement de paiement ni d&apos;aucune licence de services financiers. Les
        services bancaires et de paiement sont fournis exclusivement par des partenaires EME agréés
        opérant dans le cadre réglementaire de l&apos;UE, sur la base d&apos;un contrat
        d&apos;apport d&apos;affaires.
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Réclamations &amp; Résolution des Litiges</h2>
      <p className="text-brand-grayMed mb-3">
        Toute réclamation doit être adressée par écrit au Département Conformité :
      </p>
      <div className="mb-4 pl-4 border-l-2 border-brand-gold/40 space-y-1 text-brand-grayMed text-sm">
        <p><strong>Email :</strong> contact@opulanz.com</p>
        <p><strong>Objet :</strong> &apos;RÉCLAMATION : [Nom du service] / [Votre nom]&apos;</p>
        <p><strong>Délai de réponse (France) :</strong> 15 jours ouvrés maximum (exigence ACPR)</p>
        <p><strong>Délai de réponse (Luxembourg) :</strong> 30 jours calendaires maximum</p>
      </div>
      <p className="text-brand-grayMed mb-3 text-sm font-semibold">
        Résolution externe des litiges, en cas de non-résolution interne concernant Advensys Insurance-Finance SARL :
      </p>
      <div className="mb-6 pl-4 border-l-2 border-brand-gold/40 text-brand-grayMed text-sm space-y-1">
        <p>
          <strong>CNPM - MÉDIATION-CONSOMMATION</strong>
        </p>
        <p>27 avenue de la Libération, 42400 Saint-Chamond</p>
        <p>Tél : 04 77 42 10 58</p>
        <p>Courriel : contact-admin@cnpm-mediation-consommation.eu</p>
      </div>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Mentions Réglementaires</h2>
      <p className="text-brand-grayMed mb-3">
        Les informations réglementaires suivantes s&apos;appliquent à l&apos;ensemble des services :
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-3 text-sm">
        <li>
          Advensys Insurance-Finance SARL est immatriculée auprès de l&apos;ORIAS (Organisme pour
          le Registre des Intermédiaires en Assurance), vérification sur{" "}
          <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-brand-goldDark">
            www.orias.fr
          </a>{" "}
          sous le n°21003660.
        </li>
        <li>
          Advensys Insurance-Finance SARL exerce sous la supervision prudentielle de l&apos;ACPR
          (Autorité de Contrôle Prudentiel et de Résolution) pour l&apos;intermédiation en
          assurance et en banque.
        </li>
        <li>
          Les services de conseil en investissement fournis par Advensys Insurance-Finance SARL sont
          conduits sous la supervision de l&apos;AMF (Autorité des Marchés Financiers) en sa
          qualité de CIF.
        </li>
        <li>
          Groupe Advensys Luxembourg S.A. opère sous le droit luxembourgeois et est enregistrée
          auprès du Luxembourg Business Registers (LBR), vérification sur{" "}
          <a href="https://www.lbr.lu" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-brand-goldDark">
            www.lbr.lu
          </a>{" "}
          sous le numéro RCS B197138, avec agrément comptable et commercial délivré par le
          Ministère de l&apos;Économie du Luxembourg.
        </li>
        <li>
          Opulanz SIA est enregistrée auprès du Registre du Commerce letton, vérification sur{" "}
          <a href="https://www.ur.gov.lv" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-brand-goldDark">
            www.ur.gov.lv
          </a>.
        </li>
      </ul>

      <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
        Dernière mise à jour : juillet 2026
      </p>
    </>
  );
}
