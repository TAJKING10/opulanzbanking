import json

with open('messages/en.json', encoding='utf-8') as f:
    en = json.load(f)
with open('messages/fr.json', encoding='utf-8') as f:
    fr = json.load(f)

en['lifeInsurance'] = {
  "hero": {
    "title": "Life Insurance Brokerage Services",
    "subtitle": "As your trusted insurance broker, we connect you with comprehensive life insurance solutions to financially protect your loved ones",
    "primaryCta": "Get a Quote"
  },
  "overview": {
    "overline": "Overview",
    "title": "Your Trusted Life Insurance Broker",
    "description": "As an independent insurance broker, we work on your behalf to find and connect you with the best life insurance solutions from leading providers, ensuring your loved ones are financially protected.",
    "badge1": "Unbiased Advice",
    "badge2": "Multiple Providers",
    "badge3": "Family Protection",
    "whyBrokerTitle": "Why Choose a Broker?",
    "benefit1": "Independent broker representing your interests",
    "benefit2": "Access to policies from multiple leading insurance providers",
    "benefit3": "Personalized needs analysis and coverage recommendations",
    "benefit4": "Expert guidance on advanced features and estate planning",
    "benefit5": "Ongoing policy management and support"
  },
  "products": {
    "overline": "Our Services",
    "title": "Life Insurance Products We Broker",
    "description": "We help you access a wide range of life insurance solutions from trusted providers to meet your specific protection needs.",
    "term": {"title": "Term Life Insurance", "description": "10, 20, or 30-year term options with level premiums for affordable protection during your most critical years."},
    "whole": {"title": "Whole Life Insurance", "description": "Lifetime coverage with cash value accumulation that provides permanent protection and financial growth."},
    "universal": {"title": "Universal Life Insurance", "description": "Flexible premiums and adjustable death benefits that adapt to your changing financial situation."},
    "variable": {"title": "Variable Life Insurance", "description": "Investment-linked cash value growth that allows you to potentially increase your policy value over time."},
    "group": {"title": "Group Life Insurance", "description": "Employer-sponsored life insurance plans that provide coverage at competitive group rates."}
  },
  "howItWorks": {
    "overline": "Simple Process",
    "title": "How We Help You Find the Right Coverage",
    "step1": {"title": "Free Consultation", "description": "Schedule a no-obligation meeting to discuss your needs"},
    "step2": {"title": "Compare Options", "description": "We present policies from multiple top providers"},
    "step3": {"title": "Expert Guidance", "description": "Get unbiased recommendations tailored to you"},
    "step4": {"title": "Ongoing Support", "description": "Continuous assistance throughout your policy lifecycle"}
  },
  "features": {
    "overline": "Why We Are Different",
    "title": "Professional Insurance Brokerage Expertise",
    "description": "As independent brokers, we provide unbiased advice and access to the best insurance solutions for your needs.",
    "brokers": {"title": "Expert Brokers", "description": "Specialized knowledge to connect you with the right insurance products"},
    "analysis": {"title": "Needs Analysis", "description": "Personalized assessment to find the perfect coverage from multiple providers"},
    "wealth": {"title": "Wealth Building", "description": "Guidance on tax-advantaged strategies for long-term financial growth"},
    "support": {"title": "Ongoing Support", "description": "Continuous policy management and brokerage support"}
  },
  "cta": {
    "title": "Protect Your Family Future Today",
    "subtitle": "Get started with a personalized consultation. We will help you compare options from leading insurance providers to find the solution that best fits your family needs and financial goals.",
    "badge1": "Free Consultation",
    "badge2": "Compare Multiple Providers",
    "badge3": "Expert Guidance",
    "primaryButton": "Get Free Quote",
    "secondaryButton": "Talk to an Advisor"
  }
}

fr['lifeInsurance'] = {
  "hero": {
    "title": "Services de Courtage en Assurance Vie",
    "subtitle": "En tant que courtier de confiance, nous vous connectons avec des solutions assurance vie completes pour proteger financierement vos proches",
    "primaryCta": "Obtenir un devis"
  },
  "overview": {
    "overline": "Presentation",
    "title": "Votre Courtier en Assurance Vie de Confiance",
    "description": "En tant que courtier independant, nous travaillons en votre nom pour trouver et vous connecter avec les meilleures solutions assurance vie des principaux fournisseurs, en veillant a la protection financiere de vos proches.",
    "badge1": "Conseils impartiaux",
    "badge2": "Plusieurs fournisseurs",
    "badge3": "Protection familiale",
    "whyBrokerTitle": "Pourquoi choisir un courtier",
    "benefit1": "Courtier independant representant vos interets",
    "benefit2": "Acces aux polices de plusieurs grands assureurs",
    "benefit3": "Analyse personnalisee de vos besoins et recommandations de couverture",
    "benefit4": "Conseils experts sur les fonctionnalites avancees et la planification successorale",
    "benefit5": "Gestion continue des polices et assistance"
  },
  "products": {
    "overline": "Nos Services",
    "title": "Produits Assurance Vie que Nous Courtisons",
    "description": "Nous vous aidons a acceder a une large gamme de solutions assurance vie de fournisseurs de confiance pour repondre a vos besoins specifiques de protection.",
    "term": {"title": "Assurance Vie Temporaire", "description": "Options a terme de 10, 20 ou 30 ans avec des primes fixes pour une protection abordable pendant vos annees les plus cruciales."},
    "whole": {"title": "Assurance Vie Entiere", "description": "Couverture a vie avec accumulation de valeur de rachat offrant une protection permanente et une croissance financiere."},
    "universal": {"title": "Assurance Vie Universelle", "description": "Primes flexibles et garanties deces ajustables qui adaptent a evolution de votre situation financiere."},
    "variable": {"title": "Assurance Vie Variable", "description": "Croissance de la valeur de rachat liee aux investissements vous permettant potentiellement augmenter la valeur de votre contrat."},
    "group": {"title": "Assurance Vie Collective", "description": "Plans assurance vie collectifs parraines par employeur offrant une couverture a des tarifs de groupe competitifs."}
  },
  "howItWorks": {
    "overline": "Processus simple",
    "title": "Comment nous vous aidons a trouver la bonne couverture",
    "step1": {"title": "Consultation gratuite", "description": "Planifiez une reunion sans engagement pour discuter de vos besoins"},
    "step2": {"title": "Comparer les options", "description": "Nous vous presentons des polices de plusieurs grands assureurs"},
    "step3": {"title": "Conseils experts", "description": "Obtenez des recommandations impartiales adaptees a votre profil"},
    "step4": {"title": "Assistance continue", "description": "Accompagnement tout au long du cycle de vie de votre contrat"}
  },
  "features": {
    "overline": "Ce qui nous differencie",
    "title": "Expertise Professionnelle en Courtage Assurance",
    "description": "En tant que courtiers independants, nous fournissons des conseils impartiaux et acces aux meilleures solutions assurance pour vos besoins.",
    "brokers": {"title": "Courtiers experts", "description": "Expertise specialisee pour vous connecter avec les bons produits assurance"},
    "analysis": {"title": "Analyse des besoins", "description": "Evaluation personnalisee pour trouver la couverture ideale aupres de plusieurs fournisseurs"},
    "wealth": {"title": "Constitution de patrimoine", "description": "Conseils sur les strategies fiscalement avantageuses pour la croissance financiere a long terme"},
    "support": {"title": "Assistance continue", "description": "Gestion continue des polices et support de courtage"}
  },
  "cta": {
    "title": "Protegez avenir de votre famille des maintenant",
    "subtitle": "Commencez par une consultation personnalisee. Nous vous aiderons a comparer les options des principaux assureurs pour trouver la solution qui correspond le mieux aux besoins de votre famille.",
    "badge1": "Consultation gratuite",
    "badge2": "Comparer plusieurs fournisseurs",
    "badge3": "Conseils experts",
    "primaryButton": "Obtenir un devis gratuit",
    "secondaryButton": "Parler a un conseiller"
  }
}

with open('messages/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, indent=2, ensure_ascii=False)
with open('messages/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr, f, indent=2, ensure_ascii=False)

print('Done.')
print('en lifeInsurance keys:', list(en['lifeInsurance'].keys()))
print('fr lifeInsurance keys:', list(fr['lifeInsurance'].keys()))
