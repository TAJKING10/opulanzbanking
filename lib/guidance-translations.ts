/**
 * Centralised guidance / tour translations.
 * Maps pageKey → { en, fr } with title, description, steps, and tip.
 * The target/position fields never change — only the visible text is translated.
 */

export interface GuidanceStep {
  title?: string;
  content?: string;
  description?: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
  element?: string;
  side?: "top" | "bottom" | "left" | "right" | "over";
  align?: "start" | "center" | "end";
}

export interface GuidanceContent {
  title: string;
  description?: string;
  steps: GuidanceStep[];
  tip?: string;
}

type PageKey = string;

const content: Record<PageKey, { en: GuidanceContent; fr: GuidanceContent }> = {

  /* ── HOME ─────────────────────────────────────────────────────────────── */
  home: {
    en: {
      title: "Welcome to Opulanz",
      description: "Your all-in-one platform for banking, tax, investments, and more.",
      steps: [
        { content: "Welcome to Opulanz — your complete financial services platform. Let us walk you through everything we offer." },
        { title: "Accounting & Invoicing", content: "Professional accounting tools for businesses — automated invoicing, bookkeeping, payroll, VAT reporting, and financial dashboards. Ideal for freelancers and SMEs.", target: "#svc-accounting", position: "right" },
        { title: "Open an Account", content: "Open a personal or business banking account fully online in under 5 minutes. Includes IBAN, SEPA transfers, cards, and compliance — regulated under ACPR.", target: "#svc-open-account", position: "right" },
        { title: "Company Formation", content: "Register your company in France or Luxembourg — SARL, SAS, SA, and more. We handle all paperwork: legal filing, registered address, and bank account setup.", target: "#svc-company-formation", position: "right" },
        { title: "Tax Advisory", content: "Certified tax advisors for individuals and businesses. We handle personal tax returns, corporate tax, VAT compliance, and cross-border tax planning.", target: "#svc-tax", position: "right" },
        { title: "Investment Advisory", content: "MiFID II-compliant investment advice and portfolio management. Our advisors build personalized strategies covering equities, bonds, ETFs, and ESG investments.", target: "#svc-investment", position: "right" },
        { title: "Life Insurance", content: "Expert insurance brokerage connecting you with leading providers. Term life, whole life, and unit-linked policies — tailored to individuals and families.", target: "#svc-insurance", position: "right" },
        { title: "SPV Investment", content: "Exclusive access to real estate and alternative assets through Special Purpose Vehicles. For qualified and institutional investors only.", target: "#svc-spv", position: "right" },
        { title: "Ready to Begin?", content: "Use the navigation bar to go anywhere — open an account, book a consultation, or contact our support team. We're here to help." },
      ],
    },
    fr: {
      title: "Bienvenue chez Opulanz",
      description: "Votre plateforme tout-en-un pour la banque, la fiscalité, les investissements et plus encore.",
      steps: [
        { content: "Bienvenue chez Opulanz — votre plateforme complète de services financiers. Laissez-nous vous présenter tout ce que nous proposons." },
        { title: "Comptabilité & Facturation", content: "Outils de comptabilité professionnels pour les entreprises — facturation automatisée, tenue de livres, paie, déclarations TVA et tableaux de bord financiers. Idéal pour les freelances et les PME.", target: "#svc-accounting", position: "right" },
        { title: "Ouvrir un Compte", content: "Ouvrez un compte bancaire personnel ou professionnel entièrement en ligne en moins de 5 minutes. Inclut IBAN, virements SEPA, cartes et conformité — agréé ACPR.", target: "#svc-open-account", position: "right" },
        { title: "Création d'Entreprise", content: "Immatriculez votre société en France ou au Luxembourg — SARL, SAS, SA, et plus. Nous gérons toutes les formalités : dépôt légal, adresse de siège et ouverture de compte.", target: "#svc-company-formation", position: "right" },
        { title: "Conseil Fiscal", content: "Conseillers fiscaux certifiés pour les particuliers et les entreprises. Nous gérons les déclarations de revenus, la fiscalité des sociétés, la conformité TVA et la planification fiscale transfrontalière.", target: "#svc-tax", position: "right" },
        { title: "Conseil en Investissement", content: "Conseil en investissement conforme MiFID II et gestion de portefeuille. Nos conseillers élaborent des stratégies personnalisées couvrant actions, obligations, ETF et investissements ESG.", target: "#svc-investment", position: "right" },
        { title: "Assurance Vie", content: "Courtage en assurance expert vous mettant en relation avec les meilleurs assureurs. Assurances temporaires, vie entière et en unités de compte — adaptées aux particuliers et aux familles.", target: "#svc-insurance", position: "right" },
        { title: "Investissement SPV", content: "Accès exclusif à l'immobilier et aux actifs alternatifs via des Véhicules à Vocation Spéciale. Réservé aux investisseurs qualifiés et institutionnels.", target: "#svc-spv", position: "right" },
        { title: "Prêt à Commencer ?", content: "Utilisez la barre de navigation pour aller où vous voulez — ouvrir un compte, réserver une consultation ou contacter notre équipe. Nous sommes là pour vous aider." },
      ],
    },
  },

  /* ── OPEN ACCOUNT ─────────────────────────────────────────────────────── */
  "open-account": {
    en: {
      title: "Open an Account",
      description: "Choose the account type that fits you best.",
      steps: [
        { content: "Welcome to Account Opening. You can open a personal account for yourself, or a business account for your company — both fully online." },
        { title: "Choose Your Account Type", content: "These two cards are your options. Select 'Personal' if you are an individual, or 'Business' if you are registering a company account.", target: "#account-types", position: "top" },
        { title: "Personal Account", content: "The Personal account is for individuals. You'll need a valid ID and proof of address. The process takes about 5 minutes.", target: "#account-personal", position: "right" },
        { title: "Business Account", content: "The Business account is for companies. You'll need company registration documents and a representative ID.", target: "#account-business", position: "left" },
      ],
      tip: "You will need a valid ID and proof of address to complete identity verification (KYC).",
    },
    fr: {
      title: "Ouvrir un Compte",
      description: "Choisissez le type de compte qui vous convient le mieux.",
      steps: [
        { content: "Bienvenue dans l'ouverture de compte. Vous pouvez ouvrir un compte personnel pour vous-même, ou un compte professionnel pour votre entreprise — entièrement en ligne." },
        { title: "Choisissez Votre Type de Compte", content: "Ces deux cartes sont vos options. Sélectionnez 'Personnel' si vous êtes un particulier, ou 'Professionnel' si vous ouvrez un compte pour une société.", target: "#account-types", position: "top" },
        { title: "Compte Personnel", content: "Le compte personnel est destiné aux particuliers. Vous aurez besoin d'une pièce d'identité valide et d'un justificatif de domicile. Le processus prend environ 5 minutes.", target: "#account-personal", position: "right" },
        { title: "Compte Professionnel", content: "Le compte professionnel est destiné aux sociétés. Vous aurez besoin des documents d'immatriculation de l'entreprise et d'une pièce d'identité du représentant.", target: "#account-business", position: "left" },
      ],
      tip: "Vous aurez besoin d'une pièce d'identité valide et d'un justificatif de domicile pour compléter la vérification d'identité (KYC).",
    },
  },

  /* ── OPEN ACCOUNT — INDIVIDUAL ────────────────────────────────────────── */
  "open-account-individual": {
    en: {
      title: "Personal Account Application",
      steps: [
        { content: "You're applying for a Personal Opulanz account. This form collects your identity details required by law (KYC). Have your ID and proof of address ready." },
        { title: "Progress Steps", content: "This progress bar shows where you are in the process. Each step must be completed before moving to the next.", target: ".mb-10.flex.items-center", position: "bottom" },
        { title: "Date of Birth", content: "Enter your date of birth. You must be at least 18 years old to open an account.", target: "#indv_dateOfBirth", position: "bottom" },
        { title: "Nationality", content: "Select your nationality from the dropdown. This is required for regulatory compliance.", target: "#indv_nationality", position: "bottom" },
        { title: "Phone Number", content: "Enter your phone number — it will be used for OTP verification and account security.", target: "#indv_phoneNumber", position: "bottom" },
        { title: "Home Address", content: "Enter your residential address exactly as it appears on your proof of address document.", target: "#indv_address", position: "bottom" },
      ],
      tip: "Have your passport or national ID and a recent utility bill or bank statement ready before starting.",
    },
    fr: {
      title: "Demande de Compte Personnel",
      steps: [
        { content: "Vous faites une demande de compte personnel Opulanz. Ce formulaire collecte vos informations d'identité requises par la loi (KYC). Ayez votre pièce d'identité et un justificatif de domicile à portée de main." },
        { title: "Étapes de Progression", content: "Cette barre de progression indique où vous en êtes dans le processus. Chaque étape doit être complétée avant de passer à la suivante.", target: ".mb-10.flex.items-center", position: "bottom" },
        { title: "Date de Naissance", content: "Entrez votre date de naissance. Vous devez avoir au moins 18 ans pour ouvrir un compte.", target: "#indv_dateOfBirth", position: "bottom" },
        { title: "Nationalité", content: "Sélectionnez votre nationalité dans le menu déroulant. Ceci est requis pour la conformité réglementaire.", target: "#indv_nationality", position: "bottom" },
        { title: "Numéro de Téléphone", content: "Entrez votre numéro de téléphone — il sera utilisé pour la vérification OTP et la sécurité du compte.", target: "#indv_phoneNumber", position: "bottom" },
        { title: "Adresse de Domicile", content: "Entrez votre adresse résidentielle exactement telle qu'elle apparaît sur votre justificatif de domicile.", target: "#indv_address", position: "bottom" },
      ],
      tip: "Ayez votre passeport ou carte nationale d'identité et une facture récente ou un relevé bancaire à portée de main avant de commencer.",
    },
  },

  /* ── OPEN ACCOUNT — COMPANY ────────────────────────────────────────────── */
  "open-account-company": {
    en: {
      title: "Company Account Application",
      steps: [
        { content: "You're applying for a Business Opulanz account. This form collects your company details required for Know Your Business (KYB) compliance. Have your incorporation documents ready." },
        { title: "Progress Steps", content: "This progress bar shows where you are in the process. Each step must be completed before moving to the next.", target: ".mb-10.flex.items-center", position: "bottom" },
        { title: "Registration Number", content: "Enter your company's official registration number — this is on your incorporation certificate.", target: "#comp_registrationNumber", position: "bottom" },
        { title: "Legal Form", content: "Select your company's legal structure (SARL, SAS, SA, Ltd, etc.) from this dropdown.", target: "#comp_legalForm", position: "bottom" },
        { title: "Representative Details", content: "Enter the details of the authorised representative — the person legally acting on behalf of the company.", target: "#comp_repFirstName", position: "bottom" },
      ],
      tip: "Have your Certificate of Incorporation, proof of company address, and a director's ID ready.",
    },
    fr: {
      title: "Demande de Compte Entreprise",
      steps: [
        { content: "Vous faites une demande de compte professionnel Opulanz. Ce formulaire collecte les informations de votre société requises pour la conformité KYB (Connaissance Client Entreprise). Ayez vos documents d'immatriculation à portée de main." },
        { title: "Étapes de Progression", content: "Cette barre de progression indique où vous en êtes dans le processus. Chaque étape doit être complétée avant de passer à la suivante.", target: ".mb-10.flex.items-center", position: "bottom" },
        { title: "Numéro d'Immatriculation", content: "Entrez le numéro d'immatriculation officiel de votre société — il figure sur votre certificat d'incorporation.", target: "#comp_registrationNumber", position: "bottom" },
        { title: "Forme Juridique", content: "Sélectionnez la structure juridique de votre société (SARL, SAS, SA, Ltd, etc.) dans ce menu déroulant.", target: "#comp_legalForm", position: "bottom" },
        { title: "Coordonnées du Représentant", content: "Entrez les coordonnées du représentant autorisé — la personne agissant légalement au nom de la société.", target: "#comp_repFirstName", position: "bottom" },
      ],
      tip: "Ayez votre certificat d'immatriculation, un justificatif d'adresse de l'entreprise et une pièce d'identité d'un dirigeant à portée de main.",
    },
  },

  /* ── OPEN ACCOUNT — PERSONAL (warm referral) ──────────────────────────── */
  "open-account-personal": {
    en: {
      title: "Personal Account",
      steps: [
        { content: "You're applying for a Personal Opulanz account. This form collects your identity details required by law (KYC). Have your ID and proof of address ready." },
        { title: "Progress Steps", content: "This progress bar shows where you are in the process. Each step must be completed before moving to the next.", target: ".mb-10.flex.items-center", position: "bottom" },
        { title: "Account Type", content: "First, choose whether you're signing up as an Individual or as a Business. This determines what features you'll have access to.", target: "select, [role='radiogroup'], .grid.gap-3", position: "bottom" },
      ],
      tip: "Have your passport or national ID and a recent utility bill ready.",
    },
    fr: {
      title: "Compte Personnel",
      steps: [
        { content: "Vous faites une demande de compte personnel Opulanz. Ce formulaire collecte vos informations d'identité requises par la loi (KYC). Ayez votre pièce d'identité et un justificatif de domicile à portée de main." },
        { title: "Étapes de Progression", content: "Cette barre de progression indique où vous en êtes dans le processus. Chaque étape doit être complétée avant de passer à la suivante.", target: ".mb-10.flex.items-center", position: "bottom" },
        { title: "Type de Compte", content: "Choisissez d'abord si vous vous inscrivez en tant que Particulier ou Entreprise. Cela détermine les fonctionnalités auxquelles vous aurez accès.", target: "select, [role='radiogroup'], .grid.gap-3", position: "bottom" },
      ],
      tip: "Ayez votre passeport ou carte nationale d'identité et une facture récente à portée de main.",
    },
  },

  /* ── OPEN ACCOUNT — BUSINESS ──────────────────────────────────────────── */
  "open-account-business": {
    en: {
      title: "Business Account",
      steps: [
        { content: "You're applying for a Business Opulanz account. This form collects your company details required for Know Your Business (KYB) compliance." },
        { title: "Progress Steps", content: "This progress bar shows where you are in the process. Each step must be completed before moving to the next.", target: ".mb-10.flex.items-center", position: "bottom" },
      ],
      tip: "Have your Certificate of Incorporation and a director's ID ready.",
    },
    fr: {
      title: "Compte Professionnel",
      steps: [
        { content: "Vous faites une demande de compte professionnel Opulanz. Ce formulaire collecte les informations de votre société requises pour la conformité KYB." },
        { title: "Étapes de Progression", content: "Cette barre de progression indique où vous en êtes dans le processus. Chaque étape doit être complétée avant de passer à la suivante.", target: ".mb-10.flex.items-center", position: "bottom" },
      ],
      tip: "Ayez votre certificat d'immatriculation et une pièce d'identité d'un dirigeant à portée de main.",
    },
  },

  /* ── COMPANY FORMATION ────────────────────────────────────────────────── */
  "company-formation": {
    en: {
      title: "Company Formation",
      description: "Register your business in France or Luxembourg — guided step by step.",
      steps: [
        { content: "Welcome to Company Formation. We'll help you register your business in France or Luxembourg — fully guided and handled by our team." },
        { title: "Our Services", content: "Below you'll find everything included in our formation service — legal filing, bank account setup, and compliance support.", target: "#services", position: "top" },
        { title: "Regulatory Trust", content: "Opulanz is regulated by ACPR, AMF, and CSSF. These credentials guarantee your money is safe and protected.", target: "#regulatory", position: "top" },
      ],
      tip: "Not sure which structure to choose? SAS is the most flexible option for startups and growing businesses.",
    },
    fr: {
      title: "Création d'Entreprise",
      description: "Immatriculez votre société en France ou au Luxembourg — guidé pas à pas.",
      steps: [
        { content: "Bienvenue dans la Création d'Entreprise. Nous allons vous aider à immatriculer votre société en France ou au Luxembourg — entièrement guidé et géré par notre équipe." },
        { title: "Nos Services", content: "Vous trouverez ci-dessous tout ce qui est inclus dans notre service de création — dépôt légal, ouverture de compte bancaire et accompagnement conformité.", target: "#services", position: "top" },
        { title: "Confiance Réglementaire", content: "Opulanz est agréé par l'ACPR, l'AMF et la CSSF. Ces accréditations garantissent que votre argent est en sécurité et protégé.", target: "#regulatory", position: "top" },
      ],
      tip: "Vous ne savez pas quelle structure choisir ? La SAS est l'option la plus flexible pour les startups et les entreprises en croissance.",
    },
  },

  /* ── TAX ADVISORY ─────────────────────────────────────────────────────── */
  "tax-advisory": {
    en: {
      title: "Tax Advisory",
      description: "Expert tax guidance for individuals and businesses.",
      steps: [
        { content: "Welcome to Tax Advisory. Our certified tax advisors help individuals and businesses with returns, planning, compliance, and more." },
        { title: "Our Services", content: "These cards show all available tax services with pricing. Each one can be booked directly — click any card to get started.", target: "#services", position: "top" },
        { title: "Book Now", content: "Click 'Book a Consultation' to go straight to scheduling. You'll pick a date, time, and complete payment online.", target: "a[href*='tax-advisory/booking']", position: "bottom" },
      ],
      tip: "Your first consultation includes a free 15-minute discovery call.",
    },
    fr: {
      title: "Conseil Fiscal",
      description: "Conseil fiscal expert pour les particuliers et les entreprises.",
      steps: [
        { content: "Bienvenue au Conseil Fiscal. Nos conseillers fiscaux certifiés accompagnent les particuliers et les entreprises pour les déclarations, la planification, la conformité et bien plus encore." },
        { title: "Nos Services", content: "Ces cartes présentent tous les services fiscaux disponibles avec leurs tarifs. Chacun peut être réservé directement — cliquez sur une carte pour commencer.", target: "#services", position: "top" },
        { title: "Réserver Maintenant", content: "Cliquez sur 'Réserver une consultation' pour accéder directement à la planification. Vous choisirez une date, un horaire et effectuerez le paiement en ligne.", target: "a[href*='tax-advisory/booking']", position: "bottom" },
      ],
      tip: "Votre première consultation inclut un appel découverte gratuit de 15 minutes.",
    },
  },

  /* ── TAX ADVISORY BOOKING ─────────────────────────────────────────────── */
  "tax-advisory-booking": {
    en: {
      title: "Book a Tax Consultation",
      description: "4 simple steps to get expert advice.",
      steps: [
        { content: "Welcome to the booking flow. Booking your tax consultation takes just 4 steps — contact info, date selection, review, and payment." },
        { title: "Your Details", content: "Step 1: Enter your name, email, and phone number. We'll use these to confirm your booking and send the meeting link.", target: "[data-tour='contact-info']", position: "bottom" },
        { title: "Pick a Date", content: "Step 2: Select your preferred date and time from the calendar. Available slots are shown in green.", target: "[data-tour='calendar']", position: "bottom" },
        { title: "Review & Pay", content: "Step 3 & 4: Review your booking details and complete payment via PayPal. You'll receive a confirmation email immediately.", target: "[data-tour='payment']", position: "top" },
      ],
      tip: "You'll receive a calendar invite and meeting link by email immediately after payment.",
    },
    fr: {
      title: "Réserver une Consultation Fiscale",
      description: "4 étapes simples pour obtenir des conseils d'experts.",
      steps: [
        { content: "Bienvenue dans le processus de réservation. Réserver votre consultation fiscale ne prend que 4 étapes — coordonnées, sélection de date, vérification et paiement." },
        { title: "Vos Coordonnées", content: "Étape 1 : Entrez votre nom, email et numéro de téléphone. Nous les utiliserons pour confirmer votre réservation et envoyer le lien de réunion.", target: "[data-tour='contact-info']", position: "bottom" },
        { title: "Choisir une Date", content: "Étape 2 : Sélectionnez votre date et horaire préférés dans le calendrier. Les créneaux disponibles sont indiqués en vert.", target: "[data-tour='calendar']", position: "bottom" },
        { title: "Vérification & Paiement", content: "Étapes 3 et 4 : Vérifiez les détails de votre réservation et effectuez le paiement via PayPal. Vous recevrez un email de confirmation immédiatement.", target: "[data-tour='payment']", position: "top" },
      ],
      tip: "Vous recevrez une invitation calendrier et un lien de réunion par email immédiatement après le paiement.",
    },
  },

  /* ── LIFE INSURANCE ────────────────────────────────────────────────────── */
  "life-insurance": {
    en: {
      title: "Life Insurance",
      description: "Find the right life insurance for you and your family.",
      steps: [
        { content: "Welcome to Life Insurance. We offer term life, whole life, and unit-linked policies tailored for individuals and families in France and Luxembourg." },
        { title: "What We Offer", content: "This section explains what life insurance covers and how Opulanz's policies are structured — benefits, coverage amounts, and who qualifies.", target: "#overview", position: "bottom" },
        { title: "Our Products", content: "Browse all available insurance products here. Each card shows the coverage type, key benefits, and pricing range.", target: "#products", position: "top" },
        { title: "Get a Quote", content: "Ready? Click this button to schedule a call with a licensed advisor who will tailor a plan specifically for you.", target: "a[href*='life-insurance/schedule']", position: "bottom" },
      ],
      tip: "Term life is the most affordable option — ideal for individuals aged 25–55 looking for family protection.",
    },
    fr: {
      title: "Assurance Vie",
      description: "Trouvez la bonne assurance vie pour vous et votre famille.",
      steps: [
        { content: "Bienvenue en Assurance Vie. Nous proposons des assurances temporaires, vie entière et en unités de compte adaptées aux particuliers et aux familles en France et au Luxembourg." },
        { title: "Ce Que Nous Proposons", content: "Cette section explique ce que couvre l'assurance vie et comment les polices d'Opulanz sont structurées — avantages, montants de couverture et conditions d'éligibilité.", target: "#overview", position: "bottom" },
        { title: "Nos Produits", content: "Parcourez tous les produits d'assurance disponibles ici. Chaque carte indique le type de couverture, les avantages clés et la fourchette de prix.", target: "#products", position: "top" },
        { title: "Obtenir un Devis", content: "Prêt ? Cliquez sur ce bouton pour planifier un appel avec un conseiller agréé qui adaptera un plan spécifiquement pour vous.", target: "a[href*='life-insurance/schedule']", position: "bottom" },
      ],
      tip: "L'assurance temporaire est l'option la plus abordable — idéale pour les personnes âgées de 25 à 55 ans cherchant une protection familiale.",
    },
  },

  /* ── INVESTMENT ADVISORY ──────────────────────────────────────────────── */
  "investment-advisory": {
    en: {
      title: "Investment Advisory",
      description: "MiFID II-compliant wealth management tailored to your goals.",
      steps: [
        { content: "Welcome to Investment Advisory. Our MiFID II-compliant advisors will build a strategy tailored to your goals and risk profile." },
        { title: "Our Services", content: "Here are all our investment services — portfolio management, retirement planning, ESG investing, and more. Browse and choose what fits your needs.", target: "#advisory-services", position: "top" },
        { title: "Schedule a Meeting", content: "Ready to get started? Click this button to schedule a free discovery call with one of our certified advisors.", target: "a[href*='investment-advisory/schedule']", position: "bottom" },
      ],
      tip: "All our advisors are MiFID II compliant and regulated by AMF/CSSF.",
    },
    fr: {
      title: "Conseil en Investissement",
      description: "Gestion de patrimoine conforme MiFID II adaptée à vos objectifs.",
      steps: [
        { content: "Bienvenue au Conseil en Investissement. Nos conseillers conformes MiFID II élaboreront une stratégie adaptée à vos objectifs et à votre profil de risque." },
        { title: "Nos Services", content: "Voici tous nos services d'investissement — gestion de portefeuille, planification retraite, investissement ESG et plus encore. Parcourez et choisissez ce qui correspond à vos besoins.", target: "#advisory-services", position: "top" },
        { title: "Planifier une Réunion", content: "Prêt à commencer ? Cliquez sur ce bouton pour planifier un appel découverte gratuit avec l'un de nos conseillers certifiés.", target: "a[href*='investment-advisory/schedule']", position: "bottom" },
      ],
      tip: "Tous nos conseillers sont conformes MiFID II et agréés par l'AMF/CSSF.",
    },
  },

  /* ── INVOICING & ACCOUNTING ────────────────────────────────────────────── */
  "invoicing-accounting": {
    en: {
      title: "Invoicing & Accounting",
      description: "All your financial management in one place.",
      steps: [
        { content: "Welcome to Invoicing & Accounting. This platform handles your invoices, bookkeeping, payroll, and financial reporting — all in one place." },
        { title: "Platform Features", content: "These cards highlight the core features — automated invoicing, real-time bookkeeping, payroll management, and tax reporting.", target: "#features", position: "top" },
        { title: "Get Started", content: "Click 'Get Started' to begin your onboarding. You can import existing data from QuickBooks, Xero, or Excel.", target: "a[href*='onboarding']", position: "bottom" },
      ],
      tip: "You can import existing data from QuickBooks, Xero, or Excel during onboarding.",
    },
    fr: {
      title: "Facturation & Comptabilité",
      description: "Toute votre gestion financière en un seul endroit.",
      steps: [
        { content: "Bienvenue dans Facturation & Comptabilité. Cette plateforme gère vos factures, votre comptabilité, votre paie et vos rapports financiers — tout en un seul endroit." },
        { title: "Fonctionnalités de la Plateforme", content: "Ces cartes mettent en avant les fonctionnalités principales — facturation automatisée, tenue de livres en temps réel, gestion de la paie et déclarations fiscales.", target: "#features", position: "top" },
        { title: "Commencer", content: "Cliquez sur 'Commencer' pour démarrer votre onboarding. Vous pouvez importer des données existantes depuis QuickBooks, Xero ou Excel.", target: "a[href*='onboarding']", position: "bottom" },
      ],
      tip: "Vous pouvez importer des données existantes depuis QuickBooks, Xero ou Excel lors de l'onboarding.",
    },
  },

  /* ── SPV INVESTMENT ────────────────────────────────────────────────────── */
  "spv-investment": {
    en: {
      title: "SPV Investment Portal",
      description: "Exclusive real estate investment for qualified investors.",
      steps: [
        { content: "Welcome to the SPV Investment Portal. This section is for qualified investors interested in real estate and alternative assets through Special Purpose Vehicles." },
        { title: "What is an SPV?", content: "This section explains how SPV structures work — how they isolate assets, protect investors, and enable co-investment in premium deals.", target: "#what-is-spv", position: "bottom" },
        { title: "Express Interest", content: "Use this form to register your interest. Enter your name, email, and investor type — our team will reach out to discuss eligibility.", target: "#contact", position: "top" },
      ],
      tip: "SPV investments are reserved for qualified and institutional investors only.",
    },
    fr: {
      title: "Portail d'Investissement SPV",
      description: "Investissement immobilier exclusif pour investisseurs qualifiés.",
      steps: [
        { content: "Bienvenue au Portail d'Investissement SPV. Cette section est destinée aux investisseurs qualifiés intéressés par l'immobilier et les actifs alternatifs via des Véhicules à Vocation Spéciale." },
        { title: "Qu'est-ce qu'un SPV ?", content: "Cette section explique le fonctionnement des structures SPV — comment elles isolent les actifs, protègent les investisseurs et permettent le co-investissement dans des opportunités premium.", target: "#what-is-spv", position: "bottom" },
        { title: "Manifester son Intérêt", content: "Utilisez ce formulaire pour enregistrer votre intérêt. Entrez votre nom, email et type d'investisseur — notre équipe vous contactera pour discuter de votre éligibilité.", target: "#contact", position: "top" },
      ],
      tip: "Les investissements SPV sont réservés aux investisseurs qualifiés et institutionnels uniquement.",
    },
  },

  /* ── SUPPORT ───────────────────────────────────────────────────────────── */
  support: {
    en: {
      title: "Support Center",
      description: "We're here to help — anytime, any way.",
      steps: [
        { content: "Welcome to the Opulanz Support Center. We're here to help you via form, live chat, or phone — whichever you prefer." },
        { title: "Contact Methods", content: "These cards show all the ways to reach us — email, phone, and live chat. Choose whatever works best for you.", target: "section.bg-white:first-of-type", position: "bottom" },
        { title: "Contact Form", content: "Fill in your name, email, and message here to send us a request. We respond within 2 business hours.", target: "#email", position: "top" },
      ],
      tip: "Most inquiries are resolved within 2 business hours during weekdays.",
    },
    fr: {
      title: "Centre d'Assistance",
      description: "Nous sommes là pour vous aider — à tout moment, de toutes les façons.",
      steps: [
        { content: "Bienvenue au Centre d'Assistance Opulanz. Nous sommes là pour vous aider par formulaire, chat en direct ou téléphone — à votre convenance." },
        { title: "Méthodes de Contact", content: "Ces cartes présentent toutes les façons de nous joindre — email, téléphone et chat en direct. Choisissez ce qui vous convient le mieux.", target: "section.bg-white:first-of-type", position: "bottom" },
        { title: "Formulaire de Contact", content: "Remplissez votre nom, email et message ici pour nous envoyer une demande. Nous répondons dans les 2 heures ouvrables.", target: "#email", position: "top" },
      ],
      tip: "La plupart des demandes sont résolues dans les 2 heures ouvrables en semaine.",
    },
  },

  /* ── ABOUT ─────────────────────────────────────────────────────────────── */
  about: {
    en: {
      title: "About Opulanz",
      description: "Learn who we are and what drives us.",
      steps: [
        { content: "Welcome to the About page. Let us walk you through who we are and why clients trust Opulanz." },
        { title: "Our Story", content: "This section tells the story behind Opulanz — our mission and vision for accessible, premium financial services.", target: "#story", position: "bottom" },
        { title: "Regulatory Trust", content: "Opulanz is regulated by ACPR, AMF, and CSSF. These credentials guarantee your money is safe and protected.", target: "#regulatory", position: "top" },
      ],
      tip: "Regulated by ACPR, AMF, and CSSF — your money is always safe with Opulanz.",
    },
    fr: {
      title: "À Propos d'Opulanz",
      description: "Découvrez qui nous sommes et ce qui nous anime.",
      steps: [
        { content: "Bienvenue sur la page À Propos. Laissez-nous vous présenter qui nous sommes et pourquoi les clients font confiance à Opulanz." },
        { title: "Notre Histoire", content: "Cette section raconte l'histoire derrière Opulanz — notre mission et notre vision pour des services financiers accessibles et premium.", target: "#story", position: "bottom" },
        { title: "Confiance Réglementaire", content: "Opulanz est agréé par l'ACPR, l'AMF et la CSSF. Ces accréditations garantissent que votre argent est en sécurité et protégé.", target: "#regulatory", position: "top" },
      ],
      tip: "Agréé par l'ACPR, l'AMF et la CSSF — votre argent est toujours en sécurité chez Opulanz.",
    },
  },

  /* ── AUTH — SIGN IN ────────────────────────────────────────────────────── */
  "auth-signin": {
    en: {
      title: "Sign In",
      description: "Access your Opulanz account securely.",
      steps: [
        { content: "Welcome back to Opulanz. Signing in is secure and takes just seconds." },
        { title: "Your Credentials", content: "Enter your email address and password here. All data is encrypted and never shared.", target: "input[type='email']", position: "bottom" },
        { title: "Forgot Password?", content: "Click 'Forgot password?' below the form if you can't remember your password. We'll send a reset link to your email.", target: "a[href*='forgot']", position: "bottom" },
      ],
      tip: "Forgot your password? Click the 'Forgot password?' link below the sign-in form to reset it.",
    },
    fr: {
      title: "Se Connecter",
      description: "Accédez à votre compte Opulanz en toute sécurité.",
      steps: [
        { content: "Bienvenue chez Opulanz. La connexion est sécurisée et ne prend que quelques secondes." },
        { title: "Vos Identifiants", content: "Entrez votre adresse email et votre mot de passe ici. Toutes les données sont chiffrées et jamais partagées.", target: "input[type='email']", position: "bottom" },
        { title: "Mot de Passe Oublié ?", content: "Cliquez sur 'Mot de passe oublié ?' sous le formulaire si vous ne vous souvenez pas de votre mot de passe. Nous vous enverrons un lien de réinitialisation.", target: "a[href*='forgot']", position: "bottom" },
      ],
      tip: "Mot de passe oublié ? Cliquez sur le lien 'Mot de passe oublié ?' sous le formulaire de connexion pour le réinitialiser.",
    },
  },

  /* ── AUTH — SIGN UP ────────────────────────────────────────────────────── */
  "auth-signup": {
    en: {
      title: "Create Your Account",
      description: "Sign up for Opulanz in just a few steps.",
      steps: [
        { content: "Let's create your Opulanz account. The signup process takes less than 2 minutes." },
        { title: "Account Type", content: "First, choose whether you're signing up as an Individual or as a Business. This determines what features you'll have access to.", target: "select, [role='radiogroup'], .grid.gap-3", position: "bottom" },
        { title: "Your Details", content: "Fill in your name, email, and a strong password. Your password must be at least 8 characters long.", target: "input[name='email']", position: "bottom" },
      ],
      tip: "Use a strong password with uppercase letters, numbers, and symbols.",
    },
    fr: {
      title: "Créer Votre Compte",
      description: "Inscrivez-vous chez Opulanz en quelques étapes seulement.",
      steps: [
        { content: "Créons votre compte Opulanz. Le processus d'inscription prend moins de 2 minutes." },
        { title: "Type de Compte", content: "Choisissez d'abord si vous vous inscrivez en tant que Particulier ou Entreprise. Cela détermine les fonctionnalités auxquelles vous aurez accès.", target: "select, [role='radiogroup'], .grid.gap-3", position: "bottom" },
        { title: "Vos Informations", content: "Remplissez votre nom, email et un mot de passe robuste. Votre mot de passe doit comporter au moins 8 caractères.", target: "input[name='email']", position: "bottom" },
      ],
      tip: "Utilisez un mot de passe robuste avec des majuscules, des chiffres et des symboles.",
    },
  },

  /* ── LOGIN ─────────────────────────────────────────────────────────────── */
  login: {
    en: {
      title: "Sign In to Opulanz",
      description: "Access your account securely.",
      steps: [
        { content: "Welcome back. Sign in securely to access your Opulanz dashboard, portfolio, and services." },
        { title: "Your Credentials", content: "Enter your email address and password here. All data is encrypted.", target: "input[type='email']", position: "bottom" },
      ],
      tip: "Don't have an account yet? Click 'Create account' below the form to register.",
    },
    fr: {
      title: "Connexion à Opulanz",
      description: "Accédez à votre compte en toute sécurité.",
      steps: [
        { content: "Bienvenue. Connectez-vous en toute sécurité pour accéder à votre tableau de bord, portefeuille et services Opulanz." },
        { title: "Vos Identifiants", content: "Entrez votre adresse email et votre mot de passe ici. Toutes les données sont chiffrées.", target: "input[type='email']", position: "bottom" },
      ],
      tip: "Vous n'avez pas encore de compte ? Cliquez sur 'Créer un compte' sous le formulaire pour vous inscrire.",
    },
  },

  /* ── SIGNUP ────────────────────────────────────────────────────────────── */
  signup: {
    en: {
      title: "Create Your Account",
      description: "Sign up for Opulanz — takes less than 2 minutes.",
      steps: [
        { content: "Let's create your Opulanz account. The signup process takes less than 2 minutes." },
        { title: "Account Type", content: "First, choose whether you're signing up as an Individual or as a Business.", target: "select, [role='radiogroup'], .grid.gap-3", position: "bottom" },
      ],
      tip: "Use a strong password with uppercase letters, numbers, and symbols.",
    },
    fr: {
      title: "Créer Votre Compte",
      description: "Inscrivez-vous chez Opulanz — prend moins de 2 minutes.",
      steps: [
        { content: "Créons votre compte Opulanz. Le processus d'inscription prend moins de 2 minutes." },
        { title: "Type de Compte", content: "Choisissez d'abord si vous vous inscrivez en tant que Particulier ou Entreprise.", target: "select, [role='radiogroup'], .grid.gap-3", position: "bottom" },
      ],
      tip: "Utilisez un mot de passe robuste avec des majuscules, des chiffres et des symboles.",
    },
  },

  /* ── DASHBOARD ─────────────────────────────────────────────────────────── */
  dashboard: {
    en: {
      title: "Your Dashboard",
      steps: [
        { title: "Welcome to your Dashboard", description: "This is your financial control center. Let me walk you through each section." },
        { element: "[data-tour='kyc-banner']", title: "⚠️ Verify Your Identity First", description: "You must complete KYC before you can send money or use full features. Click 'Verify Now' to start — it takes about 3 minutes.", side: "bottom" },
        { element: "[data-tour='balance-card']", title: "Your Total Balance", description: "This card shows your combined balance across ALL your accounts. Use the 👁 eye icon to hide or reveal the numbers.", side: "bottom" },
        { element: "[data-tour='quick-actions']", title: "Quick Actions", description: "From here you can: Send Money to anyone, Exchange currencies, and Manage your Cards. These are your most used actions.", side: "left" },
        { element: "[data-tour='spending-chart']", title: "Weekly Spending Chart", description: "Gold bars = your expenses. Green bars = money received. Use the filter dropdown to switch between This Week, Last Week, or This Month.", side: "top" },
      ],
    },
    fr: {
      title: "Votre Tableau de Bord",
      steps: [
        { title: "Bienvenue sur votre Tableau de Bord", description: "C'est votre centre de contrôle financier. Laissez-moi vous guider à travers chaque section." },
        { element: "[data-tour='kyc-banner']", title: "⚠️ Vérifiez Votre Identité d'Abord", description: "Vous devez compléter le KYC avant de pouvoir envoyer de l'argent ou utiliser toutes les fonctionnalités. Cliquez sur 'Vérifier maintenant' pour commencer — cela prend environ 3 minutes.", side: "bottom" },
        { element: "[data-tour='balance-card']", title: "Votre Solde Total", description: "Cette carte affiche votre solde combiné sur TOUS vos comptes. Utilisez l'icône 👁 œil pour masquer ou afficher les montants.", side: "bottom" },
        { element: "[data-tour='quick-actions']", title: "Actions Rapides", description: "De là, vous pouvez : Envoyer de l'argent à n'importe qui, Échanger des devises et Gérer vos Cartes. Ce sont vos actions les plus utilisées.", side: "left" },
        { element: "[data-tour='spending-chart']", title: "Graphique de Dépenses Hebdomadaires", description: "Barres dorées = vos dépenses. Barres vertes = argent reçu. Utilisez le menu déroulant pour basculer entre Cette semaine, La semaine dernière ou Ce mois-ci.", side: "top" },
      ],
    },
  },

  /* ── DASHBOARD — ACCOUNTS ──────────────────────────────────────────────── */
  "dashboard-accounts": {
    en: {
      title: "Your Accounts",
      steps: [
        { title: "Your Accounts", description: "Here you can see all your bank accounts and their balances. Let me walk you through." },
        { element: "h1", title: "Accounts Overview", description: "This page lists all your accounts: EUR, USD, GBP and any others. The total combined balance is shown at the top.", side: "bottom" },
        { element: "[data-tour='account-iban']", title: "Your IBAN Number", description: "This is your account IBAN. Click the copy icon next to it to copy it — share this with anyone who needs to pay you.", side: "bottom" },
      ],
    },
    fr: {
      title: "Vos Comptes",
      steps: [
        { title: "Vos Comptes", description: "Ici, vous pouvez voir tous vos comptes bancaires et leurs soldes. Laissez-moi vous guider." },
        { element: "h1", title: "Vue d'Ensemble des Comptes", description: "Cette page liste tous vos comptes : EUR, USD, GBP et autres. Le solde combiné total est affiché en haut.", side: "bottom" },
        { element: "[data-tour='account-iban']", title: "Votre Numéro IBAN", description: "C'est votre IBAN de compte. Cliquez sur l'icône de copie à côté pour le copier — partagez-le avec toute personne qui doit vous payer.", side: "bottom" },
      ],
    },
  },

  /* ── DASHBOARD — CARDS ─────────────────────────────────────────────────── */
  "dashboard-cards": {
    en: {
      title: "Your Cards",
      steps: [
        { title: "Your Cards", description: "Here you can manage all your physical and virtual cards. Let me walk you through the page." },
        { element: "[data-tour='card-actions']", title: "Quick Actions", description: "Freeze your card instantly if it's lost or stolen. You can also change your PIN or report a lost card here.", side: "top" },
        { element: "[data-tour='card-settings']", title: "Card Settings", description: "Toggle online payments, contactless, ATM withdrawals, and international use on or off with these switches.", side: "left" },
      ],
    },
    fr: {
      title: "Vos Cartes",
      steps: [
        { title: "Vos Cartes", description: "Ici, vous pouvez gérer toutes vos cartes physiques et virtuelles. Laissez-moi vous guider sur cette page." },
        { element: "[data-tour='card-actions']", title: "Actions Rapides", description: "Bloquez votre carte instantanément si elle est perdue ou volée. Vous pouvez également changer votre code PIN ou signaler une carte perdue ici.", side: "top" },
        { element: "[data-tour='card-settings']", title: "Paramètres de la Carte", description: "Activez ou désactivez les paiements en ligne, le sans contact, les retraits aux distributeurs et l'utilisation internationale avec ces interrupteurs.", side: "left" },
      ],
    },
  },

  /* ── DASHBOARD — SEND ──────────────────────────────────────────────────── */
  "dashboard-send": {
    en: {
      title: "Send Money",
      steps: [
        { title: "Send Money", description: "This page lets you transfer money to your own accounts or to anyone else's bank. Let me guide you through each field." },
        { element: "[data-tour='beneficiary']", title: "Step 3 — Who Are You Sending To?", description: "Search for a saved beneficiary by name or IBAN. Or click '+ Add New Beneficiary' to add someone new.", side: "bottom" },
        { element: "[data-tour='amount']", title: "Step 4 — Enter the Amount", description: "Type the amount you want to send here. The transfer type (SEPA, SWIFT, Domestic) is automatically detected from the IBAN.", side: "bottom" },
        { element: "[data-tour='reference']", title: "Step 5 — Reference / Description", description: "Add a payment reference here — for example an invoice number. The recipient will see this on their bank statement.", side: "bottom" },
        { element: "[data-tour='confirm-btn']", title: "Step 6 — Confirm & Send", description: "Once all fields are filled, this button becomes active. Click it to review and confirm your transfer.", side: "top" },
      ],
    },
    fr: {
      title: "Envoyer de l'Argent",
      steps: [
        { title: "Envoyer de l'Argent", description: "Cette page vous permet de transférer de l'argent vers vos propres comptes ou vers la banque de quelqu'un d'autre. Laissez-moi vous guider à travers chaque champ." },
        { element: "[data-tour='beneficiary']", title: "Étape 3 — À Qui Envoyez-vous ?", description: "Recherchez un bénéficiaire enregistré par nom ou IBAN. Ou cliquez sur '+ Ajouter un bénéficiaire' pour en ajouter un nouveau.", side: "bottom" },
        { element: "[data-tour='amount']", title: "Étape 4 — Entrez le Montant", description: "Tapez le montant que vous souhaitez envoyer ici. Le type de transfert (SEPA, SWIFT, National) est automatiquement détecté à partir de l'IBAN.", side: "bottom" },
        { element: "[data-tour='reference']", title: "Étape 5 — Référence / Description", description: "Ajoutez une référence de paiement ici — par exemple un numéro de facture. Le destinataire le verra sur son relevé bancaire.", side: "bottom" },
        { element: "[data-tour='confirm-btn']", title: "Étape 6 — Confirmer & Envoyer", description: "Une fois tous les champs remplis, ce bouton devient actif. Cliquez dessus pour vérifier et confirmer votre virement.", side: "top" },
      ],
    },
  },

  /* ── DASHBOARD — EXCHANGE ──────────────────────────────────────────────── */
  "dashboard-exchange": {
    en: {
      title: "Currency Exchange",
      steps: [
        { title: "Currency Exchange", description: "Convert money between currencies at live market rates. Let me show you how to use this page." },
        { element: "[data-tour='exchange-amount']", title: "Enter the Amount", description: "Type the amount here. The converted amount updates automatically in real time as you type.", side: "bottom" },
        { element: "[data-tour='exchange-rate']", title: "Live Exchange Rate", description: "This shows the current market rate. Rates refresh automatically — always review before confirming.", side: "top" },
        { element: "[data-tour='exchange-btn']", title: "Confirm Exchange", description: "Click this button to execute the currency conversion. Funds are moved between your accounts instantly.", side: "top" },
      ],
    },
    fr: {
      title: "Change de Devises",
      steps: [
        { title: "Change de Devises", description: "Convertissez de l'argent entre devises aux taux du marché en temps réel. Laissez-moi vous montrer comment utiliser cette page." },
        { element: "[data-tour='exchange-amount']", title: "Entrez le Montant", description: "Tapez le montant ici. Le montant converti se met à jour automatiquement en temps réel au fur et à mesure que vous tapez.", side: "bottom" },
        { element: "[data-tour='exchange-rate']", title: "Taux de Change en Direct", description: "Ceci affiche le taux du marché actuel. Les taux se rafraîchissent automatiquement — vérifiez toujours avant de confirmer.", side: "top" },
        { element: "[data-tour='exchange-btn']", title: "Confirmer le Change", description: "Cliquez sur ce bouton pour effectuer la conversion de devises. Les fonds sont déplacés entre vos comptes instantanément.", side: "top" },
      ],
    },
  },

  /* ── DASHBOARD — TRANSACTIONS ──────────────────────────────────────────── */
  "dashboard-transactions": {
    en: {
      title: "Transaction History",
      steps: [
        { title: "Transaction History", description: "Here you can see every movement in your account — incoming and outgoing. Let me show you around." },
        { element: "[data-tour='tx-filter']", title: "Filter by Type", description: "Click All, Incoming, or Outgoing to quickly narrow down what you see.", side: "left" },
        { element: "[data-tour='tx-export']", title: "Export Statement", description: "Download your transactions as a PDF bank statement or a CSV file. Accepted by most banks and institutions.", side: "bottom" },
      ],
    },
    fr: {
      title: "Historique des Transactions",
      steps: [
        { title: "Historique des Transactions", description: "Ici, vous pouvez voir chaque mouvement sur votre compte — entrant et sortant. Laissez-moi vous montrer." },
        { element: "[data-tour='tx-filter']", title: "Filtrer par Type", description: "Cliquez sur Tous, Entrants ou Sortants pour affiner rapidement ce que vous voyez.", side: "left" },
        { element: "[data-tour='tx-export']", title: "Exporter le Relevé", description: "Téléchargez vos transactions sous forme de relevé bancaire PDF ou de fichier CSV. Accepté par la plupart des banques et institutions.", side: "bottom" },
      ],
    },
  },

  /* ── DASHBOARD — INVOICES ──────────────────────────────────────────────── */
  "dashboard-invoices": {
    en: {
      title: "Invoices",
      steps: [
        { title: "Invoices", description: "Create, send, and track invoices for your clients — all in one place. Let me show you how." },
        { element: "[data-tour='invoice-table']", title: "Invoice List", description: "Each row shows the invoice number, client, amount, and status. Use the action buttons to view, email, download, or manage each invoice.", side: "top" },
        { element: "button.bg-\\[\\#b59354\\]", title: "Create a New Invoice", description: "Click here to create a new invoice. Fill in your client details, line items, and due date — then send it directly from here.", side: "bottom" },
      ],
    },
    fr: {
      title: "Factures",
      steps: [
        { title: "Factures", description: "Créez, envoyez et suivez les factures de vos clients — tout en un seul endroit. Laissez-moi vous montrer comment." },
        { element: "[data-tour='invoice-table']", title: "Liste des Factures", description: "Chaque ligne affiche le numéro de facture, le client, le montant et le statut. Utilisez les boutons d'action pour voir, envoyer par email, télécharger ou gérer chaque facture.", side: "top" },
        { element: "button.bg-\\[\\#b59354\\]", title: "Créer une Nouvelle Facture", description: "Cliquez ici pour créer une nouvelle facture. Remplissez les coordonnées de votre client, les articles et la date d'échéance — puis envoyez-la directement depuis ici.", side: "bottom" },
      ],
    },
  },

  /* ── DASHBOARD — SETTINGS ──────────────────────────────────────────────── */
  "dashboard-settings": {
    en: {
      title: "Account Settings",
      steps: [
        { title: "Account Settings", description: "Here you can manage your profile, security, notifications, and display preferences. Let me show you each section." },
        { element: "[data-tour='settings-tabs']", title: "Settings Tabs", description: "Use these tabs to navigate between Profile, Security, Notifications, and Preferences.", side: "bottom" },
        { element: "[data-tour='settings-security']", title: "Security Settings", description: "Enable two-factor authentication, change your password, view login history, and manage trusted devices.", side: "top" },
      ],
    },
    fr: {
      title: "Paramètres du Compte",
      steps: [
        { title: "Paramètres du Compte", description: "Ici, vous pouvez gérer votre profil, la sécurité, les notifications et les préférences d'affichage. Laissez-moi vous montrer chaque section." },
        { element: "[data-tour='settings-tabs']", title: "Onglets des Paramètres", description: "Utilisez ces onglets pour naviguer entre Profil, Sécurité, Notifications et Préférences.", side: "bottom" },
        { element: "[data-tour='settings-security']", title: "Paramètres de Sécurité", description: "Activez l'authentification à deux facteurs, changez votre mot de passe, consultez l'historique des connexions et gérez les appareils de confiance.", side: "top" },
      ],
    },
  },

  /* ── DASHBOARD — SUPPORT ────────────────────────────────────────────────── */
  "dashboard-support": {
    en: {
      title: "Help & Support",
      steps: [
        { title: "Help & Support", description: "Find answers fast or get in touch with our support team. Let me show you what's available here." },
        { element: "[data-tour='support-search']", title: "Search Knowledge Base", description: "Type your question here to instantly search our help articles and FAQs.", side: "bottom" },
        { element: "[data-tour='support-contact']", title: "Contact Us", description: "Use Live Chat for instant support, or call/email us. Live chat is available Mon–Fri, 8am–8pm EET.", side: "left" },
        { element: "[data-tour='support-tickets']", title: "My Support Tickets", description: "View and track all your open and resolved support tickets. Click 'Create New Ticket' to start a new request.", side: "left" },
      ],
    },
    fr: {
      title: "Aide & Assistance",
      steps: [
        { title: "Aide & Assistance", description: "Trouvez des réponses rapidement ou contactez notre équipe d'assistance. Laissez-moi vous montrer ce qui est disponible ici." },
        { element: "[data-tour='support-search']", title: "Rechercher dans la Base de Connaissances", description: "Tapez votre question ici pour rechercher instantanément nos articles d'aide et FAQ.", side: "bottom" },
        { element: "[data-tour='support-contact']", title: "Nous Contacter", description: "Utilisez le Chat en Direct pour une assistance instantanée, ou appelez/envoyez-nous un email. Le chat en direct est disponible Lun–Ven, 8h–20h HEE.", side: "left" },
        { element: "[data-tour='support-tickets']", title: "Mes Tickets d'Assistance", description: "Consultez et suivez tous vos tickets d'assistance ouverts et résolus. Cliquez sur 'Créer un ticket' pour démarrer une nouvelle demande.", side: "left" },
      ],
    },
  },
};

/**
 * Returns the guidance content for a given page and locale.
 * Falls back to English if the locale is not 'fr'.
 */
export function getGuidanceContent(locale: string, pageKey: string): GuidanceContent | null {
  const entry = content[pageKey];
  if (!entry) return null;
  return locale === "fr" ? entry.fr : entry.en;
}

/** UI button labels for the PageGuidance component */
export const guidanceUI = {
  en: { back: "Back", skip: "Skip tour", next: "Next", done: "Get Started" },
  fr: { back: "Retour", skip: "Passer", next: "Suivant", done: "Commencer" },
};

/** driver.js button labels for the PageTour component */
export const tourUI = {
  en: { next: "Next →", prev: "← Back", done: "✓ Done", progress: "Step {{current}} of {{total}}" },
  fr: { next: "Suivant →", prev: "← Retour", done: "✓ Terminer", progress: "Étape {{current}} sur {{total}}" },
};
