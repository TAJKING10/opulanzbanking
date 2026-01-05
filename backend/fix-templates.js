/**
 * Template Fixer Script
 * Automatically adds placeholders to DOCX templates
 */

const fs = require('fs').promises;
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Template replacement mappings
const REPLACEMENTS = {
  // DER Template
  'der': {
    file: '2022 09 08 - PARCOURS CLIENT_DER_CIF_vf - 16.11.2022.docx',
    replacements: [
      // Client information
      { find: /NOM,?\s*PR[ÉE]NOM\s*DU\s*CLIENT[\s:]*_+/gi, replace: '{client_full_name}' },
      { find: /NOM\s*DU\s*CLIENT[\s:]*_+/gi, replace: '{client_full_name}' },
      { find: /ADRESSE[\s:]*_+/gi, replace: '{client_address}' },
      { find: /CP\s*-?\s*VILLE[\s:]*_+/gi, replace: '{client_postal_code} - {client_city}' },
      { find: /CODE\s*POSTAL[\s:]*_+/gi, replace: '{client_postal_code}' },
      { find: /VILLE[\s:]*_+/gi, replace: '{client_city}' },
      { find: /E-?MAIL[\s:]*_+/gi, replace: '{client_email}' },
      { find: /T[ÉE]L[ÉE]PHONE[\s:]*_+/gi, replace: '{client_phone}' },
      { find: /DATE\s*DU\s*JOUR[\s:]*_+/gi, replace: '{date_der}' },

      // Communication preferences
      { find: /☐\s*E-?mail/gi, replace: '{communication_channel_email_checked} E-mail' },
      { find: /☐\s*Courrier/gi, replace: '{communication_channel_mail_checked} Courrier' },
      { find: /☐\s*T[ÉE]l[ÉE]phone/gi, replace: '{communication_channel_phone_checked} Téléphone' },
    ]
  },

  // Lettre de Mission Template
  'lettre_mission': {
    file: '3-2022 09 08 - PARCOURS CLIENT_Lettre de mission_Vf - 16.11.2022.docx',
    replacements: [
      // Header/Client info
      { find: /NOM,?\s*PR[ÉE]NOM\s*DU\s*CLIENT[\s:]*\n?\s*ADRESSE[\s:]*\n?\s*CP\s*-\s*VILLE/gi,
        replace: '{client_full_name}\n{client_address}\n{client_postal_code} - {client_city}' },
      { find: /NOM,?\s*PR[ÉE]NOM\s*DU\s*CLIENT/gi, replace: '{client_full_name}' },
      { find: /ADRESSE/gi, replace: '{client_address}' },
      { find: /CP\s*-\s*VILLE/gi, replace: '{client_postal_code} - {client_city}' },

      // Date
      { find: /A\s+Sierck-les-bains,\s*le\s*\.+/gi, replace: 'A {city}, le {date_letter}' },
      { find: /le\s*\.{3,}/gi, replace: 'le {date_letter}' },

      // Objectives checkboxes
      { find: /☐\s*Structuration patrimoniale/gi, replace: '{objective_structuration} Structuration patrimoniale' },
      { find: /☐\s*Protection de mon patrimoine/gi, replace: '{objective_protection} Protection de mon patrimoine' },
      { find: /☐\s*Aide [àa] l'investissement/gi, replace: '{objective_investment_help} Aide à l\'investissement' },
      { find: /☐\s*Recherche de financement/gi, replace: '{objective_financing} Recherche de financement' },

      // Mission type checkboxes
      { find: /☐\s*Diagnostic/gi, replace: '{mission_diagnostic} Diagnostic' },
      { find: /☐\s*Suivi/gi, replace: '{mission_followup} Suivi' },
      { find: /☐\s*Conseil en investissement/gi, replace: '{mission_investment_advice} Conseil en investissement' },

      // Fees
      { find: /Frais d'[ée]tude[\s:]*\.+\s*€/gi, replace: 'Frais d\'étude: {study_fee_amount} €' },
      { find: /Frais de suivi[\s:]*\.+\s*%/gi, replace: 'Frais de suivi: {followup_fee_rate} %' },
    ]
  },

  // QCC PP Template
  'qcc_pp': {
    file: 'PARCOURS CLIENT - QCC et profil de risques PP - CIF IAS.docx',
    replacements: [
      // PP1 (Primary Person)
      { find: /PP1 Pr[ée]nom[\s:]*_+/gi, replace: 'PP1 Prénom: {pp1_first_name}' },
      { find: /PP1 Nom[\s:]*_+/gi, replace: 'PP1 Nom: {pp1_last_name}' },
      { find: /Date de naissance[\s:]*_+/gi, replace: 'Date de naissance: {pp1_birthdate}' },
      { find: /Nationalit[ée][\s:]*_+/gi, replace: 'Nationalité: {pp1_nationality}' },
      { find: /Lieu de naissance[\s:]*_+/gi, replace: 'Lieu de naissance: {pp1_place_of_birth}' },

      // Address
      { find: /Adresse compl[èe]te[\s:]*_+/gi, replace: 'Adresse complète: {pp1_address}' },
      { find: /E-?mail[\s:]*_+/gi, replace: 'E-mail: {pp1_email}' },
      { find: /T[ée]l[ée]phone[\s:]*_+/gi, replace: 'Téléphone: {pp1_phone}' },

      // PP2 (Secondary Person - if joint account)
      { find: /PP2 Pr[ée]nom[\s:]*_+/gi, replace: 'PP2 Prénom: {pp2_first_name}' },
      { find: /PP2 Nom[\s:]*_+/gi, replace: 'PP2 Nom: {pp2_last_name}' },
      { find: /PP2 Date de naissance[\s:]*_+/gi, replace: 'PP2 Date de naissance: {pp2_birthdate}' },

      // Family
      { find: /Situation matrimoniale[\s:]*_+/gi, replace: 'Situation matrimoniale: {marital_status}' },
      { find: /Date du mariage[\s:]*_+/gi, replace: 'Date du mariage: {marriage_date}' },
      { find: /Nombre d'enfants[\s:]*_+/gi, replace: 'Nombre d\'enfants: {number_of_children}' },

      // Financial Profile
      { find: /Revenus du foyer[\s:]*_+/gi, replace: 'Revenus du foyer: {household_income_range}' },
      { find: /Patrimoine[\s:]*_+/gi, replace: 'Patrimoine: {patrimony_range}' },
      { find: /Taux d'endettement[\s:]*_+/gi, replace: 'Taux d\'endettement: {debt_ratio}' },

      // Assets
      { find: /Liquidit[ée]s[\s:]*_+/gi, replace: 'Liquidités: {cash_amount}' },
      { find: /Actifs financiers[\s:]*_+/gi, replace: 'Actifs financiers: {financial_assets}' },
      { find: /Immobilier[\s:]*_+/gi, replace: 'Immobilier: {real_estate_value}' },
      { find: /Actifs professionnels[\s:]*_+/gi, replace: 'Actifs professionnels: {professional_value}' },

      // Objectives (numbered priority)
      { find: /Pr[ée]servation du capital[\s:]*_+/gi, replace: 'Préservation du capital: {objective_preservation_order}' },
      { find: /Croissance[\s:]*_+/gi, replace: 'Croissance: {objective_growth_order}' },
      { find: /Revenus[\s:]*_+/gi, replace: 'Revenus: {objective_income_order}' },
      { find: /Diversification[\s:]*_+/gi, replace: 'Diversification: {objective_diversification_order}' },
      { find: /Optimisation fiscale[\s:]*_+/gi, replace: 'Optimisation fiscale: {objective_tax_optimization_order}' },

      // Risk Profile
      { find: /Profil de risque[\s:]*_+/gi, replace: 'Profil de risque: {risk_profile}' },
      { find: /Score de risque[\s:]*_+/gi, replace: 'Score de risque: {risk_score}' },
      { find: /Perte maximale accept[ée]e[\s:]*_+/gi, replace: 'Perte maximale acceptée: {max_drawdown_accepted}%' },
      { find: /Horizon de placement[\s:]*_+\s*ans/gi, replace: 'Horizon de placement: {horizon_years} ans' },

      // Knowledge & Experience
      { find: /Actions[\s:]*_+/gi, replace: 'Actions: {knowledge_stocks}' },
      { find: /Obligations[\s:]*_+/gi, replace: 'Obligations: {knowledge_bonds}' },
      { find: /Fonds[\s:]*_+/gi, replace: 'Fonds: {knowledge_funds}' },
      { find: /Produits d[ée]riv[ée]s[\s:]*_+/gi, replace: 'Produits dérivés: {knowledge_derivatives}' },
    ]
  },

  // QCC PM Template
  'qcc_pm': {
    file: 'PARCOURS CLIENT - QCC et profil de risques PM - CIF IAS.docx',
    replacements: [
      // Company Information
      { find: /Nom de la soci[ée]t[ée][\s:]*_+/gi, replace: 'Nom de la société: {company_name}' },
      { find: /D[ée]nomination sociale[\s:]*_+/gi, replace: 'Dénomination sociale: {company_name}' },
      { find: /Forme juridique[\s:]*_+/gi, replace: 'Forme juridique: {legal_form}' },
      { find: /Adresse du si[èe]ge social[\s:]*_+/gi, replace: 'Adresse du siège social: {head_office_address}' },
      { find: /Pays[\s:]*_+/gi, replace: 'Pays: {country}' },
      { find: /Num[ée]ro RCS[\s:]*_+/gi, replace: 'Numéro RCS: {rcs_number}' },
      { find: /Secteur d'activit[ée][\s:]*_+/gi, replace: 'Secteur d\'activité: {sector}' },
      { find: /Activit[ée] r[ée]glement[ée]e[\s:]*_+/gi, replace: 'Activité réglementée: {regulated_activity}' },
      { find: /R[ée]gulateur[\s:]*_+/gi, replace: 'Régulateur: {regulator}' },

      // Representative
      { find: /Nom du repr[ée]sentant[\s:]*_+/gi, replace: 'Nom du représentant: {rep_name}' },
      { find: /Fonction[\s:]*_+/gi, replace: 'Fonction: {rep_position}' },
      { find: /E-?mail du repr[ée]sentant[\s:]*_+/gi, replace: 'E-mail du représentant: {rep_email}' },
      { find: /T[ée]l[ée]phone du repr[ée]sentant[\s:]*_+/gi, replace: 'Téléphone du représentant: {rep_phone}' },

      // Financial Information
      { find: /Total du bilan[\s:]*_+/gi, replace: 'Total du bilan: {balance_sheet_total}' },
      { find: /Chiffre d'affaires[\s:]*_+/gi, replace: 'Chiffre d\'affaires: {revenue}' },
      { find: /Capitaux propres[\s:]*_+/gi, replace: 'Capitaux propres: {equity}' },
      { find: /Taux d'endettement[\s:]*_+/gi, replace: 'Taux d\'endettement: {debt_ratio}' },

      // Assets
      { find: /Tr[ée]sorerie[\s:]*_+/gi, replace: 'Trésorerie: {cash_amount}' },
      { find: /Actifs financiers[\s:]*_+/gi, replace: 'Actifs financiers: {financial_assets}' },
      { find: /Immobilier[\s:]*_+/gi, replace: 'Immobilier: {real_estate_value}' },

      // Origin of funds
      { find: /Origine des fonds[\s:]*_+/gi, replace: 'Origine des fonds: {origin_of_funds}' },
      { find: /Nom de la banque[\s:]*_+/gi, replace: 'Nom de la banque: {bank_name}' },

      // Risk Profile (same as PP)
      { find: /Profil de risque[\s:]*_+/gi, replace: 'Profil de risque: {risk_profile}' },
      { find: /Objectif principal[\s:]*_+/gi, replace: 'Objectif principal: {objective_preservation_order}' },
    ]
  },

  // Adequation Template
  'adequation': {
    file: '5-2022 09 08 - PARCOURS CLIENT_Déclaration d\'adéquation CIF_vf.docx',
    replacements: [
      // Client name
      { find: /NOM,?\s*PR[ÉE]NOM\s*DU\s*CLIENT/gi, replace: '{client_full_name}' },
      { find: /Madame,?\s*Monsieur,?[\s:]*_+/gi, replace: 'Madame, Monsieur {client_full_name}' },

      // Summary sections
      { find: /R[ée]sum[ée] des objectifs[\s:]*_+/gi, replace: 'Résumé des objectifs:\n{summary_objectives}' },
      { find: /R[ée]sum[ée] du profil[\s:]*_+/gi, replace: 'Résumé du profil:\n{summary_profile}' },

      // Products table
      { find: /Produits recommand[ée]s[\s:]*_+/gi, replace: 'Produits recommandés:\n{recommended_products_table}' },

      // Costs
      { find: /Co[ûu]ts et frais[\s:]*_+/gi, replace: 'Coûts et frais:\n{costs_table}' },

      // Follow-up
      { find: /Fr[ée]quence de suivi[\s:]*_+/gi, replace: 'Fréquence de suivi: {followup_frequency}' },
    ]
  },

  // RTO Template
  'rto': {
    file: '2021 02 16 - PARCOURS CLIENT - Procedure relative à la relation client.docx',
    replacements: [
      { find: /NOM,?\s*PR[ÉE]NOM\s*DU\s*CLIENT/gi, replace: '{client_full_name}' },
      { find: /R[ée]f[ée]rence du compte[\s:]*_+/gi, replace: 'Référence du compte: {account_reference}' },
      { find: /Date de la convention[\s:]*_+/gi, replace: 'Date de la convention: {date_rto_convention}' },
    ]
  }
};

/**
 * Process a single template file
 */
async function processTemplate(templateKey) {
  const config = REPLACEMENTS[templateKey];
  if (!config) {
    console.warn(`⚠️  No replacement config for template: ${templateKey}`);
    return;
  }

  const templatePath = path.join(__dirname, 'templates', config.file);
  const backupPath = path.join(__dirname, 'templates', 'backup', config.file);

  try {
    console.log(`\n🔧 Processing: ${config.file}`);

    // Read template file
    const content = await fs.readFile(templatePath);

    // Create backup
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(templatePath, backupPath);
    console.log(`   ✅ Backup created`);

    // Load zip
    const zip = new PizZip(content);

    // Get document.xml (main document content)
    let docXml = zip.file('word/document.xml').asText();

    // Apply replacements
    let replacementCount = 0;
    for (const { find, replace } of config.replacements) {
      const beforeLength = docXml.length;
      docXml = docXml.replace(find, replace);
      if (docXml.length !== beforeLength) {
        replacementCount++;
      }
    }

    // Update the XML in the zip
    zip.file('word/document.xml', docXml);

    // Generate new DOCX
    const buf = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Save updated template
    await fs.writeFile(templatePath, buf);

    console.log(`   ✅ Applied ${replacementCount} placeholder patterns`);
    console.log(`   ✅ Template updated successfully`);

  } catch (error) {
    console.error(`   ❌ Error processing ${config.file}:`, error.message);

    // Restore from backup if exists
    try {
      await fs.copyFile(backupPath, templatePath);
      console.log(`   ↩️  Restored from backup`);
    } catch (restoreError) {
      console.error(`   ❌ Could not restore backup`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 OPULANZ TEMPLATE FIXER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('This script will add placeholders to your DOCX templates');
  console.log('Backups will be created in templates/backup/');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const templates = ['der', 'lettre_mission', 'qcc_pp', 'qcc_pm', 'adequation', 'rto'];

  for (const templateKey of templates) {
    await processTemplate(templateKey);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ TEMPLATE FIXING COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nNext steps:');
  console.log('1. Submit a new test application');
  console.log('2. Check that DocuSign documents are fully populated');
  console.log('3. If successful, delete the backup folder');
  console.log('\nOriginal templates backed up to: templates/backup/\n');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
