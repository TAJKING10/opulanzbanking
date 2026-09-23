"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";

export default function MentionsLegalesPage() {
  const locale = useLocale();
  const isFr = locale === "fr";

  const content = {
    hero: {
      title: isFr ? "Mentions Légales" : "Legal Notice",
      subtitle: isFr
        ? "Conformément à la loi n°2004-575 du 21 juin 2004 (LCEN)"
        : "In accordance with French Law n°2004-575 of June 21, 2004 (LCEN)",
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
    <div className="mb-6 p-4 bg-brand-goldLight/20 rounded-lg border border-brand-gold/20">
      <p className="text-sm text-brand-grayMed italic">
        In accordance with Article 6-III of French Law n°2004-575 of June 21, 2004 on confidence in
        the digital economy (LCEN), the following legal notices are mandatory for any commercial
        website operated in France. Any omission may result in a fine of up to EUR 375,000.
      </p>
    </div>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Website Publisher</h2>

    <h3 className="text-lg font-semibold text-brand-dark mb-3">
      ADVENSYS INSURANCE-FINANCE — Principal Publisher (France)
    </h3>
    <div className="text-brand-grayMed mb-6 space-y-1 pl-4 border-l-2 border-brand-gold/40">
      <p><strong>Company Name:</strong> Advensys Insurance-Finance SARL</p>
      <p><strong>Trade Name:</strong> AIF</p>
      <p><strong>Legal Form:</strong> Société à responsabilité limitée (SARL)</p>
      <p><strong>Share Capital:</strong> EUR 20,000</p>
      <p><strong>Registered Office:</strong> 66 avenue des Champs-Élysées, 75008 Paris, France</p>
      <p><strong>SIRET:</strong> 895 111 292 00010</p>
      <p><strong>RCS:</strong> Paris 895 111 292</p>
      <p><strong>EUID:</strong> FR7501.895111292</p>
      <p><strong>APE / NAF:</strong> 6622Z — Other auxiliary activities of insurance and pension funding</p>
      <p><strong>VAT Number:</strong> FR50895111292</p>
      <p><strong>Trade Name:</strong> Opulanz</p>
      <p><strong>Publication Director:</strong> Manager — Advensys Insurance-Finance SARL</p>
      <p><strong>Phone:</strong> +33 6 98 21 44 46</p>
      <p><strong>Email:</strong> contact@advensys-in-finance.com</p>
    </div>

    <h3 className="text-lg font-semibold text-brand-dark mb-3">
      GROUPE ADVENSYS LUXEMBOURG S.A. — Operational Entity (Luxembourg)
    </h3>
    <div className="text-brand-grayMed mb-6 space-y-1 pl-4 border-l-2 border-brand-gold/40">
      <p><strong>Company Name:</strong> Groupe Advensys Luxembourg S.A.</p>
      <p><strong>Trade Names:</strong> Advensys Conseil · Location Rolls Royce · Opulanz Group</p>
      <p><strong>Legal Form:</strong> Société anonyme (SA)</p>
      <p><strong>Share Capital:</strong> EUR 31,000</p>
      <p><strong>Registered Office:</strong> 34, Grand-rue, L-9710 Clervaux, Grand Duchy of Luxembourg</p>
      <p><strong>RCS Luxembourg:</strong> B197138</p>
      <p><strong>NACE Code:</strong> 69.200 — Accounting activities</p>
      <p><strong>Incorporation Date:</strong> 12/05/2015</p>
      <p><strong>Sole Director:</strong> DULBERG Irvin Regnard</p>
      <p><strong>Email:</strong> contact@advensys-conseil.lu</p>
      <p><strong>Phone:</strong> +352 28 79 76 26</p>
    </div>

    <h3 className="text-lg font-semibold text-brand-dark mb-3">
      OPULANZ SIA — Operational Entity (Latvia)
    </h3>
    <div className="text-brand-grayMed mb-6 space-y-1 pl-4 border-l-2 border-brand-gold/40">
      <p><strong>Company Name:</strong> Opulanz SIA</p>
      <p><strong>Legal Form:</strong> Société à responsabilité limitée (SIA)</p>
      <p><strong>Share Capital:</strong> EUR 3,000</p>
      <p><strong>Registered Office:</strong> Vīlandes iela 5-36, Rīga, LV-1010, Latvia</p>
      <p><strong>Registration Number:</strong> 40203750214</p>
      <p><strong>Registration Date:</strong> 27/05/2026</p>
      <p><strong>SEPA Identifier:</strong> LV44ZZZ40203750214</p>
      <p><strong>Sole Shareholder:</strong> DULBERG Irvin Regnard</p>
      <p><strong>Email:</strong> contact@opulanz.com</p>
      <p><strong>Phone:</strong> +371 20 682 842</p>
    </div>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Hosting</h2>
    <div className="text-brand-grayMed mb-6 space-y-1 pl-4 border-l-2 border-brand-gold/40">
      <p>The website www.opulanz.com is hosted by:</p>
      <p><strong>Primary Host:</strong> Microsoft Azure — European Data Centers (EU)</p>
      <p><strong>Secondary Host (France):</strong> OVH SAS — 2 rue Kellermann, 59100 Roubaix, France — SIRET: 424 761 419 00045</p>
    </div>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Intellectual Property</h2>
    <p className="text-brand-grayMed mb-6">
      The "Opulanz" trademark and logo are the exclusive property of Groupe Advensys Luxembourg S.A.
      Any unauthorised reproduction, representation or use is strictly prohibited and constitutes
      an infringement punishable under Articles L.335-2 et seq. of the French Intellectual Property Code.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Liability</h2>
    <p className="text-brand-grayMed mb-6">
      The information published on this website is provided for informational purposes only.
      Advensys Insurance-Finance SARL disclaims all liability for any direct or indirect damages
      resulting from the use of the website or the inability to access it.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Applicable Law</h2>
    <p className="text-brand-grayMed mb-6">
      These legal notices are governed by Luxembourg law. Any dispute relating to their
      interpretation or execution falls under the exclusive jurisdiction of the courts of Luxembourg.
    </p>

    <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
      Last updated: July 2026
    </p>
  </>
);

const frContent = (
  <>
    <div className="mb-6 p-4 bg-brand-goldLight/20 rounded-lg border border-brand-gold/20">
      <p className="text-sm text-brand-grayMed italic">
        Conformément à l'article 6-III de la loi n°2004-575 du 21 juin 2004 pour la confiance dans
        l'économie numérique (LCEN), les présentes mentions légales sont obligatoires pour tout site
        commercial exploité en France. Toute omission est passible d'une amende jusqu'à 375,000 EUR.
      </p>
    </div>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Éditeur du Site</h2>

    <h3 className="text-lg font-semibold text-brand-dark mb-3">
      ADVENSYS INSURANCE-FINANCE — Éditeur principal (France)
    </h3>
    <div className="text-brand-grayMed mb-6 space-y-1 pl-4 border-l-2 border-brand-gold/40">
      <p><strong>Dénomination sociale :</strong> Advensys Insurance-Finance SARL</p>
      <p><strong>Sigle :</strong> AIF</p>
      <p><strong>Forme juridique :</strong> Société à responsabilité limitée (SARL)</p>
      <p><strong>Capital social :</strong> 20 000 EUR</p>
      <p><strong>Siège social :</strong> 66 avenue des Champs-Élysées, 75008 Paris, France</p>
      <p><strong>SIRET :</strong> 895 111 292 00010</p>
      <p><strong>RCS :</strong> Paris 895 111 292</p>
      <p><strong>EUID :</strong> FR7501.895111292</p>
      <p><strong>APE / NAF :</strong> 6622Z — Autres activités auxiliaires d'assurance et de retraite</p>
      <p><strong>Numéro de TVA :</strong> FR50895111292</p>
      <p><strong>Nom commercial :</strong> Opulanz</p>
      <p><strong>Directeur de publication :</strong> Gérant — Advensys Insurance-Finance SARL</p>
      <p><strong>Téléphone :</strong> +33 6 98 21 44 46</p>
      <p><strong>Email :</strong> contact@advensys-in-finance.com</p>
    </div>

    <h3 className="text-lg font-semibold text-brand-dark mb-3">
      GROUPE ADVENSYS LUXEMBOURG S.A. — Entité opérationnelle (Luxembourg)
    </h3>
    <div className="text-brand-grayMed mb-6 space-y-1 pl-4 border-l-2 border-brand-gold/40">
      <p><strong>Dénomination sociale :</strong> Groupe Advensys Luxembourg S.A.</p>
      <p><strong>Enseignes commerciales :</strong> Advensys Conseil · Location Rolls Royce · Opulanz Group</p>
      <p><strong>Forme juridique :</strong> Société anonyme (SA)</p>
      <p><strong>Capital social :</strong> 31 000 EUR</p>
      <p><strong>Siège social :</strong> 34, Grand-rue, L-9710 Clervaux, Grand-Duché de Luxembourg</p>
      <p><strong>RCS Luxembourg :</strong> B197138</p>
      <p><strong>Code NACE :</strong> 69.200 — Activités comptables</p>
      <p><strong>Date de constitution :</strong> 12/05/2015</p>
      <p><strong>Administrateur unique :</strong> DULBERG Irvin Regnard</p>
      <p><strong>Email :</strong> contact@advensys-conseil.lu</p>
      <p><strong>Téléphone :</strong> +352 28 79 76 26</p>
    </div>

    <h3 className="text-lg font-semibold text-brand-dark mb-3">
      OPULANZ SIA — Entité opérationnelle (Lettonie)
    </h3>
    <div className="text-brand-grayMed mb-6 space-y-1 pl-4 border-l-2 border-brand-gold/40">
      <p><strong>Dénomination sociale :</strong> Opulanz SIA</p>
      <p><strong>Forme juridique :</strong> Société à responsabilité limitée (SIA)</p>
      <p><strong>Capital social :</strong> 3 000 EUR</p>
      <p><strong>Siège social :</strong> Vīlandes iela 5-36, Rīga, LV-1010, Lettonie</p>
      <p><strong>Numéro d'enregistrement :</strong> 40203750214</p>
      <p><strong>Date d'enregistrement :</strong> 27/05/2026</p>
      <p><strong>Identifiant SEPA :</strong> LV44ZZZ40203750214</p>
      <p><strong>Actionnaire unique :</strong> DULBERG Irvin Regnard</p>
      <p><strong>Email :</strong> contact@opulanz.com</p>
      <p><strong>Téléphone :</strong> +371 20 682 842</p>
    </div>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Hébergement</h2>
    <div className="text-brand-grayMed mb-6 space-y-1 pl-4 border-l-2 border-brand-gold/40">
      <p>Le site www.opulanz.com est hébergé par :</p>
      <p><strong>Hébergeur principal :</strong> Microsoft Azure — European Data Centers (EU)</p>
      <p><strong>Hébergeur secondaire (France) :</strong> OVH SAS — 2 rue Kellermann, 59100 Roubaix, France — SIRET : 424 761 419 00045</p>
    </div>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Propriété Intellectuelle</h2>
    <p className="text-brand-grayMed mb-6">
      La marque et le logo « Opulanz » sont la propriété exclusive de Groupe Advensys Luxembourg S.A.
      Toute reproduction, représentation ou utilisation non autorisée est strictement interdite et constitue
      une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Responsabilité</h2>
    <p className="text-brand-grayMed mb-6">
      Les informations publiées sur ce site sont fournies à titre indicatif. Advensys Insurance-Finance SARL
      décline toute responsabilité pour les dommages directs ou indirects résultant de l'utilisation du site
      ou de l'impossibilité d'y accéder.
    </p>

    <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Droit Applicable</h2>
    <p className="text-brand-grayMed mb-6">
      Les présentes mentions légales sont régies par le droit luxembourgeois. Tout litige relatif à leur
      interprétation ou à leur exécution relève de la compétence exclusive des tribunaux de Luxembourg.
    </p>

    <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
      Dernière mise à jour : juillet 2026
    </p>
  </>
);
