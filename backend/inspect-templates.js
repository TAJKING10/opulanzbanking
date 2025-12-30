/**
 * Template Inspector
 * Shows the actual text content in DOCX templates
 */

const fs = require('fs').promises;
const path = require('path');
const PizZip = require('pizzip');

async function inspectTemplate(fileName) {
  const templatePath = path.join(__dirname, 'templates', fileName);

  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📄 ${fileName}`);
    console.log('='.repeat(80));

    const content = await fs.readFile(templatePath);
    const zip = new PizZip(content);
    const docXml = zip.file('word/document.xml').asText();

    // Extract text between > and < tags (simplified)
    const textMatches = docXml.match(/>([^<>]+)</g);
    if (!textMatches) {
      console.log('   (No text content found)');
      return;
    }

    // Clean and show text
    const textLines = textMatches
      .map(match => match.slice(1, -1).trim())
      .filter(text => text.length > 0 && !text.match(/^[\s\n\r]*$/))
      .filter(text => !text.startsWith('<?xml'))
      .slice(0, 50); // First 50 lines

    console.log('\n📝 Sample text content (first 50 non-empty lines):\n');
    textLines.forEach((line, i) => {
      console.log(`   ${String(i + 1).padStart(3)}. ${line.substring(0, 80)}`);
    });

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('\n📋 TEMPLATE INSPECTOR');
  console.log('Showing actual text content in each template\n');

  const templates = [
    '2022 09 08 - PARCOURS CLIENT_DER_CIF_vf - 16.11.2022.docx',
    '3-2022 09 08 - PARCOURS CLIENT_Lettre de mission_Vf - 16.11.2022.docx',
    'PARCOURS CLIENT - QCC et profil de risques PP - CIF IAS.docx',
  ];

  for (const template of templates) {
    await inspectTemplate(template);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

main().catch(console.error);
