import { readFileSync, writeFileSync } from 'fs';

const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
const fr = JSON.parse(readFileSync('messages/fr.json', 'utf8'));

// --- COMMON additions ---
Object.assign(en.common, {
  submitting: 'Submitting...',
  submitApplication: 'Submit Application',
  stepOf: 'Step {current} of {total}'
});
Object.assign(fr.common, {
  submitting: 'Envoi en cours...',
  submitApplication: 'Soumettre la demande',
  stepOf: 'Étape {current} sur {total}'
});

// --- personal eligibility additions ---
Object.assign(en.accountOpening.personal.personalFunnel.eligibility, {
  sourceOfFunds: 'Source of Funds Documentation',
  sourceOfFundsDescription: 'Pay slips, investment statements, or other proof',
  uploadSourceOfFunds: 'Upload Proof',
  proofOfAssets: 'Proof of Assets',
  proofOfAssetsDescription: 'Bank statements, investment portfolios',
  uploadAssets: 'Upload Assets',
  incomeEvidence: 'Income Evidence',
  incomeEvidenceDescription: 'Tax returns, employment contracts',
  uploadIncomeProof: 'Upload Income Proof',
  uploadedDocuments: 'Uploaded Documents ({count})'
});
Object.assign(fr.accountOpening.personal.personalFunnel.eligibility, {
  sourceOfFunds: "Justificatif d'origine des fonds",
  sourceOfFundsDescription: 'Bulletins de salaire, relevés de placement ou autre preuve',
  uploadSourceOfFunds: 'Télécharger justificatif',
  proofOfAssets: "Justificatif d'actifs",
  proofOfAssetsDescription: "Relevés bancaires, portefeuilles d'investissement",
  uploadAssets: "Télécharger justificatif d'actifs",
  incomeEvidence: 'Justificatif de revenus',
  incomeEvidenceDescription: 'Déclarations fiscales, contrats de travail',
  uploadIncomeProof: 'Télécharger justificatif de revenus',
  uploadedDocuments: 'Documents téléchargés ({count})'
});

// --- personal submission additions ---
en.accountOpening.personal.personalFunnel.submission.startBusinessApplication = 'Start a Business Application';
fr.accountOpening.personal.personalFunnel.submission.startBusinessApplication = 'Démarrer une demande professionnelle';

// --- business businessFunnel ---
en.accountOpening.business.businessFunnel = {
  steps: {
    welcome: { label: 'Welcome', shortLabel: 'Welcome' },
    company: { label: 'Company Status', shortLabel: 'Company' },
    contact: { label: 'Contact Person', shortLabel: 'Contact' },
    intent: { label: 'Business Intent', shortLabel: 'Intent' },
    directors: { label: 'Directors & UBOs', shortLabel: 'Directors' },
    review: { label: 'Review & Consents', shortLabel: 'Review' },
    submission: { label: 'Submission', shortLabel: 'Submit' }
  },
  welcome: {
    title: 'Open Your Business Account',
    subtitle: "Tell us about your company, and we'll guide you through the right setup with an Opulanz partner bank.",
    timeline: {
      title: 'Application Timeline',
      step1: { title: 'Application Submission', description: 'Complete the online form (15-20 minutes)' },
      step2: { title: 'Document Review', description: 'Partner bank reviews company documents and UBO information (2-5 business days)' },
      step3: { title: 'KYC & Compliance', description: 'Enhanced due diligence for business accounts (3-7 business days)' },
      step4: { title: 'Account Activation', description: 'Receive IBAN, credentials, and corporate cards (2-3 business days)' },
      totalTime: 'Total estimated time: 7-15 business days',
      note: 'Timeline may vary based on company structure complexity and document completeness'
    },
    eligibility: {
      title: 'Eligibility Requirements',
      requirement1: 'Company registered in EU/EEA or select jurisdictions',
      requirement2: 'Valid company registration documents',
      requirement3: 'Articles of association or equivalent',
      requirement4: 'UBO declaration (Ultimate Beneficial Owners)',
      requirement5: 'All directors/signatories have valid ID',
      requirement6: 'Company tax identification number'
    },
    documents: {
      title: 'Required Documents',
      document1: 'Certificate of incorporation (dated within 3 months)',
      document2: 'Articles of association / company bylaws',
      document3: 'Register of directors and shareholders',
      document4: 'ID/passport for all directors and UBOs (>25% ownership)',
      document5: 'Proof of business address (utility bill, lease)',
      document6: 'Business plan or activity description'
    },
    howItWorks: {
      title: 'How It Works',
      smartRouting: { title: 'Smart Routing:', description: "Based on your company's jurisdiction, industry, and banking needs, we automatically route your application to the most suitable Opulanz partner bank." },
      priorityProcessing: { title: 'Priority Processing:', description: 'Your application includes a secure signed referral code from Opulanz, ensuring expedited review and preferential commercial terms from our partner banks.' },
      enhancedDueDiligence: { title: 'Enhanced Due Diligence:', description: 'Business accounts undergo comprehensive KYC/AML screening including UBO verification, business activity assessment, and source of funds validation to ensure full regulatory compliance.' },
      noObligation: { title: 'No Obligation:', description: "Submitting this application does not commit you to opening an account. You'll receive final terms and can decide whether to proceed after partner bank approval." }
    },
    features: {
      title: 'Business Account Features',
      feature1: 'Dedicated business IBAN in EUR',
      feature2: 'SEPA transfers and SWIFT payments',
      feature3: 'Corporate debit/credit cards',
      feature4: 'Multi-user access with permissions',
      feature5: 'Accounting software integration',
      feature6: 'Dedicated business support'
    },
    startButton: 'Start Business Application'
  },
  company: {
    title: 'Company Status',
    subtitle: 'Do you have an existing company or need to create one?',
    existingCompany: 'I already have a company',
    newCompany: 'I need to create a company',
    companyName: 'Company Name',
    countryOfIncorporation: 'Country of Incorporation',
    registrationNumber: 'Registration Number',
    legalForm: 'Legal Form',
    website: 'Website (optional)',
    formationService: {
      description: 'We can help you incorporate your company in Luxembourg or other jurisdictions. Our company formation service includes:',
      item1: 'Legal structure consultation',
      item2: 'Company registration and filing',
      item3: 'Registered office address',
      item4: 'Bank account setup',
      learnMore: 'Learn More About Company Formation'
    }
  },
  contact: {
    title: 'Contact Person',
    subtitle: 'Who will be the main contact for this application?',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    mobile: 'Mobile Phone',
    dateOfBirth: 'Date of Birth',
    nationality: 'Nationality',
    countryOfResidence: 'Country of Residence',
    taxResidency: 'Tax Residency',
    taxId: 'Tax ID (Optional)',
    required: '*'
  },
  intent: {
    title: 'Business Intent & Activity',
    subtitle: 'Tell us about your business operations',
    jurisdictions: 'Intended Jurisdictions',
    required: '*',
    businessActivity: 'Business Activity',
    businessActivityPlaceholder: 'E-commerce, Consulting, etc.',
    expectedMonthlyVolume: 'Expected Monthly Volume (\u20ac)',
    averageTicketSize: 'Average Ticket Size (\u20ac)',
    currencies: 'Primary Currencies',
    supportingDocuments: {
      title: 'Supporting Documents',
      subtitle: 'Please upload the following documents to support your business application',
      companyCertificate: 'Company Registration Certificate',
      articles: 'Articles of Association / Statutes',
      shareholderRegister: 'Shareholder Register / UBO Declaration',
      businessPlan: 'Business Plan / Activity Description',
      recommended: '(Recommended)',
      financialStatements: 'Recent Financial Statements',
      ifExisting: '(If existing company)',
      uploadCertificate: 'Upload Registration Certificate',
      uploadArticles: 'Upload Articles of Association',
      uploadShareholder: 'Upload Shareholder Register',
      uploadBusinessPlan: 'Upload Business Plan',
      uploadFinancial: 'Upload Financial Statements',
      uploadedDocuments: 'Uploaded Documents ({count})',
      fileRequirements: 'Accepted formats: JPG, PNG, PDF \u2022 Maximum size: 5MB per file'
    }
  },
  directors: {
    title: 'Directors & Ultimate Beneficial Owners',
    subtitle: 'Add key persons associated with the company',
    personLabel: 'Person #{index}',
    firstName: 'First Name',
    lastName: 'Last Name',
    dateOfBirth: 'Date of Birth',
    nationality: 'Nationality',
    residency: 'Residency',
    role: 'Role',
    directorRole: 'Director',
    uboRole: 'UBO',
    bothRole: 'Both',
    ownershipPercent: 'Ownership %',
    addDirector: 'Add Director / UBO',
    atLeastOneRequired: 'Please add at least one director or UBO'
  },
  review: {
    title: 'Review & Consents',
    subtitle: 'Please review and provide your consent',
    summaryTitle: 'Application Summary',
    company: 'Company',
    newCompany: 'New Company',
    contactPerson: 'Contact Person',
    businessActivity: 'Business Activity',
    directorsUbos: 'Directors & UBOs',
    personsCount: '{count} person(s)',
    dataProcessingConsent: 'I consent to Opulanz processing company data for partner bank introductions.',
    dataSharingConsent: 'I authorize Opulanz to share information with partner banks for account onboarding.',
    authorizedRepresentativeConsent: 'I confirm I am authorized to submit this application on behalf of the company.',
    marketingOptIn: 'Keep me informed about Opulanz services (optional)'
  },
  submission: {
    title: 'Application Submitted Successfully!',
    message: 'Thank you for submitting your business account application. Our team will review your information and contact you within 24-72 hours.',
    applicationNumberLabel: 'Your Application Number',
    saveNumberMessage: 'Please save this number for your records',
    nextStepsTitle: 'What happens next?',
    nextStep1: 'Our compliance team will review your application and supporting documents',
    nextStep2: "We'll match your business with the most suitable Opulanz partner bank",
    nextStep3: "You'll receive an email with next steps within 24-72 hours",
    backToHomepage: 'Back to Homepage',
    startPersonalApplication: 'Start a Personal Application'
  }
};

fr.accountOpening.business.businessFunnel = {
  steps: {
    welcome: { label: 'Bienvenue', shortLabel: 'Bienvenue' },
    company: { label: "Statut de l'entreprise", shortLabel: 'Entreprise' },
    contact: { label: 'Personne de contact', shortLabel: 'Contact' },
    intent: { label: 'Objectif commercial', shortLabel: 'Objectif' },
    directors: { label: 'Dirigeants & UBOs', shortLabel: 'Dirigeants' },
    review: { label: 'Révision & Consentements', shortLabel: 'Révision' },
    submission: { label: 'Soumission', shortLabel: 'Soumettre' }
  },
  welcome: {
    title: 'Ouvrez votre compte professionnel',
    subtitle: "Parlez-nous de votre entreprise et nous vous guiderons vers la bonne configuration avec une banque partenaire Opulanz.",
    timeline: {
      title: 'Calendrier de la demande',
      step1: { title: 'Soumission de la demande', description: 'Remplissez le formulaire en ligne (15-20 minutes)' },
      step2: { title: 'Examen des documents', description: "La banque partenaire examine les documents de l'entreprise et les informations UBO (2-5 jours ouvrables)" },
      step3: { title: 'KYC et conformité', description: 'Diligence raisonnable renforcée pour les comptes professionnels (3-7 jours ouvrables)' },
      step4: { title: 'Activation du compte', description: "Recevez l'IBAN, les identifiants et les cartes d'entreprise (2-3 jours ouvrables)" },
      totalTime: 'Durée totale estimée : 7-15 jours ouvrables',
      note: "Le calendrier peut varier selon la complexité de la structure de l'entreprise et l'exhaustivité des documents"
    },
    eligibility: {
      title: "Conditions d'éligibilité",
      requirement1: "Entreprise enregistrée dans l'UE/EEE ou des juridictions sélectionnées",
      requirement2: "Documents d'immatriculation de l'entreprise valides",
      requirement3: 'Statuts ou équivalent',
      requirement4: 'Déclaration UBO (bénéficiaires effectifs)',
      requirement5: "Tous les administrateurs/signataires ont une pièce d'identité valide",
      requirement6: "Numéro d'identification fiscale de l'entreprise"
    },
    documents: {
      title: 'Documents requis',
      document1: "Certificat d'incorporation (daté de moins de 3 mois)",
      document2: 'Statuts / règlement de la société',
      document3: 'Registre des administrateurs et actionnaires',
      document4: "Pièce d'identité/passeport pour tous les administrateurs et UBO (>25% de propriété)",
      document5: "Justificatif d'adresse professionnelle (facture, bail)",
      document6: "Plan d'affaires ou description de l'activité"
    },
    howItWorks: {
      title: 'Comment ça fonctionne',
      smartRouting: { title: 'Routage intelligent :', description: "En fonction de la juridiction, du secteur et des besoins bancaires de votre entreprise, nous acheminons automatiquement votre demande vers la banque partenaire Opulanz la plus adaptée." },
      priorityProcessing: { title: 'Traitement prioritaire :', description: "Votre demande inclut un code de référence signé sécurisé d'Opulanz, assurant un examen accéléré et des conditions commerciales préférentielles auprès de nos banques partenaires." },
      enhancedDueDiligence: { title: 'Diligence raisonnée renforcée :', description: "Les comptes professionnels font l'objet d'un contrôle KYC/LBC complet incluant la vérification des UBO, l'évaluation de l'activité commerciale et la validation de l'origine des fonds." },
      noObligation: { title: 'Sans engagement :', description: "La soumission de cette demande ne vous engage pas à ouvrir un compte. Vous recevrez les conditions finales et pourrez décider de procéder après l'approbation de la banque partenaire." }
    },
    features: {
      title: 'Fonctionnalités du compte professionnel',
      feature1: 'IBAN professionnel dédié en EUR',
      feature2: 'Virements SEPA et paiements SWIFT',
      feature3: "Cartes de débit/crédit d'entreprise",
      feature4: 'Accès multi-utilisateurs avec autorisations',
      feature5: 'Intégration avec logiciels de comptabilité',
      feature6: 'Support professionnel dédié'
    },
    startButton: 'Démarrer la demande professionnelle'
  },
  company: {
    title: "Statut de l'entreprise",
    subtitle: 'Avez-vous déjà une entreprise ou avez-vous besoin d\'en créer une ?',
    existingCompany: "J'ai déjà une entreprise",
    newCompany: "Je dois créer une entreprise",
    companyName: "Nom de l'entreprise",
    countryOfIncorporation: "Pays d'immatriculation",
    registrationNumber: "Numéro d'immatriculation",
    legalForm: 'Forme juridique',
    website: 'Site web (facultatif)',
    formationService: {
      description: "Nous pouvons vous aider à incorporer votre entreprise au Luxembourg ou dans d'autres juridictions. Notre service de création d'entreprise comprend :",
      item1: 'Consultation sur la structure juridique',
      item2: 'Immatriculation et dépôt de la société',
      item3: 'Adresse de siège social',
      item4: 'Ouverture de compte bancaire',
      learnMore: "En savoir plus sur la création d'entreprise"
    }
  },
  contact: {
    title: 'Personne de contact',
    subtitle: 'Qui sera le contact principal pour cette demande ?',
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    email: 'E-mail',
    mobile: 'Téléphone mobile',
    dateOfBirth: 'Date de naissance',
    nationality: 'Nationalité',
    countryOfResidence: 'Pays de résidence',
    taxResidency: 'Résidence fiscale',
    taxId: 'Identifiant fiscal (facultatif)',
    required: '*'
  },
  intent: {
    title: 'Objectif et activité commerciale',
    subtitle: 'Parlez-nous de vos activités commerciales',
    jurisdictions: 'Juridictions visées',
    required: '*',
    businessActivity: 'Activité commerciale',
    businessActivityPlaceholder: 'E-commerce, Consulting, etc.',
    expectedMonthlyVolume: 'Volume mensuel attendu (\u20ac)',
    averageTicketSize: 'Montant moyen par transaction (\u20ac)',
    currencies: 'Devises principales',
    supportingDocuments: {
      title: 'Documents justificatifs',
      subtitle: 'Veuillez télécharger les documents suivants pour appuyer votre demande professionnelle',
      companyCertificate: "Certificat d'immatriculation de l'entreprise",
      articles: 'Statuts / Actes constitutifs',
      shareholderRegister: 'Registre des actionnaires / Déclaration UBO',
      businessPlan: "Plan d'affaires / Description de l'activité",
      recommended: '(Recommandé)',
      financialStatements: 'États financiers récents',
      ifExisting: '(Si entreprise existante)',
      uploadCertificate: "Télécharger le certificat d'immatriculation",
      uploadArticles: 'Télécharger les statuts',
      uploadShareholder: 'Télécharger le registre des actionnaires',
      uploadBusinessPlan: "Télécharger le plan d'affaires",
      uploadFinancial: 'Télécharger les états financiers',
      uploadedDocuments: 'Documents téléchargés ({count})',
      fileRequirements: 'Formats acceptés : JPG, PNG, PDF \u2022 Taille maximale : 5 Mo par fichier'
    }
  },
  directors: {
    title: 'Administrateurs et bénéficiaires effectifs',
    subtitle: "Ajoutez les personnes clés associées à l'entreprise",
    personLabel: 'Personne n°{index}',
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    dateOfBirth: 'Date de naissance',
    nationality: 'Nationalité',
    residency: 'Résidence',
    role: 'Rôle',
    directorRole: 'Administrateur',
    uboRole: 'UBO',
    bothRole: 'Les deux',
    ownershipPercent: 'Pourcentage de détention',
    addDirector: 'Ajouter administrateur / UBO',
    atLeastOneRequired: 'Veuillez ajouter au moins un administrateur ou UBO'
  },
  review: {
    title: 'Révision et consentements',
    subtitle: 'Veuillez vérifier et donner votre consentement',
    summaryTitle: 'Récapitulatif de la demande',
    company: 'Entreprise',
    newCompany: 'Nouvelle entreprise',
    contactPerson: 'Personne de contact',
    businessActivity: 'Activité commerciale',
    directorsUbos: 'Administrateurs et UBOs',
    personsCount: '{count} personne(s)',
    dataProcessingConsent: "Je consens à ce qu'Opulanz traite les données de l'entreprise pour les présentations auprès des banques partenaires.",
    dataSharingConsent: "J'autorise Opulanz à partager les informations avec les banques partenaires pour l'ouverture du compte.",
    authorizedRepresentativeConsent: "Je confirme être autorisé(e) à soumettre cette demande au nom de l'entreprise.",
    marketingOptIn: 'Tenez-moi informé(e) des services Opulanz (facultatif)'
  },
  submission: {
    title: 'Demande soumise avec succès !',
    message: 'Merci d\'avoir soumis votre demande de compte professionnel. Notre équipe examinera vos informations et vous contactera dans les 24-72 heures.',
    applicationNumberLabel: 'Votre numéro de demande',
    saveNumberMessage: 'Veuillez conserver ce numéro pour vos dossiers',
    nextStepsTitle: 'Et maintenant ?',
    nextStep1: 'Notre équipe de conformité examinera votre demande et les documents justificatifs',
    nextStep2: 'Nous associerons votre entreprise à la banque partenaire Opulanz la plus adaptée',
    nextStep3: 'Vous recevrez un e-mail avec les prochaines étapes dans les 24-72 heures',
    backToHomepage: "Retour à l'accueil",
    startPersonalApplication: 'Démarrer une demande personnelle'
  }
};

writeFileSync('messages/en.json', JSON.stringify(en, null, 2), 'utf8');
writeFileSync('messages/fr.json', JSON.stringify(fr, null, 2), 'utf8');
console.log('Done!');
