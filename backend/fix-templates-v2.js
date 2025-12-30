/**
 * Template Fixer V2 - Enhanced version
 * Opens DOCX files and performs comprehensive placeholder replacement
 * Handles Word formatting (text runs, formatting breaks, etc.)
 */

const fs = require('fs').promises;
const path = require('path');
const PizZip = require('pizzip');

// More aggressive text cleaning and replacement
function cleanAndReplaceText(xmlContent) {
  let modified = xmlContent;

  // Common patterns to replace with placeholders
  const replacements = [
    // Generic field patterns
    { pattern: /_+/g, replacement: '__PLACEHOLDER__' },
    { pattern: /\.{3,}/g, replacement: '__PLACEHOLDER__' },

    // Specific French field labels that should become placeholders
    // Name fields
    { pattern: />NOM,?\s*PRENOM\s*DU\s*CLIENT</gi, replacement: '>{client_full_name}<' },
    { pattern: />NOM\s*DU\s*CLIENT</gi, replacement: '>{client_full_name}<' },
    { pattern: />Nom,?\s*Prénom</gi, replacement: '>{client_full_name}<' },

    // Address fields
    { pattern: />ADRESSE</gi, replacement: '>{client_address}<' },
    { pattern: />CP\s*-\s*VILLE</gi, replacement: '>{client_postal_code} - {client_city}<' },
    { pattern: />CODE\s*POSTAL</gi, replacement: '>{client_postal_code}<' },
    { pattern: />VILLE</gi, replacement: '>{client_city}<' },

    // Contact fields
    { pattern: />E-?MAIL</gi, replacement: '>{client_email}<' },
    { pattern: />TÉLÉPHONE</gi, replacement: '>{client_phone}<' },
    { pattern: />TELEPHONE</gi, replacement: '>{client_phone}<' },

    // Date fields
    { pattern: />DATE\s*DU\s*JOUR</gi, replacement: '>{date_der}<' },
    { pattern: />le\s*__PLACEHOLDER__</gi, replacement: '>le {date_letter}<' },

    // Financial fields
    { pattern: />Revenus\s*du\s*foyer</gi, replacement: '>{household_income_range}<' },
    { pattern: />Patrimoine</gi, replacement: '>{patrimony_range}<' },
    { pattern: />Liquidités</gi, replacement: '>{cash_amount}<' },
    { pattern: />Actifs\s*financiers</gi, replacement: '>{financial_assets}<' },
    { pattern: />Immobilier</gi, replacement: '>{real_estate_value}<' },

    // Risk profile
    { pattern: />Profil\s*de\s*risque</gi, replacement: '>{risk_profile}<' },
    { pattern: />Horizon\s*de\s*placement</gi, replacement: '>{horizon_years} ans<' },
    { pattern: />Perte\s*maximale\s*acceptée</gi, replacement: '>{max_drawdown_accepted}%<' },

    // Company fields (PM)
    { pattern: />Dénomination\s*sociale</gi, replacement: '>{company_name}<' },
    { pattern: />Forme\s*juridique</gi, replacement: '>{legal_form}<' },
    { pattern: />Numéro\s*RCS</gi, replacement: '>{rcs_number}<' },
    { pattern: />Secteur\s*d'activité</gi, replacement: '>{sector}<' },

    // Representative fields
    { pattern: />Nom\s*du\s*représentant</gi, replacement: '>{rep_name}<' },
    { pattern: />Fonction</gi, replacement: '>{rep_position}<' },
  ];

  let changeCount = 0;
  replacements.forEach(({ pattern, replacement }) => {
    const before = modified;
    modified = modified.replace(pattern, replacement);
    if (before !== modified) {
      changeCount++;
    }
  });

  return { content: modified, changeCount };
}

/**
 * Process template file
 */
async function processTemplate(fileName) {
  const templatePath = path.join(__dirname, 'templates', fileName);
  const backupPath = path.join(__dirname, 'templates', 'backup_v2', fileName);

  try {
    console.log(`\n📄 Processing: ${fileName}`);

    // Read the DOCX file
    const content = await fs.readFile(templatePath);

    // Create backup
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(templatePath, backupPath);
    console.log(`   💾 Backup created`);

    // Load as ZIP
    const zip = new PizZip(content);

    // Process document.xml (main document)
    let docXml = zip.file('word/document.xml').asText();
    const result = cleanAndReplaceText(docXml);

    if (result.changeCount > 0) {
      // Update document.xml
      zip.file('word/document.xml', result.content);

      // Save modified DOCX
      const buf = zip.generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      await fs.writeFile(templatePath, buf);
      console.log(`   ✅ Applied ${result.changeCount} replacements`);
      console.log(`   ✅ Template updated`);
    } else {
      console.log(`   ℹ️  No changes needed`);
    }

  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
  }
}

/**
 * Main
 */
async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 OPULANZ TEMPLATE FIXER V2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Enhanced placeholder replacement');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const templates = [
    '2022 09 08 - PARCOURS CLIENT_DER_CIF_vf - 16.11.2022.docx',
    '3-2022 09 08 - PARCOURS CLIENT_Lettre de mission_Vf - 16.11.2022.docx',
    'PARCOURS CLIENT - QCC et profil de risques PP - CIF IAS.docx',
    'PARCOURS CLIENT - QCC et profil de risques PM - CIF IAS.docx',
    '5-2022 09 08 - PARCOURS CLIENT_Déclaration d\'adéquation CIF_vf.docx',
    '2021 02 16 - PARCOURS CLIENT - Procedure relative à la relation client.docx',
  ];

  for (const template of templates) {
    await processTemplate(template);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ PROCESSING COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 Next: Submit a test application to verify\n');
}

main().catch(console.error);
