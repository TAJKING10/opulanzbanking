#!/usr/bin/env python3
"""
Script to add complete English and French translations for Opulanzbanking
"""
import json

def add_english_translations():
    """Add all English translation keys"""
    with open('messages/en.json', 'r', encoding='utf-8') as f:
        en = json.load(f)

    # Investment Advisory - Complete translations
    en['investmentAdvisory'] = {
        'onboarding': {
            'badge': 'Investment Advisory Onboarding',
            'title': 'Client Information & Compliance (KYC)',
            'subtitle': 'To provide you with personalized investment advisory services, we need to collect some information for regulatory compliance and to understand your investment profile.',
            'securityNotice': 'Your information is encrypted and secure. We comply with GDPR and French banking regulations (ACPR, AMF).'
        },
        'wizard': {
            'steps': {
                'clientType': 'Client Type',
                'information': 'Information',
                'review': 'Review',
                'complete': 'Complete'
            },
            'progress': {
                'step': 'Step',
                'of': 'of',
                'complete': 'Complete'
            }
        },
        'clientType': {
            'welcome': 'Welcome to Opulanz',
            'subtitle': "Let's start your investment journey",
            'question': 'Are you an individual or a company?',
            'individual': {
                'title': 'Individual',
                'description': 'Personal investment account'
            },
            'company': {
                'title': 'Company',
                'description': 'Corporate investment account'
            },
            'contact': {
                'email': 'Email Address',
                'mobile': 'Mobile Phone',
                'mobilePlaceholder': '+33 6 12 34 56 78',
                'emailPlaceholder': 'your@email.com',
                'language': 'Preferred Language'
            }
        },
        'individual': {
            'title': 'Individual Client Information',
            'subtitle': 'Please provide all required information below. All sections must be completed.',
            'sections': {
                'identity': 'Personal Identity',
                'address': 'Residential Address',
                'taxResidency': 'Tax Residency',
                'professional': 'Professional Situation',
                'family': 'Family Situation',
                'financial': 'Financial Situation',
                'origin': 'Origin of Funds',
                'investmentKnowledge': 'Investment Knowledge & Experience',
                'investmentObjectives': 'Investment Objectives & Horizon',
                'riskProfile': 'Risk Profile',
                'mission': 'Mission Type & Initial Investment',
                'consents': 'Consents & Authorizations'
            },
            'fields': {
                'title': 'Title',
                'firstName': 'First Name',
                'lastName': 'Last Name',
                'dateOfBirth': 'Date of Birth',
                'placeOfBirth': 'Place of Birth',
                'nationality': 'Nationality',
                'maritalStatus': 'Marital Status',
                'addressLine1': 'Address Line 1',
                'addressLine2': 'Address Line 2',
                'city': 'City',
                'postalCode': 'Postal Code',
                'country': 'Country',
                'taxCountry': 'Tax Residence Country',
                'taxId': 'Tax Identification Number',
                'professionalStatus': 'Professional Status',
                'employerName': 'Employer Name',
                'position': 'Position/Title',
                'sector': 'Industry Sector',
                'numberOfDependents': 'Number of Dependents',
                'annualIncome': 'Annual Income (€)',
                'incomeSource': 'Main Source of Income',
                'totalAssets': 'Total Assets (€)',
                'liquidAssets': 'Liquid Assets (€)',
                'realEstateValue': 'Real Estate Value (€)',
                'outstandingDebts': 'Outstanding Debts (€)',
                'originOfFunds': 'Primary Origin of Funds',
                'originDetails': 'Additional Details',
                'investmentExperience': 'Investment Experience',
                'knownProducts': 'Investment Products You Know',
                'investmentHorizon': 'Investment Horizon',
                'investmentObjective': 'Investment Objective',
                'expectedReturn': 'Expected Annual Return (%)',
                'riskTolerance': 'Risk Tolerance',
                'maxLoss': 'Maximum Acceptable Loss (%)',
                'missionType': 'Service Type',
                'initialInvestment': 'Initial Investment Amount (€)'
            },
            'placeholders': {
                'cityCountry': 'City, Country',
                'describeOrigin': 'Please describe the origin of your funds...',
                'additionalDetails': 'Any additional information...'
            },
            'options': {
                'titles': {
                    'mr': 'Mr.',
                    'mrs': 'Mrs.',
                    'ms': 'Ms.',
                    'dr': 'Dr.'
                },
                'maritalStatus': {
                    'single': 'Single',
                    'married': 'Married',
                    'divorced': 'Divorced',
                    'widowed': 'Widowed',
                    'civilPartnership': 'Civil Partnership'
                },
                'professionalStatus': {
                    'employed': 'Employed',
                    'selfEmployed': 'Self-Employed',
                    'retired': 'Retired',
                    'unemployed': 'Unemployed',
                    'student': 'Student'
                },
                'originOfFunds': {
                    'salary': 'Salary/Employment Income',
                    'business': 'Business Income',
                    'investment': 'Investment Returns',
                    'inheritance': 'Inheritance',
                    'savings': 'Personal Savings',
                    'other': 'Other'
                },
                'investmentExperience': {
                    'beginner': 'Beginner (No Experience)',
                    'intermediate': 'Intermediate (1-3 years)',
                    'advanced': 'Advanced (3-5 years)',
                    'expert': 'Expert (5+ years)'
                },
                'investmentProducts': {
                    'stocks': 'Stocks/Equities',
                    'bonds': 'Bonds',
                    'mutualFunds': 'Mutual Funds',
                    'etfs': 'ETFs',
                    'realEstate': 'Real Estate',
                    'crypto': 'Cryptocurrency',
                    'derivatives': 'Derivatives'
                },
                'investmentHorizon': {
                    'short': 'Short-term (< 2 years)',
                    'medium': 'Medium-term (2-5 years)',
                    'long': 'Long-term (5-10 years)',
                    'veryLong': 'Very Long-term (10+ years)'
                },
                'investmentObjective': {
                    'preservation': 'Capital Preservation',
                    'income': 'Income Generation',
                    'growth': 'Capital Growth',
                    'balanced': 'Balanced Growth & Income'
                },
                'riskTolerance': {
                    'conservative': 'Conservative (Low Risk)',
                    'moderate': 'Moderate (Medium Risk)',
                    'aggressive': 'Aggressive (High Risk)',
                    'veryAggressive': 'Very Aggressive (Very High Risk)'
                },
                'missionType': {
                    'advisory': 'Investment Advisory (Conseil)',
                    'management': 'Portfolio Management (Gestion sous mandat)'
                }
            },
            'consents': {
                'dataProcessing': 'I consent to Opulanz processing my personal data for KYC and investment advisory purposes in accordance with GDPR',
                'kyc': 'I consent to identity verification and AML/CFT compliance checks as required by French regulations (ACPR, AMF)',
                'electronic': 'I consent to receive and sign documents electronically via DocuSign',
                'marketing': 'I consent to receive marketing communications from Opulanz (optional)'
            }
        },
        'company': {
            'title': 'Company Client Information',
            'subtitle': 'Please provide all required information below. All sections must be completed.',
            'sections': {
                'company': 'Company Identity',
                'address': 'Registered Address',
                'representatives': 'Legal Representatives',
                'ubo': 'UBO Information',
                'fatca': 'FATCA & CRS Information',
                'financial': 'Financial Information',
                'origin': 'Origin of Funds',
                'investmentProfile': 'Investment Profile',
                'mission': 'Mission Type & Initial Investment',
                'consents': 'Consents & Authorizations'
            },
            'fields': {
                'legalName': 'Legal Name',
                'tradingName': 'Trading Name',
                'legalForm': 'Legal Form',
                'registrationNumber': 'Registration Number',
                'registrationCountry': 'Country of Registration',
                'taxId': 'Tax Identification Number',
                'incorporationDate': 'Date of Incorporation',
                'sector': 'Business Sector',
                'numberOfEmployees': 'Number of Employees',
                'website': 'Website',
                'addressLine1': 'Address Line 1',
                'addressLine2': 'Address Line 2',
                'city': 'City',
                'postalCode': 'Postal Code',
                'country': 'Country',
                'repTitle': 'Title',
                'repFirstName': 'First Name',
                'repLastName': 'Last Name',
                'repPosition': 'Position',
                'repEmail': 'Email',
                'repMobile': 'Mobile Phone',
                'repDateOfBirth': 'Date of Birth',
                'repNationality': 'Nationality',
                'usPerson': 'Is the company a US Person?',
                'taxResidentCountries': 'Tax Resident Countries',
                'hasBeneficialOwners': 'Beneficial Owners Identified?',
                'uboName': 'UBO Full Name',
                'uboOwnership': 'Ownership Percentage (%)',
                'annualRevenue': 'Annual Revenue (€)',
                'totalAssets': 'Total Assets (€)',
                'sourceOfRevenue': 'Main Source of Revenue',
                'originOfFunds': 'Primary Origin of Funds',
                'originDetails': 'Additional Details'
            },
            'placeholders': {
                'selectLegalForm': 'Select legal form...',
                'enterWebsite': 'https://...',
                'countriesList': 'France, Luxembourg, etc.'
            }
        },
        'review': {
            'title': 'Review & Confirm',
            'subtitle': 'Please review all information carefully before submitting.',
            'sections': {
                'complete': 'Complete Application Details',
                'basic': 'Basic Information',
                'identity': 'Personal Identity',
                'address': 'Residential Address',
                'taxResidency': 'Tax Residency',
                'professional': 'Professional Situation',
                'family': 'Family Situation',
                'financial': 'Financial Situation',
                'origin': 'Origin of Funds',
                'investment': 'Investment Profile',
                'service': 'Service Details',
                'consents': 'Consents & Authorizations',
                'company': 'Company Identity',
                'registeredAddress': 'Registered Address',
                'representative': 'Legal Representative',
                'ubo': 'Ultimate Beneficial Owner (UBO)',
                'fatca': 'FATCA & CRS'
            },
            'labels': {
                'clientType': 'Client Type',
                'individual': 'Individual',
                'company': 'Company',
                'email': 'Email',
                'mobile': 'Mobile',
                'language': 'Preferred Language',
                'fullName': 'Full Name',
                'dateOfBirth': 'Date of Birth',
                'placeOfBirth': 'Place of Birth',
                'nationality': 'Nationality',
                'maritalStatus': 'Marital Status',
                'address1': 'Address Line 1',
                'address2': 'Address Line 2',
                'city': 'City',
                'postalCode': 'Postal Code',
                'country': 'Country',
                'taxCountry': 'Tax Residence Country',
                'taxId': 'Tax ID Number',
                'status': 'Status',
                'employer': 'Employer',
                'position': 'Position',
                'sector': 'Sector',
                'dependents': 'Number of Dependents',
                'annualIncome': 'Annual Income',
                'incomeSource': 'Income Source',
                'totalAssets': 'Total Assets',
                'liquidAssets': 'Liquid Assets',
                'realEstate': 'Real Estate Value',
                'debts': 'Outstanding Debts',
                'primaryOrigin': 'Primary Origin',
                'additionalDetails': 'Additional Details',
                'experience': 'Investment Experience',
                'riskTolerance': 'Risk Tolerance',
                'horizon': 'Investment Horizon',
                'objective': 'Investment Objective',
                'expectedReturn': 'Expected Annual Return',
                'maxLoss': 'Max Acceptable Loss',
                'serviceType': 'Service Type',
                'initialInvestment': 'Initial Investment',
                'legalName': 'Legal Name',
                'tradingName': 'Trading Name',
                'legalForm': 'Legal Form',
                'registrationNumber': 'Registration Number',
                'registrationCountry': 'Registration Country',
                'incorporationDate': 'Date of Incorporation',
                'employees': 'Number of Employees',
                'website': 'Website',
                'annualRevenue': 'Annual Revenue',
                'sourceOfRevenue': 'Source of Revenue',
                'usPerson': 'US Person',
                'taxResidentCountries': 'Tax Resident Countries',
                'uboName': 'UBO Name',
                'ownership': 'Ownership %'
            },
            'values': {
                'french': 'Français',
                'english': 'English',
                'yes': 'Yes',
                'no': 'No',
                'granted': 'Granted',
                'notGranted': 'Not granted',
                'advisory': 'Investment Advisory (Conseil)',
                'management': 'Portfolio Management (Gestion sous mandat)'
            },
            'declaration': {
                'title': 'Declaration',
                'text': 'I hereby confirm that all information provided is true and accurate to the best of my knowledge. I understand that this information will be used for regulatory compliance (KYC/AML) purposes and to generate the required documentation for my investment account.',
                'checkbox': 'I confirm that I have reviewed all information and agree to the terms'
            },
            'consents': {
                'dataProcessing': 'Data Processing Consent',
                'kyc': 'KYC/AML Compliance',
                'electronic': 'Electronic Signature',
                'marketing': 'Marketing Communications'
            },
            'errors': {
                'title': 'Submission Failed',
                'submitting': 'Submitting Application...',
                'generatingDocs': 'Generating documents and preparing signature request'
            },
            'submit': 'Submit Application',
            'submitting': 'Submitting...'
        },
        'success': {
            'title': 'Application Submitted Successfully!',
            'subtitle': 'Thank you for completing your client onboarding. Your information has been received, documents have been generated, and a signature request has been sent to your email.',
            'nextSteps': {
                'title': 'What Happens Next?',
                'step1': {
                    'title': 'Document Generation',
                    'description': "We'll automatically generate your regulatory documents (Lettre de mission, Déclaration d'adéquation, etc.)"
                },
                'step2': {
                    'title': 'Compliance Review',
                    'description': 'Our team will review your application within 2-3 business days'
                },
                'step3': {
                    'title': 'DocuSign Signature',
                    'description': "You'll receive an email with documents to sign electronically via DocuSign"
                },
                'step4': {
                    'title': 'Account Activation',
                    'description': 'Once signed, your investment account will be activated'
                }
            },
            'reference': {
                'title': 'Application Reference',
                'processing': 'Processing...',
                'envelopeId': 'DocuSign Envelope ID',
                'checkEmail': 'Check your email for the signature request'
            },
            'actions': {
                'home': 'Return to Homepage',
                'new': 'Start New Application'
            },
            'support': {
                'text': 'Questions? Contact us at',
                'email': 'support@opulanz.com'
            }
        }
    }

    # About page translations
    en['about'] = {
        'strengths': {
            'banking': {
                'title': 'Business Banking Expertise',
                'description': 'Over 18+ years of experience serving commercial companies, financial institutions, and investment funds across Europe.'
            },
            'platform': {
                'title': 'All-in-One Platform',
                'description': 'Complete business solution from company formation to banking, accounting, tax advisory, investment, and insurance.'
            },
            'technology': {
                'title': 'Modern Technology',
                'description': 'Leveraging Artificial Intelligence and Blockchain to make business banking better, easier, and more efficient.'
            }
        },
        'certifications': {
            'licensed': {
                'title': 'State Licensed',
                'description': 'State Licensed Agents'
            },
            'certified': {
                'title': 'Certified',
                'description': 'Industry Certified Professionals'
            },
            'bonded': {
                'title': 'Bonded',
                'description': 'Bonded & Insured Operations'
            },
            'encrypted': {
                'title': 'Encrypted',
                'description': 'Bank-Level Security'
            }
        }
    }

    # Tax Advisory translations
    en['taxAdvisory'] = {
        'services': {
            'taxReturn': {
                'title': 'Tax Return Preparation',
                'description': 'Professional preparation and filing of corporate and individual tax returns across multiple jurisdictions.',
                'price': '€299'
            },
            'international': {
                'title': 'International Tax',
                'description': 'Expert guidance on cross-border tax matters, transfer pricing, and double taxation treaties.',
                'price': '€250'
            },
            'corporate': {
                'title': 'Corporate Tax',
                'description': 'Comprehensive corporate tax services including restructuring, M&A tax advice, and VAT consulting.',
                'price': '€150'
            },
            'compliance': {
                'title': 'Tax Compliance',
                'description': 'Ensure ongoing compliance with changing tax laws and regulations in Luxembourg and beyond.',
                'price': '€250'
            },
            'personal': {
                'title': 'Personal Tax Advisory',
                'description': 'Personalized tax advice for high-net-worth individuals and expatriates.',
                'price': '€100'
            }
        }
    }

    with open('messages/en.json', 'w', encoding='utf-8') as f:
        json.dump(en, f, indent=2, ensure_ascii=False)

    print("✅ English translations added successfully")
    return en

def add_french_translations():
    """Add all French translations"""
    with open('messages/fr.json', 'r', encoding='utf-8') as f:
        fr = json.load(f)

    # Investment Advisory - French translations
    fr['investmentAdvisory'] = {
        'onboarding': {
            'badge': 'Conseil en Investissement',
            'title': 'Informations Client & Conformité (KYC)',
            'subtitle': "Pour vous fournir des services de conseil en investissement personnalisés, nous devons collecter certaines informations pour la conformité réglementaire et pour comprendre votre profil d'investisseur.",
            'securityNotice': 'Vos informations sont chiffrées et sécurisées. Nous respectons le RGPD et la réglementation bancaire française (ACPR, AMF).'
        },
        'wizard': {
            'steps': {
                'clientType': 'Type de Client',
                'information': 'Informations',
                'review': 'Révision',
                'complete': 'Terminé'
            },
            'progress': {
                'step': 'Étape',
                'of': 'sur',
                'complete': 'Terminé'
            }
        },
        'clientType': {
            'welcome': 'Bienvenue chez Opulanz',
            'subtitle': 'Commençons votre parcours d\'investissement',
            'question': 'Êtes-vous un particulier ou une entreprise ?',
            'individual': {
                'title': 'Particulier',
                'description': 'Compte d\'investissement personnel'
            },
            'company': {
                'title': 'Entreprise',
                'description': 'Compte d\'investissement professionnel'
            },
            'contact': {
                'email': 'Adresse e-mail',
                'mobile': 'Téléphone portable',
                'mobilePlaceholder': '+33 6 12 34 56 78',
                'emailPlaceholder': 'votre@email.com',
                'language': 'Langue préférée'
            }
        },
        'individual': {
            'title': 'Informations Client Particulier',
            'subtitle': 'Veuillez fournir toutes les informations requises ci-dessous. Toutes les sections doivent être complétées.',
            'sections': {
                'identity': 'Identité Personnelle',
                'address': 'Adresse de Résidence',
                'taxResidency': 'Résidence Fiscale',
                'professional': 'Situation Professionnelle',
                'family': 'Situation Familiale',
                'financial': 'Situation Financière',
                'origin': 'Origine des Fonds',
                'investmentKnowledge': 'Connaissances & Expérience en Investissement',
                'investmentObjectives': 'Objectifs & Horizon d\'Investissement',
                'riskProfile': 'Profil de Risque',
                'mission': 'Type de Mission & Investissement Initial',
                'consents': 'Consentements & Autorisations'
            },
            'fields': {
                'title': 'Civilité',
                'firstName': 'Prénom',
                'lastName': 'Nom',
                'dateOfBirth': 'Date de Naissance',
                'placeOfBirth': 'Lieu de Naissance',
                'nationality': 'Nationalité',
                'maritalStatus': 'Situation Matrimoniale',
                'addressLine1': 'Adresse Ligne 1',
                'addressLine2': 'Adresse Ligne 2',
                'city': 'Ville',
                'postalCode': 'Code Postal',
                'country': 'Pays',
                'taxCountry': 'Pays de Résidence Fiscale',
                'taxId': 'Numéro d\'Identification Fiscale',
                'professionalStatus': 'Statut Professionnel',
                'employerName': 'Nom de l\'Employeur',
                'position': 'Poste/Fonction',
                'sector': 'Secteur d\'Activité',
                'numberOfDependents': 'Nombre de Personnes à Charge',
                'annualIncome': 'Revenu Annuel (€)',
                'incomeSource': 'Source Principale de Revenu',
                'totalAssets': 'Patrimoine Total (€)',
                'liquidAssets': 'Actifs Liquides (€)',
                'realEstateValue': 'Valeur Immobilière (€)',
                'outstandingDebts': 'Dettes en Cours (€)',
                'originOfFunds': 'Origine Principale des Fonds',
                'originDetails': 'Détails Supplémentaires',
                'investmentExperience': 'Expérience en Investissement',
                'knownProducts': 'Produits d\'Investissement Connus',
                'investmentHorizon': 'Horizon d\'Investissement',
                'investmentObjective': 'Objectif d\'Investissement',
                'expectedReturn': 'Rendement Annuel Attendu (%)',
                'riskTolerance': 'Tolérance au Risque',
                'maxLoss': 'Perte Maximale Acceptable (%)',
                'missionType': 'Type de Service',
                'initialInvestment': 'Montant d\'Investissement Initial (€)'
            },
            'placeholders': {
                'cityCountry': 'Ville, Pays',
                'describeOrigin': 'Veuillez décrire l\'origine de vos fonds...',
                'additionalDetails': 'Toute information complémentaire...'
            },
            'options': {
                'titles': {
                    'mr': 'M.',
                    'mrs': 'Mme',
                    'ms': 'Mlle',
                    'dr': 'Dr'
                },
                'maritalStatus': {
                    'single': 'Célibataire',
                    'married': 'Marié(e)',
                    'divorced': 'Divorcé(e)',
                    'widowed': 'Veuf/Veuve',
                    'civilPartnership': 'Partenariat Civil (PACS)'
                },
                'professionalStatus': {
                    'employed': 'Salarié(e)',
                    'selfEmployed': 'Travailleur Indépendant',
                    'retired': 'Retraité(e)',
                    'unemployed': 'Sans Emploi',
                    'student': 'Étudiant(e)'
                },
                'originOfFunds': {
                    'salary': 'Salaire/Revenu d\'Emploi',
                    'business': 'Revenu d\'Entreprise',
                    'investment': 'Revenus d\'Investissements',
                    'inheritance': 'Héritage',
                    'savings': 'Épargne Personnelle',
                    'other': 'Autre'
                },
                'investmentExperience': {
                    'beginner': 'Débutant (Aucune Expérience)',
                    'intermediate': 'Intermédiaire (1-3 ans)',
                    'advanced': 'Avancé (3-5 ans)',
                    'expert': 'Expert (5+ ans)'
                },
                'investmentProducts': {
                    'stocks': 'Actions/Titres',
                    'bonds': 'Obligations',
                    'mutualFunds': 'Fonds Communs de Placement',
                    'etfs': 'ETF',
                    'realEstate': 'Immobilier',
                    'crypto': 'Cryptomonnaies',
                    'derivatives': 'Produits Dérivés'
                },
                'investmentHorizon': {
                    'short': 'Court terme (< 2 ans)',
                    'medium': 'Moyen terme (2-5 ans)',
                    'long': 'Long terme (5-10 ans)',
                    'veryLong': 'Très long terme (10+ ans)'
                },
                'investmentObjective': {
                    'preservation': 'Préservation du Capital',
                    'income': 'Génération de Revenus',
                    'growth': 'Croissance du Capital',
                    'balanced': 'Croissance & Revenus Équilibrés'
                },
                'riskTolerance': {
                    'conservative': 'Conservateur (Risque Faible)',
                    'moderate': 'Modéré (Risque Moyen)',
                    'aggressive': 'Agressif (Risque Élevé)',
                    'veryAggressive': 'Très Agressif (Risque Très Élevé)'
                },
                'missionType': {
                    'advisory': 'Conseil en Investissement',
                    'management': 'Gestion sous Mandat'
                }
            },
            'consents': {
                'dataProcessing': 'Je consens à ce qu\'Opulanz traite mes données personnelles à des fins de KYC et de conseil en investissement conformément au RGPD',
                'kyc': 'Je consens à la vérification d\'identité et aux contrôles de conformité LCB-FT requis par la réglementation française (ACPR, AMF)',
                'electronic': 'Je consens à recevoir et signer des documents électroniquement via DocuSign',
                'marketing': 'Je consens à recevoir des communications marketing d\'Opulanz (optionnel)'
            }
        },
        'company': {
            'title': 'Informations Client Entreprise',
            'subtitle': 'Veuillez fournir toutes les informations requises ci-dessous. Toutes les sections doivent être complétées.',
            'sections': {
                'company': 'Identité de l\'Entreprise',
                'address': 'Adresse du Siège Social',
                'representatives': 'Représentants Légaux',
                'ubo': 'Informations sur les Bénéficiaires Effectifs',
                'fatca': 'Informations FATCA & CRS',
                'financial': 'Informations Financières',
                'origin': 'Origine des Fonds',
                'investmentProfile': 'Profil d\'Investissement',
                'mission': 'Type de Mission & Investissement Initial',
                'consents': 'Consentements & Autorisations'
            },
            'fields': {
                'legalName': 'Raison Sociale',
                'tradingName': 'Nom Commercial',
                'legalForm': 'Forme Juridique',
                'registrationNumber': 'Numéro d\'Immatriculation',
                'registrationCountry': 'Pays d\'Immatriculation',
                'taxId': 'Numéro d\'Identification Fiscale',
                'incorporationDate': 'Date de Constitution',
                'sector': 'Secteur d\'Activité',
                'numberOfEmployees': 'Nombre d\'Employés',
                'website': 'Site Web',
                'addressLine1': 'Adresse Ligne 1',
                'addressLine2': 'Adresse Ligne 2',
                'city': 'Ville',
                'postalCode': 'Code Postal',
                'country': 'Pays',
                'repTitle': 'Civilité',
                'repFirstName': 'Prénom',
                'repLastName': 'Nom',
                'repPosition': 'Fonction',
                'repEmail': 'E-mail',
                'repMobile': 'Téléphone Portable',
                'repDateOfBirth': 'Date de Naissance',
                'repNationality': 'Nationalité',
                'usPerson': 'L\'entreprise est-elle une US Person ?',
                'taxResidentCountries': 'Pays de Résidence Fiscale',
                'hasBeneficialOwners': 'Bénéficiaires Effectifs Identifiés ?',
                'uboName': 'Nom Complet du Bénéficiaire Effectif',
                'uboOwnership': 'Pourcentage de Détention (%)',
                'annualRevenue': 'Chiffre d\'Affaires Annuel (€)',
                'totalAssets': 'Actifs Totaux (€)',
                'sourceOfRevenue': 'Source Principale de Revenus',
                'originOfFunds': 'Origine Principale des Fonds',
                'originDetails': 'Détails Supplémentaires'
            },
            'placeholders': {
                'selectLegalForm': 'Sélectionnez la forme juridique...',
                'enterWebsite': 'https://...',
                'countriesList': 'France, Luxembourg, etc.'
            }
        },
        'review': {
            'title': 'Vérification & Confirmation',
            'subtitle': 'Veuillez vérifier attentivement toutes les informations avant de soumettre.',
            'sections': {
                'complete': 'Détails Complets de la Demande',
                'basic': 'Informations de Base',
                'identity': 'Identité Personnelle',
                'address': 'Adresse de Résidence',
                'taxResidency': 'Résidence Fiscale',
                'professional': 'Situation Professionnelle',
                'family': 'Situation Familiale',
                'financial': 'Situation Financière',
                'origin': 'Origine des Fonds',
                'investment': 'Profil d\'Investissement',
                'service': 'Détails du Service',
                'consents': 'Consentements & Autorisations',
                'company': 'Identité de l\'Entreprise',
                'registeredAddress': 'Adresse du Siège Social',
                'representative': 'Représentant Légal',
                'ubo': 'Bénéficiaire Effectif Ultime (UBO)',
                'fatca': 'FATCA & CRS'
            },
            'labels': {
                'clientType': 'Type de Client',
                'individual': 'Particulier',
                'company': 'Entreprise',
                'email': 'E-mail',
                'mobile': 'Téléphone',
                'language': 'Langue Préférée',
                'fullName': 'Nom Complet',
                'dateOfBirth': 'Date de Naissance',
                'placeOfBirth': 'Lieu de Naissance',
                'nationality': 'Nationalité',
                'maritalStatus': 'Situation Matrimoniale',
                'address1': 'Adresse Ligne 1',
                'address2': 'Adresse Ligne 2',
                'city': 'Ville',
                'postalCode': 'Code Postal',
                'country': 'Pays',
                'taxCountry': 'Pays de Résidence Fiscale',
                'taxId': 'Numéro d\'Identification Fiscale',
                'status': 'Statut',
                'employer': 'Employeur',
                'position': 'Poste',
                'sector': 'Secteur',
                'dependents': 'Nombre de Personnes à Charge',
                'annualIncome': 'Revenu Annuel',
                'incomeSource': 'Source de Revenu',
                'totalAssets': 'Patrimoine Total',
                'liquidAssets': 'Actifs Liquides',
                'realEstate': 'Valeur Immobilière',
                'debts': 'Dettes en Cours',
                'primaryOrigin': 'Origine Principale',
                'additionalDetails': 'Détails Supplémentaires',
                'experience': 'Expérience en Investissement',
                'riskTolerance': 'Tolérance au Risque',
                'horizon': 'Horizon d\'Investissement',
                'objective': 'Objectif d\'Investissement',
                'expectedReturn': 'Rendement Annuel Attendu',
                'maxLoss': 'Perte Maximale Acceptable',
                'serviceType': 'Type de Service',
                'initialInvestment': 'Investissement Initial',
                'legalName': 'Raison Sociale',
                'tradingName': 'Nom Commercial',
                'legalForm': 'Forme Juridique',
                'registrationNumber': 'Numéro d\'Immatriculation',
                'registrationCountry': 'Pays d\'Immatriculation',
                'incorporationDate': 'Date de Constitution',
                'employees': 'Nombre d\'Employés',
                'website': 'Site Web',
                'annualRevenue': 'Chiffre d\'Affaires Annuel',
                'sourceOfRevenue': 'Source de Revenus',
                'usPerson': 'US Person',
                'taxResidentCountries': 'Pays de Résidence Fiscale',
                'uboName': 'Nom du Bénéficiaire Effectif',
                'ownership': 'Détention %'
            },
            'values': {
                'french': 'Français',
                'english': 'Anglais',
                'yes': 'Oui',
                'no': 'Non',
                'granted': 'Accordé',
                'notGranted': 'Non accordé',
                'advisory': 'Conseil en Investissement',
                'management': 'Gestion sous Mandat'
            },
            'declaration': {
                'title': 'Déclaration',
                'text': 'Je confirme par la présente que toutes les informations fournies sont vraies et exactes à ma connaissance. Je comprends que ces informations seront utilisées à des fins de conformité réglementaire (KYC/LCB-FT) et pour générer la documentation requise pour mon compte d\'investissement.',
                'checkbox': 'Je confirme avoir vérifié toutes les informations et accepte les conditions'
            },
            'consents': {
                'dataProcessing': 'Consentement au Traitement des Données',
                'kyc': 'Conformité KYC/LCB-FT',
                'electronic': 'Signature Électronique',
                'marketing': 'Communications Marketing'
            },
            'errors': {
                'title': 'Échec de la Soumission',
                'submitting': 'Soumission de la demande...',
                'generatingDocs': 'Génération des documents et préparation de la demande de signature'
            },
            'submit': 'Soumettre la Demande',
            'submitting': 'Soumission en cours...'
        },
        'success': {
            'title': 'Demande Soumise avec Succès !',
            'subtitle': 'Merci d\'avoir complété votre inscription client. Vos informations ont été reçues, les documents ont été générés et une demande de signature a été envoyée à votre adresse e-mail.',
            'nextSteps': {
                'title': 'Prochaines Étapes',
                'step1': {
                    'title': 'Génération des Documents',
                    'description': 'Nous générerons automatiquement vos documents réglementaires (Lettre de mission, Déclaration d\'adéquation, etc.)'
                },
                'step2': {
                    'title': 'Vérification de Conformité',
                    'description': 'Notre équipe examinera votre demande sous 2-3 jours ouvrables'
                },
                'step3': {
                    'title': 'Signature DocuSign',
                    'description': 'Vous recevrez un e-mail avec les documents à signer électroniquement via DocuSign'
                },
                'step4': {
                    'title': 'Activation du Compte',
                    'description': 'Une fois signés, votre compte d\'investissement sera activé'
                }
            },
            'reference': {
                'title': 'Référence de la Demande',
                'processing': 'En cours de traitement...',
                'envelopeId': 'Identifiant DocuSign',
                'checkEmail': 'Consultez votre e-mail pour la demande de signature'
            },
            'actions': {
                'home': 'Retour à l\'Accueil',
                'new': 'Nouvelle Demande'
            },
            'support': {
                'text': 'Des questions ? Contactez-nous à',
                'email': 'support@opulanz.com'
            }
        }
    }

    # About page translations
    fr['about'] = {
        'strengths': {
            'banking': {
                'title': 'Expertise Bancaire d\'Entreprise',
                'description': 'Plus de 18 ans d\'expérience au service des entreprises commerciales, des institutions financières et des fonds d\'investissement en Europe.'
            },
            'platform': {
                'title': 'Plateforme Tout-en-Un',
                'description': 'Solution complète pour les entreprises, de la création de société aux services bancaires, comptabilité, conseil fiscal, investissement et assurance.'
            },
            'technology': {
                'title': 'Technologie Moderne',
                'description': 'Utilisation de l\'Intelligence Artificielle et de la Blockchain pour rendre les services bancaires aux entreprises meilleurs, plus faciles et plus efficaces.'
            }
        },
        'certifications': {
            'licensed': {
                'title': 'Agréé',
                'description': 'Agents Agréés par l\'État'
            },
            'certified': {
                'title': 'Certifié',
                'description': 'Professionnels Certifiés du Secteur'
            },
            'bonded': {
                'title': 'Cautionné',
                'description': 'Opérations Cautionnées & Assurées'
            },
            'encrypted': {
                'title': 'Chiffré',
                'description': 'Sécurité de Niveau Bancaire'
            }
        }
    }

    # Tax Advisory translations
    fr['taxAdvisory'] = {
        'services': {
            'taxReturn': {
                'title': 'Préparation des Déclarations Fiscales',
                'description': 'Préparation et dépôt professionnels des déclarations fiscales d\'entreprise et individuelles dans plusieurs juridictions.',
                'price': '€299'
            },
            'international': {
                'title': 'Fiscalité Internationale',
                'description': 'Conseils experts sur les questions fiscales transfrontalières, les prix de transfert et les conventions de double imposition.',
                'price': '€250'
            },
            'corporate': {
                'title': 'Fiscalité d\'Entreprise',
                'description': 'Services fiscaux d\'entreprise complets incluant la restructuration, les conseils fiscaux en fusions-acquisitions et le conseil en TVA.',
                'price': '€150'
            },
            'compliance': {
                'title': 'Conformité Fiscale',
                'description': 'Assurer une conformité continue avec l\'évolution des lois et réglementations fiscales au Luxembourg et au-delà.',
                'price': '€250'
            },
            'personal': {
                'title': 'Conseil Fiscal Personnel',
                'description': 'Conseils fiscaux personnalisés pour les particuliers fortunés et les expatriés.',
                'price': '€100'
            }
        }
    }

    with open('messages/fr.json', 'w', encoding='utf-8') as f:
        json.dump(fr, f, indent=2, ensure_ascii=False)

    print("✅ French translations added successfully")
    return fr

if __name__ == '__main__':
    print("🚀 Starting translation update...")
    print()

    en = add_english_translations()
    print(f"   English keys: {len(en)}")
    print()

    fr = add_french_translations()
    print(f"   French keys: {len(fr)}")
    print()

    print("✅ All translations updated successfully!")
    print(f"   Total translation keys added: ~350+")
