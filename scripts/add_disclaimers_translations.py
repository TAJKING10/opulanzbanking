import json

page_en = {
  "hero": {
    "title": "Disclaimers",
    "subtitle": "Important information about our services and limitations"
  },
  "notice": {
    "title": "Important Notice",
    "description": "Please read these disclaimers carefully. By using our services, you acknowledge that you have read, understood, and agree to be bound by these disclaimers."
  },
  "s1": {
    "title": "1. General Disclaimer",
    "content": "The information provided on the Opulanz platform is for general informational purposes only. While we strive to keep the information accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the platform."
  },
  "s2": {
    "title": "2. Financial Advice Disclaimer",
    "content": "The content provided on our platform does not constitute financial, investment, tax, or legal advice. Any information or recommendations provided are for informational purposes only and should not be considered as professional advice. You should consult with qualified professionals before making any financial decisions. Past performance is not indicative of future results."
  },
  "s3": {
    "title": "3. Investment Risk Disclaimer",
    "intro": "Investing in financial products involves risk, including the potential loss of principal. Before investing, you should consider:",
    "bullets": [
      "Your financial situation, investment objectives, and risk tolerance",
      "The risks associated with specific investment products",
      "Market volatility and economic conditions",
      "Currency exchange rate fluctuations",
      "Potential tax implications"
    ],
    "outro": "We do not guarantee any specific investment returns or outcomes. You are solely responsible for your investment decisions and any resulting gains or losses."
  },
  "s4": {
    "title": "4. Service Availability Disclaimer",
    "content": "While we strive to maintain 99.9% uptime, we cannot guarantee uninterrupted or error-free access to our platform. Services may be temporarily unavailable due to maintenance, technical issues, or circumstances beyond our control. We are not liable for any losses resulting from service interruptions or delays in processing transactions."
  },
  "s5": {
    "title": "5. Third-Party Services Disclaimer",
    "content": "Our platform may contain links to or integrate with third-party websites, services, or products. We do not endorse or assume responsibility for the content, privacy policies, or practices of third-party services. Your interactions with third-party services are governed by their respective terms and conditions. We are not liable for any damages or losses resulting from your use of third-party services."
  },
  "s6": {
    "title": "6. Regulatory and Jurisdictional Disclaimer",
    "content": "Opulanz operates under licenses and regulations in specific jurisdictions. Our services may not be available in all countries or regions. It is your responsibility to ensure that your use of our services complies with local laws and regulations in your jurisdiction. We make no representation that materials on our platform are appropriate or available for use in all locations."
  },
  "s7": {
    "title": "7. Exchange Rate and Currency Disclaimer",
    "content": "Exchange rates displayed on our platform are indicative and may not reflect real-time market rates. Actual rates applied to transactions may differ based on market conditions, transaction size, and timing. Currency exchange involves risk, and rates can fluctuate significantly. We are not responsible for losses resulting from exchange rate movements."
  },
  "s8": {
    "title": "8. Tax Disclaimer",
    "content": "Information provided regarding tax matters is general in nature and should not be considered as tax advice. Tax laws vary by jurisdiction and individual circumstances. You are responsible for understanding and complying with your tax obligations. We recommend consulting with qualified tax professionals for advice specific to your situation. Opulanz is not responsible for any tax liabilities you may incur."
  },
  "s9": {
    "title": "9. Insurance Coverage Disclaimer",
    "content": "Insurance products offered through our platform are provided by licensed insurance companies. We act as an intermediary and are not the insurance provider. Coverage terms, conditions, and exclusions are determined by the insurance policy documents. You should carefully review all policy documents before purchasing insurance. We are not liable for claims disputes or coverage issues between you and the insurance provider."
  },
  "s10": {
    "title": "10. Company Formation Disclaimer",
    "content": "Company formation services are provided for informational and administrative assistance purposes only. We do not provide legal advice regarding corporate structure, governance, or compliance. The suitability of a particular corporate structure depends on your specific circumstances and objectives. You should consult with legal and tax professionals before forming a company."
  },
  "s11": {
    "title": "11. Security Disclaimer",
    "content": "While we implement industry-standard security measures, no system is completely secure. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. We are not liable for unauthorized access resulting from your failure to maintain security, disclosure of credentials, or use of compromised devices or networks."
  },
  "s12": {
    "title": "12. Transaction Disclaimer",
    "content": "Once a transaction is executed, it may not be reversible. You are responsible for verifying all transaction details before confirming. We are not liable for losses resulting from incorrect recipient information, amount errors, or transactions executed based on your instructions. Some transactions may be delayed or rejected due to compliance reviews, technical issues, or insufficient funds."
  },
  "s13": {
    "title": "13. Content Accuracy Disclaimer",
    "content": "We make reasonable efforts to ensure information accuracy, but content on our platform may contain errors, omissions, or outdated information. Account balances, transaction history, and other data are provided \"as is\" without warranty. You should verify critical information independently. We reserve the right to correct errors and update information without prior notice."
  },
  "s14": {
    "title": "14. Limitation of Liability",
    "content": "To the maximum extent permitted by law, Opulanz, its directors, employees, partners, and affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from: your use or inability to use our services, unauthorized access to your account, errors or omissions in content, delays or interruptions in service, or any decisions made based on information provided on our platform."
  },
  "s15": {
    "title": "15. Changes to Disclaimers",
    "content": "We reserve the right to modify these disclaimers at any time. Material changes will be communicated through our platform or via email. Your continued use of our services after changes are posted constitutes acceptance of the updated disclaimers. We recommend reviewing this page periodically."
  },
  "s16": {
    "title": "16. Contact Information",
    "intro": "If you have questions about these disclaimers, please contact us:",
    "email": "Email",
    "phone": "Phone",
    "address": "Address"
  },
  "lastUpdated": "Last updated: October 28, 2025"
}

page_fr = {
  "hero": {
    "title": "Avertissements",
    "subtitle": "Informations importantes sur nos services et leurs limites"
  },
  "notice": {
    "title": "Avis important",
    "description": "Veuillez lire attentivement ces avertissements. En utilisant nos services, vous reconnaissez avoir lu, compris et accepté d'être lié par ces avertissements."
  },
  "s1": {
    "title": "1. Avertissement général",
    "content": "Les informations fournies sur la plateforme Opulanz sont à titre informatif général uniquement. Bien que nous nous efforcions de maintenir les informations exactes et à jour, nous ne faisons aucune déclaration ni garantie d'aucune sorte, expresse ou implicite, quant à l'exhaustivité, l'exactitude, la fiabilité, la pertinence ou la disponibilité des informations, produits, services ou graphiques connexes contenus sur la plateforme."
  },
  "s2": {
    "title": "2. Avertissement relatif aux conseils financiers",
    "content": "Le contenu fourni sur notre plateforme ne constitue pas un conseil financier, d'investissement, fiscal ou juridique. Toute information ou recommandation fournie est à titre informatif uniquement et ne doit pas être considérée comme un conseil professionnel. Vous devez consulter des professionnels qualifiés avant de prendre toute décision financière. Les performances passées ne préjugent pas des résultats futurs."
  },
  "s3": {
    "title": "3. Avertissement sur le risque d'investissement",
    "intro": "Investir dans des produits financiers comporte des risques, y compris la perte potentielle du capital investi. Avant d'investir, vous devez prendre en compte :",
    "bullets": [
      "Votre situation financière, vos objectifs d'investissement et votre tolérance au risque",
      "Les risques associés aux produits d'investissement spécifiques",
      "La volatilité des marchés et les conditions économiques",
      "Les fluctuations des taux de change",
      "Les implications fiscales potentielles"
    ],
    "outro": "Nous ne garantissons aucun rendement ou résultat d'investissement spécifique. Vous êtes seul responsable de vos décisions d'investissement et des gains ou pertes qui en résultent."
  },
  "s4": {
    "title": "4. Avertissement sur la disponibilité du service",
    "content": "Bien que nous nous efforcions de maintenir une disponibilité de 99,9 %, nous ne pouvons garantir un accès ininterrompu ou sans erreur à notre plateforme. Les services peuvent être temporairement indisponibles en raison de maintenance, de problèmes techniques ou de circonstances indépendantes de notre volonté. Nous ne sommes pas responsables des pertes résultant d'interruptions de service ou de retards dans le traitement des transactions."
  },
  "s5": {
    "title": "5. Avertissement relatif aux services tiers",
    "content": "Notre plateforme peut contenir des liens vers ou s'intégrer à des sites Web, services ou produits tiers. Nous n'approuvons pas et n'assumons aucune responsabilité pour le contenu, les politiques de confidentialité ou les pratiques des services tiers. Vos interactions avec des services tiers sont régies par leurs conditions générales respectives. Nous ne sommes pas responsables des dommages ou pertes résultant de votre utilisation de services tiers."
  },
  "s6": {
    "title": "6. Avertissement réglementaire et juridictionnel",
    "content": "Opulanz opère sous licences et réglementations dans des juridictions spécifiques. Nos services peuvent ne pas être disponibles dans tous les pays ou régions. Il vous appartient de vous assurer que votre utilisation de nos services est conforme aux lois et réglementations locales de votre juridiction. Nous ne garantissons pas que les documents sur notre plateforme soient appropriés ou disponibles pour une utilisation dans tous les pays."
  },
  "s7": {
    "title": "7. Avertissement sur les taux de change et les devises",
    "content": "Les taux de change affichés sur notre plateforme sont indicatifs et peuvent ne pas refléter les taux du marché en temps réel. Les taux réels appliqués aux transactions peuvent différer en fonction des conditions du marché, du montant de la transaction et du moment. Le change de devises comporte des risques et les taux peuvent fluctuer de manière significative. Nous ne sommes pas responsables des pertes résultant des variations des taux de change."
  },
  "s8": {
    "title": "8. Avertissement fiscal",
    "content": "Les informations fournies concernant les questions fiscales sont de nature générale et ne doivent pas être considérées comme des conseils fiscaux. Les lois fiscales varient selon les juridictions et les situations individuelles. Vous êtes responsable de la compréhension et du respect de vos obligations fiscales. Nous vous recommandons de consulter des professionnels fiscaux qualifiés pour des conseils adaptés à votre situation. Opulanz n'est pas responsable des obligations fiscales que vous pourriez encourir."
  },
  "s9": {
    "title": "9. Avertissement sur la couverture d'assurance",
    "content": "Les produits d'assurance proposés via notre plateforme sont fournis par des compagnies d'assurance agréées. Nous agissons en tant qu'intermédiaire et ne sommes pas le fournisseur d'assurance. Les conditions, modalités et exclusions de couverture sont déterminées par les documents de la police d'assurance. Vous devez examiner attentivement tous les documents de police avant de souscrire une assurance. Nous ne sommes pas responsables des litiges de sinistres ou des problèmes de couverture entre vous et l'assureur."
  },
  "s10": {
    "title": "10. Avertissement relatif à la création d'entreprise",
    "content": "Les services de création d'entreprise sont fournis à des fins d'information et d'assistance administrative uniquement. Nous ne fournissons pas de conseils juridiques concernant la structure, la gouvernance ou la conformité des entreprises. L'adéquation d'une structure d'entreprise particulière dépend de vos circonstances et objectifs spécifiques. Vous devez consulter des professionnels juridiques et fiscaux avant de créer une entreprise."
  },
  "s11": {
    "title": "11. Avertissement sur la sécurité",
    "content": "Bien que nous mettions en œuvre des mesures de sécurité conformes aux normes du secteur, aucun système n'est totalement sécurisé. Vous êtes responsable du maintien de la confidentialité de vos identifiants de compte et de toutes les activités effectuées sous votre compte. Nous ne sommes pas responsables des accès non autorisés résultant de votre manque de vigilance en matière de sécurité, de la divulgation de vos identifiants ou de l'utilisation d'appareils ou de réseaux compromis."
  },
  "s12": {
    "title": "12. Avertissement sur les transactions",
    "content": "Une fois qu'une transaction est exécutée, elle peut être irréversible. Vous êtes responsable de la vérification de tous les détails de la transaction avant confirmation. Nous ne sommes pas responsables des pertes résultant d'informations de destinataire incorrectes, d'erreurs de montant ou de transactions exécutées sur la base de vos instructions. Certaines transactions peuvent être retardées ou rejetées en raison de vérifications de conformité, de problèmes techniques ou de fonds insuffisants."
  },
  "s13": {
    "title": "13. Avertissement sur l'exactitude du contenu",
    "content": "Nous déployons des efforts raisonnables pour garantir l'exactitude des informations, mais le contenu de notre plateforme peut contenir des erreurs, omissions ou informations obsolètes. Les soldes de comptes, l'historique des transactions et autres données sont fournis « en l'état » sans garantie. Vous devez vérifier les informations critiques de manière indépendante. Nous nous réservons le droit de corriger les erreurs et de mettre à jour les informations sans préavis."
  },
  "s14": {
    "title": "14. Limitation de responsabilité",
    "content": "Dans toute la mesure permise par la loi, Opulanz, ses dirigeants, employés, partenaires et affiliés ne sauraient être tenus responsables de tout dommage direct, indirect, accessoire, consécutif ou punitif découlant de : votre utilisation ou impossibilité d'utiliser nos services, d'un accès non autorisé à votre compte, d'erreurs ou omissions dans le contenu, de retards ou interruptions de service, ou de décisions prises sur la base d'informations fournies sur notre plateforme."
  },
  "s15": {
    "title": "15. Modifications des avertissements",
    "content": "Nous nous réservons le droit de modifier ces avertissements à tout moment. Les modifications importantes seront communiquées via notre plateforme ou par e-mail. Votre utilisation continue de nos services après la publication des modifications constitue votre acceptation des avertissements mis à jour. Nous vous recommandons de consulter cette page périodiquement."
  },
  "s16": {
    "title": "16. Coordonnées",
    "intro": "Si vous avez des questions concernant ces avertissements, veuillez nous contacter :",
    "email": "E-mail",
    "phone": "Téléphone",
    "address": "Adresse"
  },
  "lastUpdated": "Dernière mise à jour : 28 octobre 2025"
}

en = json.load(open("messages/en.json", encoding="utf-8"))
en["legal"]["disclaimers"] = page_en
with open("messages/en.json", "w", encoding="utf-8") as f:
    json.dump(en, f, ensure_ascii=False, indent=2)
print("en.json updated")

fr = json.load(open("messages/fr.json", encoding="utf-8"))
fr["legal"]["disclaimers"] = page_fr
with open("messages/fr.json", "w", encoding="utf-8") as f:
    json.dump(fr, f, ensure_ascii=False, indent=2)
print("fr.json updated")
