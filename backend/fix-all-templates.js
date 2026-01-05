/**
 * FINAL Template Fixer - Comprehensive Solution
 * Replaces ALL underscores and blank fields with proper placeholders
 */

const fs = require('fs').promises;
const path = require('path');
const PizZip = require('pizzip');

function fixTemplateContent(xml, templateType) {
  let content = xml;
  let changesMade = 0;

  // Universal replacements (all templates)
  const universalReplacements = [
    // Replace multiple underscores with placeholders
    { find: /__{5,}/g, replace: '{__FIELD__}', desc: 'Long underscore fields' },
    { find: /\.{3,}/g, replace: '{__FIELD__}', desc: 'Dot fields' },
  ];

  // Template-specific replacements
  const specificReplacements = {
    qcc_pp: [
      // Name fields
      { find: /Nom\(s\)\s*:\s*_+/g, replace: 'Nom(s): {pp1_last_name}' },
      { find: /Nom de Jeune fille\s*:\s*_+/g, replace: 'Nom de Jeune fille: {pp1_maiden_name}' },
      { find: /Prénom\(s\)\s*:\s*_+/g, replace: 'Prénom(s): {pp1_first_name}' },
      { find: /Né\(e\) le\s*:\s*_+\/+_+\/+_+\s*à\s*_+/g, replace: 'Né(e) le: {pp1_birthdate} à {pp1_birthplace}' },
      { find: /Nationalité\s*:\s*_+/g, replace: 'Nationalité: {pp1_nationality}' },
      { find: /Adresse\s*:\s*_+/g, replace: 'Adresse: {pp1_address}' },
      { find: /Code postal\s*:\s*_+/g, replace: 'Code postal: {pp1_postal_code}' },
      { find: /Ville\s*:\s*_+/g, replace: 'Ville: {pp1_city}' },
      { find: /Pays\s*:\s*_+/g, replace: 'Pays: {pp1_country}' },
      { find: /E-?mail\s*:\s*_+/g, replace: 'Email: {pp1_email}' },
      { find: /Téléphone\s*:\s*_+/g, replace: 'Téléphone: {pp1_phone}' },

      // Financial fields
      { find: /Revenus annuels du foyer\s*:\s*_+/g, replace: 'Revenus annuels du foyer: {household_income_range}' },
      { find: /Patrimoine global\s*:\s*_+/g, replace: 'Patrimoine global: {patrimony_range}' },
      { find: /Liquidités\s*:\s*_+/g, replace: 'Liquidités: {cash_amount} €' },
      { find: /Valeurs mobilières\s*:\s*_+/g, replace: 'Valeurs mobilières: {financial_assets} €' },
      { find: /Immobilier\s*:\s*_+/g, replace: 'Immobilier: {real_estate_value} €' },
    ],

    qcc_pm: [
      // Company fields
      { find: /Dénomination sociale\s*:\s*_+/g, replace: 'Dénomination sociale: {company_name}' },
      { find: /Forme juridique\s*:\s*_+/g, replace: 'Forme juridique: {legal_form}' },
      { find: /Numéro RCS\s*:\s*_+/g, replace: 'Numéro RCS: {rcs_number}' },
      { find: /Siège social\s*:\s*_+/g, replace: 'Siège social: {head_office_address}' },
      { find: /Secteur d'activité\s*:\s*_+/g, replace: 'Secteur d\'activité: {sector}' },
      { find: /Nom du représentant\s*:\s*_+/g, replace: 'Nom du représentant: {rep_name}' },
      { find: /Fonction\s*:\s*_+/g, replace: 'Fonction: {rep_position}' },
      { find: /Chiffre d'affaires\s*:\s*_+/g, replace: 'Chiffre d\'affaires: {revenue} €' },
    ],

    der: [
      { find: /NOM, PRÉNOM DU CLIENT/g, replace: '{client_full_name}' },
      { find: /ADRESSE/g, replace: '{client_address}' },
      { find: /CP - VILLE/g, replace: '{client_postal_code} - {client_city}' },
      { find: /E-MAIL/g, replace: '{client_email}' },
      { find: /TÉLÉPHONE/g, replace: '{client_phone}' },
    ],

    lettre_mission: [
      // Already has some placeholders, just ensure consistency
      { find: /le\s+………………………\./g, replace: 'le {date_letter}' },
      { find: /en date du\s+…………………………………………………\./g, replace: 'en date du {date_der}' },
    ],

    adequation: [
      { find: /NOM, PRÉNOM DU CLIENT/g, replace: '{client_full_name}' },
    ],
  };

  // Apply universal replacements
  universalReplacements.forEach(({ find, replace, desc }) => {
    const before = content;
    content = content.replace(find, replace);
    if (before !== content) {
      changesMade++;
      console.log(`      ✓ ${desc}`);
    }
  });

  // Apply template-specific replacements
  const specificReps = specificReplacements[templateType] || [];
  specificReps.forEach(({ find, replace }) => {
    const before = content;
    content = content.replace(find, replace);
    if (before !== content) {
      changesMade++;
    }
  });

  return { content, changesMade };
}

async function processTemplate(fileName, templateType) {
  const templatePath = path.join(__dirname, 'templates', fileName);
  const backupPath = path.join(__dirname, 'templates', 'backup_final', fileName);

  try {
    console.log(`\n📄 ${fileName}`);

    // Read template
    const fileContent = await fs.readFile(templatePath);

    // Create backup
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(templatePath, backupPath);
    console.log(`   💾 Backup created`);

    // Load ZIP
    const zip = new PizZip(fileContent);

    // Get document.xml
    const docXml = zip.file('word/document.xml').asText();

    // Apply fixes
    const result = fixTemplateContent(docXml, templateType);

    if (result.changesMade > 0) {
      // Update ZIP
      zip.file('word/document.xml', result.content);

      // Save
      const buf = zip.generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      await fs.writeFile(templatePath, buf);
      console.log(`   ✅ ${result.changesMade} changes applied`);
    } else {
      console.log(`   ✓ No changes needed (already fixed)`);
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('📋 OPULANZ TEMPLATE FIXER - FINAL VERSION');
  console.log('═'.repeat(80));
  console.log('Comprehensive placeholder replacement for all templates');
  console.log('═'.repeat(80) + '\n');

  const templates = [
    { file: '2022 09 08 - PARCOURS CLIENT_DER_CIF_vf - 16.11.2022.docx', type: 'der' },
    { file: '3-2022 09 08 - PARCOURS CLIENT_Lettre de mission_Vf - 16.11.2022.docx', type: 'lettre_mission' },
    { file: 'PARCOURS CLIENT - QCC et profil de risques PP - CIF IAS.docx', type: 'qcc_pp' },
    { file: 'PARCOURS CLIENT - QCC et profil de risques PM - CIF IAS.docx', type: 'qcc_pm' },
    { file: '5-2022 09 08 - PARCOURS CLIENT_Déclaration d\'adéquation CIF_vf.docx', type: 'adequation' },
    { file: '2021 02 16 - PARCOURS CLIENT - Procedure relative à la relation client.docx', type: 'rto' },
  ];

  for (const { file, type } of templates) {
    await processTemplate(file, type);
  }

  console.log('\n' + '═'.repeat(80));
  console.log('✅ ALL TEMPLATES PROCESSED!');
  console.log('═'.repeat(80));
  console.log('\n📝 Next Steps:');
  console.log('   1. Submit a NEW test application');
  console.log('   2. Check DocuSign email - documents should be fully populated');
  console.log('   3. If successful, delete backup folders');
  console.log('\n💾 Backups saved to: backend/templates/backup_final/\n');
}

main().catch(console.error);
