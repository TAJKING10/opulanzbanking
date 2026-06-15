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
            ? "Informations importantes sur nos services et leurs limites"
            : "Important information about our services and limitations"
        }
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-8 rounded-lg border-l-4 border-brand-gold bg-brand-goldLight/20 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-brand-goldDark" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">
                  {isFr ? "Avis Important" : "Important Notice"}
                </h3>
                <p className="text-sm text-brand-grayMed">
                  {isFr
                    ? "Veuillez lire attentivement ces avertissements. En utilisant nos services, vous reconnaissez avoir lu, compris et accepté d'être lié par ces avertissements."
                    : "Please read these disclaimers carefully. By using our services, you acknowledge that you have read, understood, and agree to be bound by these disclaimers."}
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
      <h2 className="text-2xl font-bold text-brand-dark mb-4">1. General Disclaimer</h2>
      <p className="text-brand-grayMed mb-6">
        The information provided on the Opulanz platform is for general informational purposes only. While we make every reasonable effort to ensure the accuracy and completeness of the information presented, we make no representations or warranties of any kind, express or implied, regarding the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related content on the platform.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">2. No Financial Advice</h2>
      <p className="text-brand-grayMed mb-6">
        Nothing on the Opulanz platform constitutes financial, investment, tax, legal, or any other professional advice. Any content, tools, or information provided are for informational purposes only and must not be relied upon as professional advice. You should seek independent advice from a qualified professional before making any financial, investment, tax, or legal decisions. Past performance is not indicative of future results. The value of investments and any income from them may go down as well as up.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Investment Risk</h2>
      <p className="text-brand-grayMed mb-4">
        Investing in financial instruments involves risk, including the possible loss of the capital invested. Before making any investment decision, you should carefully consider:
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li>Your personal financial situation, investment objectives, and risk tolerance</li>
        <li>The specific risks associated with each investment product or asset class</li>
        <li>Market volatility, liquidity risk, and macroeconomic conditions</li>
        <li>Currency exchange rate risk where applicable</li>
        <li>Counterparty and credit risk</li>
        <li>Potential tax implications in your jurisdiction</li>
      </ul>
      <p className="text-brand-grayMed mb-6">
        Opulanz does not guarantee any specific investment returns or outcomes. You bear sole responsibility for your investment decisions and any resulting gains or losses.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Regulatory and Jurisdictional Disclaimer</h2>
      <p className="text-brand-grayMed mb-6">
        Opulanz operates under licences and regulatory authorisations in specific jurisdictions, notably Luxembourg and France. Our services may not be available in all countries or regions. It is your sole responsibility to ensure that your access to and use of our services complies with all applicable laws and regulations in your jurisdiction. We make no representation that the materials, products, or services available on the platform are appropriate or lawfully available in all locations.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Service Availability</h2>
      <p className="text-brand-grayMed mb-6">
        Whilst we endeavour to maintain high platform availability, we cannot guarantee uninterrupted, error-free, or secure access to the platform at all times. Services may be temporarily unavailable due to scheduled maintenance, technical difficulties, third-party failures, or circumstances beyond our reasonable control (including, but not limited to, force majeure events). Opulanz shall not be liable for any losses arising from service interruptions, delays in processing, or unavailability of the platform.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Exchange Rates and Currency</h2>
      <p className="text-brand-grayMed mb-6">
        Exchange rates and currency information displayed on the platform are indicative only and may not reflect prevailing real-time market rates. The actual rates applied to transactions may differ based on market conditions, transaction size, timing, and applicable fees. Currency exchange carries inherent risk, and exchange rates may fluctuate significantly. Opulanz is not responsible for any losses arising from exchange rate movements or currency conversion.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Third-Party Services and Links</h2>
      <p className="text-brand-grayMed mb-6">
        The platform may contain links to, or integrate with, third-party websites, services, or products. Opulanz does not endorse and assumes no responsibility for the content, accuracy, privacy policies, practices, or reliability of any third-party services. Your interactions with third-party services are governed by their respective terms and conditions and privacy policies. Opulanz is not liable for any damages or losses resulting from your use of third-party services.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Tax Disclaimer</h2>
      <p className="text-brand-grayMed mb-6">
        Any information relating to tax matters provided on the platform is general in nature and does not constitute tax advice. Tax laws, rates, and treatment vary significantly by jurisdiction and individual circumstances. You are solely responsible for understanding and fulfilling your tax obligations. We strongly recommend consulting a qualified tax adviser for advice specific to your situation. Opulanz accepts no liability for any tax liabilities you may incur.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Insurance Disclaimer</h2>
      <p className="text-brand-grayMed mb-6">
        Insurance products made available through the platform are provided by licensed insurance companies. Opulanz acts solely as an intermediary or broker and is not the insurer. All coverage terms, conditions, exclusions, and limitations are determined solely by the applicable insurance policy documents. You should carefully review all policy documentation before purchasing any insurance product. Opulanz is not liable for claims disputes, coverage issues, or decisions made by insurers.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Company Formation Disclaimer</h2>
      <p className="text-brand-grayMed mb-6">
        Company formation services provided through the platform are for administrative assistance and informational purposes only. Opulanz does not provide legal advice regarding corporate structures, governance, compliance, or regulatory requirements. The suitability of any corporate structure is entirely dependent on your specific circumstances, objectives, and jurisdiction. You should consult qualified legal and tax professionals before forming any company.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Account Security</h2>
      <p className="text-brand-grayMed mb-6">
        Whilst we implement industry-standard security measures to protect your account and personal data, no system is entirely immune from security threats. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities conducted through your account. Opulanz is not liable for losses resulting from your failure to maintain account security, unauthorised access due to credential disclosure, or use of compromised devices or networks.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Transaction Finality</h2>
      <p className="text-brand-grayMed mb-6">
        Once a transaction has been executed and confirmed, it may be irreversible. You are solely responsible for verifying all transaction details — including the recipient, amount, and currency — before authorising any payment or transfer. Opulanz is not liable for losses arising from incorrect recipient information, input errors, or transactions executed in accordance with your instructions. Certain transactions may be delayed, held, or declined due to compliance reviews, insufficient funds, or technical issues.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">13. Content Accuracy</h2>
      <p className="text-brand-grayMed mb-6">
        We make reasonable efforts to ensure the accuracy and currency of information on the platform. However, account balances, transaction data, market information, and other content are provided on an "as is" basis without warranty of any kind. You should independently verify critical information before relying on it. We reserve the right to correct errors and update information without prior notice.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">14. Limitation of Liability</h2>
      <p className="text-brand-grayMed mb-6">
        To the fullest extent permitted by applicable law, Opulanz, its directors, officers, employees, agents, partners, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or in connection with: your use of or inability to use the platform; unauthorised access to your account or personal data; errors, inaccuracies, or omissions in platform content; service interruptions or delays; or any decisions made in reliance on information provided on the platform.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">15. Changes to Disclaimers</h2>
      <p className="text-brand-grayMed mb-6">
        We reserve the right to modify these disclaimers at any time. Material changes will be communicated via the platform or by email. Your continued use of our services after changes are published constitutes your acceptance of the updated disclaimers. We recommend reviewing this page regularly.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">16. Contact</h2>
      <div className="text-brand-grayMed mb-6 space-y-2">
        <p><strong>Legal:</strong> legal@opulanz.com</p>
        <p><strong>Compliance:</strong> compliance@opulanz.com</p>
        <p><strong>Phone:</strong> +352 20 30 40 50</p>
        <p><strong>Address:</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
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
      <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Avertissement Général</h2>
      <p className="text-brand-grayMed mb-6">
        Les informations fournies sur la plateforme Opulanz le sont à des fins d'information générale uniquement. Bien que nous fassions tout effort raisonnable pour garantir l'exactitude et l'exhaustivité des informations présentées, nous n'offrons aucune garantie, expresse ou implicite, quant à l'exhaustivité, l'exactitude, la fiabilité, la pertinence ou la disponibilité des informations, produits, services ou contenus connexes sur la plateforme.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Absence de Conseil Financier</h2>
      <p className="text-brand-grayMed mb-6">
        Rien sur la plateforme Opulanz ne constitue un conseil financier, en investissement, fiscal, juridique ou tout autre conseil professionnel. Tout contenu, outil ou information fourni est à titre informatif uniquement et ne doit pas être utilisé comme conseil professionnel. Vous devez consulter un professionnel qualifié et indépendant avant de prendre toute décision financière, d'investissement, fiscale ou juridique. Les performances passées ne préjugent pas des performances futures. La valeur des investissements et les revenus qui en découlent peuvent fluctuer à la hausse comme à la baisse.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Risques Liés aux Investissements</h2>
      <p className="text-brand-grayMed mb-4">
        Investir dans des instruments financiers comporte des risques, notamment la perte partielle ou totale du capital investi. Avant toute décision d'investissement, vous devez soigneusement prendre en compte :
      </p>
      <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
        <li>Votre situation financière personnelle, vos objectifs d'investissement et votre tolérance au risque</li>
        <li>Les risques spécifiques associés à chaque produit ou classe d'actifs</li>
        <li>La volatilité des marchés, le risque de liquidité et les conditions macroéconomiques</li>
        <li>Le risque de change, le cas échéant</li>
        <li>Le risque de contrepartie et de crédit</li>
        <li>Les éventuelles implications fiscales dans votre juridiction</li>
      </ul>
      <p className="text-brand-grayMed mb-6">
        Opulanz ne garantit aucun rendement ou résultat d'investissement spécifique. Vous assumez l'entière responsabilité de vos décisions d'investissement et de leurs conséquences, qu'elles soient positives ou négatives.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Avertissement Réglementaire et Juridictionnel</h2>
      <p className="text-brand-grayMed mb-6">
        Opulanz opère sous licences et autorisations réglementaires dans des juridictions spécifiques, notamment le Luxembourg et la France. Nos services peuvent ne pas être disponibles dans tous les pays ou régions. Il vous appartient de vérifier que votre accès à nos services et leur utilisation sont conformes à l'ensemble des lois et réglementations applicables dans votre juridiction. Nous ne garantissons pas que les produits, services ou matériaux disponibles sur la plateforme sont appropriés ou légalement accessibles dans tous les pays.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Disponibilité des Services</h2>
      <p className="text-brand-grayMed mb-6">
        Bien que nous nous efforcions de maintenir une haute disponibilité de la plateforme, nous ne pouvons garantir un accès ininterrompu, sans erreur ou entièrement sécurisé à tout moment. Les services peuvent être temporairement indisponibles en raison de maintenances planifiées, de difficultés techniques, de défaillances de tiers ou de circonstances indépendantes de notre volonté raisonnable (notamment les cas de force majeure). Opulanz ne pourra être tenu responsable des pertes résultant d'interruptions de service, de retards de traitement ou d'indisponibilité de la plateforme.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Taux de Change et Devises</h2>
      <p className="text-brand-grayMed mb-6">
        Les taux de change et informations de devises affichés sur la plateforme sont fournis à titre indicatif uniquement et peuvent ne pas refléter les taux de marché en temps réel. Les taux effectivement appliqués aux transactions peuvent différer en fonction des conditions du marché, du montant de la transaction, du moment et des frais applicables. La conversion de devises comporte des risques inhérents et les taux peuvent fluctuer significativement. Opulanz ne pourra être tenu responsable des pertes résultant de variations de taux de change.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Services et Liens Tiers</h2>
      <p className="text-brand-grayMed mb-6">
        La plateforme peut contenir des liens vers, ou être intégrée avec, des sites web, services ou produits tiers. Opulanz ne cautionne pas et décline toute responsabilité quant au contenu, à l'exactitude, aux politiques de confidentialité, aux pratiques ou à la fiabilité de ces services tiers. Vos interactions avec des services tiers sont régies par leurs propres conditions générales et politiques de confidentialité. Opulanz ne pourra être tenu responsable des dommages ou pertes résultant de votre utilisation de services tiers.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Avertissement Fiscal</h2>
      <p className="text-brand-grayMed mb-6">
        Toute information relative à des questions fiscales fournie sur la plateforme est de nature générale et ne constitue pas un conseil fiscal. La législation fiscale, les taux et le traitement varient considérablement selon les juridictions et les situations individuelles. Vous êtes seul responsable de la compréhension et du respect de vos obligations fiscales. Nous recommandons vivement de consulter un conseiller fiscal qualifié pour obtenir des conseils adaptés à votre situation. Opulanz décline toute responsabilité quant aux obligations fiscales que vous pourriez avoir.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Avertissement Assurance</h2>
      <p className="text-brand-grayMed mb-6">
        Les produits d'assurance disponibles via la plateforme sont fournis par des compagnies d'assurance agréées. Opulanz agit uniquement en qualité d'intermédiaire ou de courtier et n'est pas l'assureur. L'ensemble des conditions de garantie, exclusions et limitations sont déterminées exclusivement par les documents de police d'assurance applicables. Vous devez soigneusement examiner tous les documents de police avant d'acquérir tout produit d'assurance. Opulanz décline toute responsabilité quant aux litiges de sinistres, aux problèmes de couverture ou aux décisions prises par les assureurs.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Avertissement Création d'Entreprise</h2>
      <p className="text-brand-grayMed mb-6">
        Les services de création d'entreprise fournis via la plateforme sont proposés à des fins d'assistance administrative et d'information uniquement. Opulanz ne fournit pas de conseils juridiques en matière de structure d'entreprise, de gouvernance, de conformité ou d'exigences réglementaires. La pertinence d'une structure d'entreprise dépend entièrement de vos circonstances, objectifs et juridiction spécifiques. Vous devez consulter des professionnels juridiques et fiscaux qualifiés avant de constituer toute société.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Sécurité du Compte</h2>
      <p className="text-brand-grayMed mb-6">
        Bien que nous mettions en œuvre des mesures de sécurité conformes aux normes du secteur pour protéger votre compte et vos données personnelles, aucun système n'est totalement immunisé contre les menaces de sécurité. Vous êtes seul responsable de la confidentialité de vos identifiants et de toutes les activités effectuées via votre compte. Opulanz décline toute responsabilité pour les pertes résultant de votre négligence en matière de sécurité, d'un accès non autorisé dû à la divulgation de vos identifiants ou de l'utilisation d'appareils ou de réseaux compromis.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Caractère Définitif des Transactions</h2>
      <p className="text-brand-grayMed mb-6">
        Une fois une transaction exécutée et confirmée, celle-ci peut être irréversible. Vous êtes seul responsable de la vérification de tous les détails de la transaction — notamment le bénéficiaire, le montant et la devise — avant d'autoriser tout paiement ou virement. Opulanz décline toute responsabilité pour les pertes résultant d'informations de bénéficiaire incorrectes, d'erreurs de saisie ou de transactions exécutées conformément à vos instructions. Certaines transactions peuvent être retardées, bloquées ou rejetées en raison de vérifications de conformité, de fonds insuffisants ou de problèmes techniques.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">13. Exactitude des Contenus</h2>
      <p className="text-brand-grayMed mb-6">
        Nous faisons des efforts raisonnables pour garantir l'exactitude et l'actualité des informations sur la plateforme. Cependant, les soldes de compte, les données de transaction, les informations de marché et autres contenus sont fournis en l'état, sans aucune garantie d'aucune sorte. Vous devez vérifier de manière indépendante les informations critiques avant de vous y fier. Nous nous réservons le droit de corriger les erreurs et de mettre à jour les informations sans préavis.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">14. Limitation de Responsabilité</h2>
      <p className="text-brand-grayMed mb-6">
        Dans toute la mesure permise par la loi applicable, Opulanz, ses dirigeants, employés, agents, partenaires et affiliés ne pourront être tenus responsables de tout dommage direct, indirect, accessoire, spécial, consécutif ou punitif découlant de : votre utilisation de la plateforme ou de votre incapacité à y accéder ; d'un accès non autorisé à votre compte ou données personnelles ; d'erreurs, inexactitudes ou omissions dans les contenus ; d'interruptions ou retards de service ; ou de décisions prises en se fondant sur des informations figurant sur la plateforme.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">15. Modifications des Avertissements</h2>
      <p className="text-brand-grayMed mb-6">
        Nous nous réservons le droit de modifier ces avertissements à tout moment. Les modifications significatives seront communiquées via la plateforme ou par e-mail. La poursuite de l'utilisation de nos services après la publication des modifications constitue votre acceptation des avertissements mis à jour. Nous vous recommandons de consulter régulièrement cette page.
      </p>

      <h2 className="text-2xl font-bold text-brand-dark mb-4">16. Contact</h2>
      <div className="text-brand-grayMed mb-6 space-y-2">
        <p><strong>Juridique :</strong> legal@opulanz.com</p>
        <p><strong>Conformité :</strong> compliance@opulanz.com</p>
        <p><strong>Téléphone :</strong> +352 20 30 40 50</p>
        <p><strong>Adresse :</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</p>
      </div>

      <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
        Dernière mise à jour : juin 2025
      </p>
    </>
  );
}
