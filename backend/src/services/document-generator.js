/**
 * Document Generator Service
 * Generates client onboarding documents from templates
 * Supports both PP (Personne Physique) and PM (Personne Morale)
 */

const fs = require('fs').promises;
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { convertToPDF } = require('./pdf-converter');

// Template configuration mapping
const TEMPLATE_CONFIG = {
  der: {
    file: '2022 09 08 - PARCOURS CLIENT_DER_CIF_vf - 16.11.2022.docx',
    name: 'DER - Document d\'Entrée en Relation',
    placeholders: {
      client_full_name: (data) => data.client.full_name,
      client_address: (data) => data.client.address,
      client_email: (data) => data.client.email,
      client_phone: (data) => data.client.phone,
      date_der: (data) => new Date().toLocaleDateString('fr-FR'),
      communication_channel_email_checked: (data) => data.preferences?.email ? '☒' : '☐',
      communication_channel_mail_checked: (data) => data.preferences?.mail ? '☒' : '☐',
      communication_channel_phone_checked: (data) => data.preferences?.phone ? '☒' : '☐',
    }
  },

  lettre_mission: {
    file: '3-2022 09 08 - PARCOURS CLIENT_Lettre de mission_Vf - 16.11.2022.docx',
    name: 'Lettre de mission CIF',
    placeholders: {
      client_full_name: (data) => data.client.full_name,
      client_address: (data) => data.client.address,
      city: (data) => data.client.city || 'Luxembourg',
      date_letter: (data) => new Date().toLocaleDateString('fr-FR'),

      // Objectives
      objective_structuration: (data) => data.objectives?.structuration ? '☒' : '☐',
      objective_protection: (data) => data.objectives?.protection ? '☒' : '☐',
      objective_investment_help: (data) => data.objectives?.investment_help ? '☒' : '☐',
      objective_financing: (data) => data.objectives?.financing ? '☒' : '☐',

      // Mission type
      mission_diagnostic: (data) => data.mission?.diagnostic ? '☒' : '☐',
      mission_followup: (data) => data.mission?.followup ? '☒' : '☐',
      mission_investment_advice: (data) => data.mission?.investment_advice ? '☒' : '☐',

      // Fees
      study_fee_amount: (data) => data.fees?.study_fee || '0',
      followup_fee_rate: (data) => data.fees?.followup_rate || '0',
    }
  },

  qcc_pp: {
    file: 'PARCOURS CLIENT - QCC et profil de risques PP - CIF IAS.docx',
    name: 'QCC + Profil - Personne Physique',
    placeholders: {
      // PP1 (Primary Person)
      pp1_first_name: (data) => data.client.first_name,
      pp1_last_name: (data) => data.client.last_name,
      pp1_birthdate: (data) => data.client.birthdate,
      pp1_nationality: (data) => data.client.nationality,
      pp1_address: (data) => data.client.address,
      pp1_email: (data) => data.client.email,
      pp1_phone: (data) => data.client.phone,

      // PP2 (Secondary Person - for joint accounts)
      pp2_first_name: (data) => data.client2?.first_name || '',
      pp2_last_name: (data) => data.client2?.last_name || '',
      pp2_birthdate: (data) => data.client2?.birthdate || '',

      // Family / Marital
      marital_status: (data) => data.family?.marital_status || '',
      marriage_date: (data) => data.family?.marriage_date || '',
      number_of_children: (data) => data.family?.children?.length || 0,

      // Financial
      household_income_range: (data) => data.financial_profile?.income_range || '',
      patrimony_range: (data) => data.financial_profile?.patrimony_range || '',
      debt_ratio: (data) => data.financial_profile?.debt_ratio || '0',

      // Assets
      cash_amount: (data) => data.financial_profile?.assets?.cash || 0,
      financial_assets: (data) => data.financial_profile?.assets?.financial || 0,
      real_estate_value: (data) => data.financial_profile?.assets?.real_estate || 0,
      professional_value: (data) => data.financial_profile?.assets?.professional || 0,

      // Objectives (ordered)
      objective_preservation_order: (data) => data.objectives?.preservation || '',
      objective_growth_order: (data) => data.objectives?.growth || '',
      objective_income_order: (data) => data.objectives?.income || '',
      objective_diversification_order: (data) => data.objectives?.diversification || '',
      objective_tax_optimization_order: (data) => data.objectives?.tax_optimization || '',

      // Risk Profile
      risk_profile: (data) => data.risk_profile?.category || 'Équilibré',
      risk_score: (data) => data.risk_profile?.score || 0,
      max_drawdown_accepted: (data) => data.risk_profile?.max_drawdown_accepted || 0,
      horizon_years: (data) => data.risk_profile?.horizon_years || 0,

      // Knowledge & Experience
      knowledge_stocks: (data) => data.knowledge_experience?.stocks ? 'Oui' : 'Non',
      knowledge_bonds: (data) => data.knowledge_experience?.bonds ? 'Oui' : 'Non',
      knowledge_funds: (data) => data.knowledge_experience?.funds ? 'Oui' : 'Non',
      knowledge_derivatives: (data) => data.knowledge_experience?.derivatives ? 'Oui' : 'Non',
    }
  },

  qcc_pm: {
    file: 'PARCOURS CLIENT - QCC et profil de risques PM - CIF IAS.docx',
    name: 'QCC + Profil - Personne Morale',
    placeholders: {
      // Company
      company_name: (data) => data.company?.name || '',
      legal_form: (data) => data.company?.legal_form || '',
      head_office_address: (data) => data.company?.address || '',
      country: (data) => data.company?.country || '',
      rcs_number: (data) => data.company?.rcs_number || '',
      sector: (data) => data.company?.sector || '',
      regulated_activity: (data) => data.company?.regulated_activity ? 'Oui' : 'Non',
      regulator: (data) => data.company?.regulator || '',

      // Representative
      rep_name: (data) => data.representative?.name || '',
      rep_position: (data) => data.representative?.position || '',
      rep_email: (data) => data.representative?.email || '',
      rep_phone: (data) => data.representative?.phone || '',

      // Financial
      balance_sheet_total: (data) => data.financial_profile?.balance_sheet_total || 0,
      revenue: (data) => data.financial_profile?.revenue || 0,
      equity: (data) => data.financial_profile?.equity || 0,
      debt_ratio: (data) => data.financial_profile?.debt_ratio || 0,

      // Patrimony
      cash_amount: (data) => data.financial_profile?.assets?.cash || 0,
      financial_assets: (data) => data.financial_profile?.assets?.financial || 0,
      real_estate_value: (data) => data.financial_profile?.assets?.real_estate || 0,
      professional_value: (data) => data.financial_profile?.assets?.professional || 0,

      // Origin of funds
      origin_of_funds: (data) => data.financial_profile?.origin_of_funds || '',
      bank_name: (data) => data.financial_profile?.bank_name || '',

      // Risk & Objectives (same as PP)
      risk_profile: (data) => data.risk_profile?.category || 'Équilibré',
      objective_preservation_order: (data) => data.objectives?.preservation || '',
      objective_growth_order: (data) => data.objectives?.growth || '',
    }
  },

  adequation: {
    file: '5-2022 09 08 - PARCOURS CLIENT_Déclaration d\'adéquation CIF_vf.docx',
    name: 'Déclaration d\'adéquation',
    placeholders: {
      client_full_name: (data) => data.client.full_name,
      summary_objectives: (data) => generateObjectivesSummary(data),
      summary_profile: (data) => generateProfileSummary(data),
      recommended_products_table: (data) => generateProductsTable(data),
      costs_table: (data) => generateCostsTable(data),
      followup_frequency: (data) => data.followup?.frequency || 'annuellement',
    }
  },

  rto: {
    file: '2021 02 16 - PARCOURS CLIENT - Procedure relative à la relation client.docx',
    name: 'Convention RTO',
    placeholders: {
      client_full_name: (data) => data.client.full_name,
      account_reference: (data) => data.account?.reference || '',
      date_rto_convention: (data) => new Date().toLocaleDateString('fr-FR'),
    }
  }
};

/**
 * Generate objectives summary text
 */
function generateObjectivesSummary(data) {
  const objectives = data.objectives || {};
  const ordered = Object.entries(objectives)
    .filter(([key, value]) => value > 0)
    .sort((a, b) => a[1] - b[1])
    .map(([key]) => {
      const names = {
        preservation: 'préservation du capital',
        growth: 'croissance du patrimoine',
        income: 'génération de revenus',
        diversification: 'diversification',
        tax_optimization: 'optimisation fiscale'
      };
      return names[key] || key;
    });

  return ordered.length > 0
    ? `Les objectifs principaux sont : ${ordered.join(', ')}.`
    : 'Aucun objectif spécifique défini.';
}

/**
 * Generate profile summary text
 */
function generateProfileSummary(data) {
  const profile = data.risk_profile || {};
  const experience = data.knowledge_experience || {};

  return `Profil de risque: ${profile.category || 'Non défini'}. ` +
         `Horizon d'investissement: ${profile.horizon_years || 0} ans. ` +
         `Perte maximale acceptable: ${profile.max_drawdown_accepted || 0}%.`;
}

/**
 * Generate products table
 */
function generateProductsTable(data) {
  const products = data.investment_plan?.products || [];
  if (products.length === 0) return 'Aucun produit recommandé pour le moment.';

  return products.map(p =>
    `${p.name} - ${p.allocation}% (${p.category})`
  ).join('\n');
}

/**
 * Generate costs table
 */
function generateCostsTable(data) {
  const fees = data.fees || {};
  return `Frais d'étude: €${fees.study_fee || 0}\n` +
         `Frais de suivi: ${fees.followup_rate || 0}%`;
}

/**
 * Generate document from template
 */
async function generateDocument(templateKey, clientData) {
  try {
    const config = TEMPLATE_CONFIG[templateKey];
    if (!config) {
      throw new Error(`Template ${templateKey} not found`);
    }

    // Read template file
    const templatePath = path.join(__dirname, '../../templates', config.file);
    const content = await fs.readFile(templatePath);

    // Load template
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Build data object with all placeholders
    const templateData = {};
    for (const [placeholder, getter] of Object.entries(config.placeholders)) {
      try {
        templateData[placeholder] = getter(clientData);
      } catch (error) {
        console.warn(`Failed to get value for ${placeholder}:`, error.message);
        templateData[placeholder] = '';
      }
    }

    // Render document
    doc.render(templateData);

    // Generate buffer
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return {
      buffer: buf,
      filename: `${templateKey}_${clientData.client.id || 'client'}.docx`,
      templateName: config.name
    };
  } catch (error) {
    console.error(`Error generating document ${templateKey}:`, error);
    throw error;
  }
}

/**
 * Generate all documents for client onboarding
 */
async function generateOnboardingDocuments(clientData) {
  const documents = [];
  const clientType = clientData.client_type || 'PP';

  try {
    // DER - Always required
    documents.push(await generateDocument('der', clientData));

    // Lettre de mission - Always required
    documents.push(await generateDocument('lettre_mission', clientData));

    // QCC + Profil - Based on client type
    if (clientType === 'PP') {
      documents.push(await generateDocument('qcc_pp', clientData));
    } else if (clientType === 'PM') {
      documents.push(await generateDocument('qcc_pm', clientData));
    }

    // Déclaration d'adéquation - Always required
    documents.push(await generateDocument('adequation', clientData));

    // Convention RTO - Only if requested
    if (clientData.services?.rto) {
      documents.push(await generateDocument('rto', clientData));
    }

    console.log(`✅ Generated ${documents.length} documents for client ${clientData.client.id}`);
    return documents;
  } catch (error) {
    console.error('❌ Error generating onboarding documents:', error);
    throw error;
  }
}

/**
 * Save documents to temp folder
 */
async function saveDocumentsToTemp(documents, clientId) {
  const tempDir = path.join(__dirname, '../../temp', `client_${clientId}`);

  // Create temp directory
  await fs.mkdir(tempDir, { recursive: true });

  const savedDocs = [];
  for (const doc of documents) {
    const filePath = path.join(tempDir, doc.filename);
    await fs.writeFile(filePath, doc.buffer);
    savedDocs.push({
      path: filePath,
      filename: doc.filename,
      templateName: doc.templateName
    });
  }

  return savedDocs;
}

module.exports = {
  TEMPLATE_CONFIG,
  generateDocument,
  generateOnboardingDocuments,
  saveDocumentsToTemp,
  generateObjectivesSummary,
  generateProfileSummary,
};
