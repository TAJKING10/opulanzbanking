const fs = require('fs');
const path = require('path');

// Mock browser globals for fillTemplatePdf
global.fetch = async (url) => {
  const filePath = path.join(__dirname, '..', 'public', url);
  const buf = fs.readFileSync(filePath);
  return {
    ok: true,
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  };
};
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');

async function main() {
  const { fillTemplatePdf } = require('../components/investment-advisory-test/iat-pdf-filler');

  const testFormData = {
    clientType: 'personal',
    hasTitulaire2: false,
    titulaire1: {
      civility: 'M',
      lastName: 'Chauhan',
      firstName: 'Aayush',
      maidenName: '',
      birthDate: '2000-06-13',
      birthPlace: 'Paris',
      nationality: 'Française',
      address: '15 Rue de la Paix, 75002 Paris',
      email: 'aayushc.brainerhub@gmail.com',
      phone: '898989898',
      legalProtection: false,
      fiscalResidence: 'France',
      fiscalResidenceOther: '',
      profession: 'Software Developer',
      isRetired: false,
      isBusinessOwner: false,
      isUSPerson: false,
    },
    maritalStatus: {
      status: 'single',
      marriageDate: '',
      pacsDate: '',
      divorceDate: '',
      numberOfChildren: '0',
      childrenAtCharge: '0',
    },
    personalFinancial: {
      t1Income: '100-150k',
      t1Patrimony: '300-500k',
      t1Commitments: '30',
      t1SavingsCapacity: '10000',
      t1IR: true,
      t1IFI: false,
      fundNature: 'both',
      amountToInvest: '50000',
      fundOrigins: ['revenus_pro', 'epargne', 'assurance_vie', 'jeux', 'cession_mob', 'heritage'],
      fundOriginOther: '',
      bankOrigin: 'BNP Paribas',
    },
    productKnowledge: {
      monetary: {
        held: true,
        holdingPeriod: '+4',
        opsPerYear: '1-5',
        volume: '5-10k',
        q1: 'vrai',
        q2: 'vrai',
      },
      bonds: {
        held: false,
        holdingPeriod: '',
        opsPerYear: '',
        volume: '',
        q1: 'vrai',
        q2: 'faux',
      },
      stocks: {
        held: true,
        holdingPeriod: '+4',
        opsPerYear: '6+',
        volume: '>50k',
        q1: 'vrai',
        q2: 'vrai',
      },
      scpi: {
        held: false,
        holdingPeriod: '',
        opsPerYear: '',
        volume: '',
        q1: 'vrai',
        q2: 'ne_sais_pas',
      },
      privateEquity: {
        held: false,
        holdingPeriod: '',
        opsPerYear: '',
        volume: '',
        q1: 'vrai',
        q2: 'faux',
      },
      etf: {
        held: true,
        holdingPeriod: '+4',
        opsPerYear: '1-5',
        volume: '5-10k',
        q1: 'vrai',
        q2: 'vrai',
      },
      derivatives: {
        held: false,
        holdingPeriod: '',
        opsPerYear: '',
        volume: '',
        q1: 'ne_sais_pas',
        q2: 'ne_sais_pas',
      },
      structured: {
        held: false,
        holdingPeriod: '',
        opsPerYear: '',
        volume: '',
        q1: 'vrai',
        q2: 'faux',
      },
      managedPortfolio: true,
      selfManaged: false,
      advisedPortfolio: true,
      financialSectorExp: false,
      readsPress: true,
      followsMarkets: true,
      checksMonthly: true,
    },
    objectives: {
      capitalPreservation: false,
      capitalGrowth: true,
      diversification: true,
      incomeSearch: false,
      transmission: false,
      taxOptimization: true,
      other: '',
      riskProfile: 'B',
      pastLoss: '10-20',
      reactionToDrop: 'reinvest',
      reactionToGain: 'reinvest-more',
      horizon: '3-5',
      liquidityNeeded: true,
      maxLoss: '25',
      percentOfPatrimony: '25-50',
    },
    esg: {
      wantsESG: true,
      taxonomyPct: '25',
      sustainablePct: '50',
      impactFactors: true,
      negativeImpacts: ['greenhouse_gas', 'biodiversity', 'hazardous_waste', 'pay_equality'],
    },
    appointment: { booked: true },
  };

  console.log('Generating calibrated QCC PDF...');
  const { base64, pageCount } = await fillTemplatePdf('personal', testFormData);
  console.log(`Generated ${pageCount} pages, ${base64.length} base64 chars`);

  const pdfBuffer = Buffer.from(base64, 'base64');
  
  // Write to both workspace root and public folder
  const rootPath = path.join(__dirname, '..', 'test-filled-qcc.pdf');
  const publicPath = path.join(__dirname, '..', 'public', 'test-filled-qcc.pdf');

  fs.writeFileSync(rootPath, pdfBuffer);
  fs.writeFileSync(publicPath, pdfBuffer);

  console.log(`✅ Saved to ${rootPath} (${pdfBuffer.length} bytes)`);
  console.log(`✅ Saved to ${publicPath} (available at http://localhost:3000/test-filled-qcc.pdf)`);
}

main().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
