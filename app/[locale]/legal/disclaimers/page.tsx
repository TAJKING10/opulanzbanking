"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DisclaimersPage() {
  const locale = useLocale();
  const isFr = locale === "fr";

  return (
    <>
      <Hero
        title={isFr ? "Avertissements" : "Disclaimers"}
        subtitle={
          isFr
            ? "Avertissements obligatoires MiFID II, ACPR et AMF"
            : "Mandatory MiFID II, ACPR and AMF Disclaimers"
        }
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-8 rounded-lg border-l-4 border-brand-gold bg-brand-goldLight/20 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-brand-goldDark" />
              <div>
                <p className="text-sm text-brand-grayMed">
                  {isFr
                    ? "Les avertissements suivants sont obligatoires en vertu de la directive MiFID II (2014/65/UE), des réglementations de l'ACPR et des normes de l'AMF. Ils doivent être affichés de manière claire, visible et accessible sur toute plateforme proposant des services financiers."
                    : "The following disclaimers are mandatory under MiFID II (Directive 2014/65/EU), ACPR regulations, and AMF standards. They must be displayed in a clear, prominent, and accessible manner on any platform offering financial services."}
                </p>
              </div>
            </div>
          </div>

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
      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        1. Investment Risk Warning (MiFID II — Mandatory)
      </h2>
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-brand-dark font-semibold mb-2">IMPORTANT RISK WARNING</p>
        <p className="text-brand-grayMed">
          Investing in financial instruments involves significant risk. The value of investments may
          go up as well as down, and you may not recover the full amount invested. Past performance
          is not a reliable indicator of future results. Returns are not guaranteed.
        </p>
      </div>
      <p className="text-brand-grayMed mb-6">
        Investment advisory services are provided by Advensys Insurance-Finance SARL in its capacity
        as Conseiller en Investissements Financiers (CIF), registered with the AMF under ORIAS
        n°21003660. Advisory services are tailored to client profiles assessed through the mandatory
        appropriateness and suitability assessment (MiFID II Art. 25).
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Insurance Disclaimer</h2>
      <p className="text-brand-grayMed mb-4">
        Insurance brokerage services are provided by Advensys Insurance-Finance SARL in its capacity
        as Courtier d&apos;Assurance (COA), registered with ORIAS n°21003660. Advensys
        Insurance-Finance SARL acts as an independent intermediary and does not guarantee the
        solvency or performance of any insurance undertaking.
      </p>
      <p className="text-brand-grayMed mb-6">
        Before subscribing to any insurance product, clients are encouraged to read the Product
        Information Document (DIC/IPID) and the insurance contract in full.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        3. Banking &amp; Payment Services Disclaimer
      </h2>
      <p className="text-brand-grayMed mb-4">
        Banking account opening and payment services are facilitated by Opulanz SIA (Latvia) acting
        as introducer, in partnership with licensed Electronic Money Institutions (EMI) operating
        within the European Union. Opulanz SIA itself does not hold a banking licence or an EMI
        licence and does not hold client funds.
      </p>
      <p className="text-brand-grayMed mb-6">
        Banking intermediation services (COBSP) in France are provided by Advensys Insurance-Finance
        SARL (ORIAS n°21003660). Clients are advised that funds held with EMI partners may be
        subject to the safeguarding rules of the relevant EMI&apos;s home member state rather than
        the Luxembourg or French deposit guarantee schemes.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        4. Tax &amp; Legal Advisory Disclaimer
      </h2>
      <p className="text-brand-grayMed mb-6">
        Tax advisory services provided by Groupe Advensys Luxembourg S.A. and legal advisory
        services provided by Advensys Insurance-Finance SARL are for informational and guidance
        purposes only. They do not constitute legal advice within the meaning of the Luxembourg law
        of 10 August 1991 on the legal profession or French equivalent legislation. Clients are
        encouraged to seek independent legal counsel for specific legal matters.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        5. Conflicts of Interest (MiFID II Art. 23)
      </h2>
      <p className="text-brand-grayMed mb-6">
        Advensys Insurance-Finance SARL has implemented a conflicts of interest policy in accordance
        with MiFID II Article 23. A summary of this policy is available upon request. Where a
        conflict of interest cannot be avoided, it will be disclosed to the client prior to the
        provision of any advisory service.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Informational Content</h2>
      <p className="text-brand-grayMed mb-6">
        All content published on www.opulanz.com is provided for general informational purposes only
        and does not constitute financial, legal, tax, or investment advice. While reasonable efforts
        are made to ensure accuracy, no warranty is given as to the completeness or timeliness of
        any information published.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        7. Professional Indemnity Insurance
      </h2>
      <p className="text-brand-grayMed mb-6">
        Advensys Insurance-Finance SARL holds professional indemnity insurance with MMA IARD France,
        covering all regulated intermediation activities (CIF, COBSP, COA) as required by applicable
        French law and ORIAS registration requirements.
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
      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        1. Avertissement sur le Risque d&apos;Investissement (MiFID II — Obligatoire)
      </h2>
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-brand-dark font-semibold mb-2">AVERTISSEMENT IMPORTANT SUR LES RISQUES</p>
        <p className="text-brand-grayMed">
          Investir dans des instruments financiers comporte des risques significatifs. La valeur des
          investissements peut aussi bien augmenter que diminuer, et vous pourriez ne pas récupérer
          l&apos;intégralité du capital investi. Les performances passées ne constituent pas un
          indicateur fiable des résultats futurs. Les rendements ne sont pas garantis.
        </p>
      </div>
      <p className="text-brand-grayMed mb-6">
        Les services de conseil en investissement sont fournis par Advensys Insurance-Finance SARL
        en sa qualité de Conseiller en Investissements Financiers (CIF), enregistré auprès de l&apos;AMF
        sous le numéro ORIAS n°21003660. Les prestations de conseil sont adaptées au profil de chaque
        client, évalué dans le cadre du test d&apos;adéquation et d&apos;appropriation obligatoire
        (MiFID II Art. 25).
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Avertissement Assurance</h2>
      <p className="text-brand-grayMed mb-4">
        Les services de courtage en assurance sont fournis par Advensys Insurance-Finance SARL en sa
        qualité de Courtier d&apos;Assurance (COA), enregistré sous le numéro ORIAS n°21003660.
        Advensys Insurance-Finance SARL agit en qualité d&apos;intermédiaire indépendant et ne
        garantit pas la solvabilité ni les performances d&apos;un quelconque organisme
        d&apos;assurance.
      </p>
      <p className="text-brand-grayMed mb-6">
        Avant de souscrire à tout produit d&apos;assurance, les clients sont invités à lire
        intégralement le Document d&apos;Information sur le Produit (DIC/IPID) ainsi que le contrat
        d&apos;assurance.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        3. Avertissement Services Bancaires &amp; de Paiement
      </h2>
      <p className="text-brand-grayMed mb-4">
        L&apos;ouverture de compte bancaire et les services de paiement sont facilités par Opulanz
        SIA (Lettonie) agissant en qualité d&apos;apporteur d&apos;affaires, en partenariat avec des
        Établissements de Monnaie Électronique (EME) agréés opérant au sein de l&apos;Union
        européenne. Opulanz SIA ne détient pas d&apos;agrément bancaire ni d&apos;agrément EME et ne
        détient pas les fonds des clients.
      </p>
      <p className="text-brand-grayMed mb-6">
        Les services d&apos;intermédiation bancaire (COBSP) en France sont fournis par Advensys
        Insurance-Finance SARL (ORIAS n°21003660). Les clients sont informés que les fonds détenus
        auprès des partenaires EME peuvent être soumis aux règles de protection des fonds de
        l&apos;État membre d&apos;origine de l&apos;EME concerné, plutôt qu&apos;aux systèmes de
        garantie des dépôts luxembourgeois ou français.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        4. Avertissement Conseil Fiscal &amp; Juridique
      </h2>
      <p className="text-brand-grayMed mb-6">
        Les services de conseil fiscal fournis par Groupe Advensys Luxembourg S.A. et les services
        de conseil juridique fournis par Advensys Insurance-Finance SARL sont proposés à titre
        informatif et d&apos;orientation uniquement. Ils ne constituent pas un conseil juridique au
        sens de la loi luxembourgeoise du 10 août 1991 sur la profession d&apos;avocat ni de la
        législation française équivalente. Les clients sont invités à consulter un conseil juridique
        indépendant pour toute question juridique spécifique.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        5. Conflits d&apos;Intérêts (MiFID II Art. 23)
      </h2>
      <p className="text-brand-grayMed mb-6">
        Advensys Insurance-Finance SARL a mis en place une politique de gestion des conflits
        d&apos;intérêts conformément à l&apos;article 23 de la directive MiFID II. Un résumé de
        cette politique est disponible sur demande. Lorsqu&apos;un conflit d&apos;intérêts ne peut
        être évité, il sera divulgué au client avant la fourniture de toute prestation de conseil.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Contenu Informatif</h2>
      <p className="text-brand-grayMed mb-6">
        L&apos;ensemble des contenus publiés sur www.opulanz.com est fourni à titre d&apos;information
        générale uniquement et ne constitue pas un conseil financier, juridique, fiscal ou en
        investissement. Bien que des efforts raisonnables soient déployés pour garantir
        l&apos;exactitude des informations, aucune garantie n&apos;est donnée quant à
        l&apos;exhaustivité ou à l&apos;actualité des informations publiées.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">
        7. Assurance Responsabilité Civile Professionnelle
      </h2>
      <p className="text-brand-grayMed mb-6">
        Advensys Insurance-Finance SARL détient une assurance responsabilité civile professionnelle
        souscrite auprès de MMA IARD France, couvrant l&apos;ensemble des activités
        d&apos;intermédiation réglementées (CIF, COBSP, COA) conformément à la législation française
        applicable et aux exigences d&apos;immatriculation ORIAS.
      </p>

      <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
        Dernière mise à jour : juillet 2026
      </p>
    </>
  );
}
