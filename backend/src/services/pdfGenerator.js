const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

class PDFGeneratorService {
  /**
   * Generate a KYC document PDF from form data
   * @param {Object} kycData - The KYC form data
   * @param {string} documentType - Type of document to generate
   * @returns {Promise<Buffer>}
   */
  async generateKYCDocument(kycData, documentType = 'QCC') {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add first page
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Header
    page.drawText('QUESTIONNAIRE DE CONNAISSANCE DU CLIENT', {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0.7, 0.5, 0.2) // Gold color
    });

    yPosition -= 30;
    page.drawText('OPULANZ BANKING', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont
    });

    yPosition -= 40;

    // Client Type
    this.addSection(page, font, boldFont, 'TYPE DE CLIENT', yPosition);
    yPosition -= 25;
    page.drawText(`Type: ${kycData.clientType === 'PP' ? 'Personne Physique (Individual)' : 'Personne Morale (Company)'}`, {
      x: 70,
      y: yPosition,
      size: 10,
      font: font
    });

    yPosition -= 30;

    // Contact Information
    this.addSection(page, font, boldFont, 'INFORMATIONS DE CONTACT', yPosition);
    yPosition -= 25;

    if (kycData.basicContact) {
      page.drawText(`Email: ${kycData.basicContact.email || 'N/A'}`, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font
      });
      yPosition -= 20;

      page.drawText(`Téléphone: ${kycData.basicContact.mobile || 'N/A'}`, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font
      });
      yPosition -= 20;
    }

    page.drawText(`Langue préférée: ${kycData.preferredLanguage === 'fr' ? 'Français' : 'English'}`, {
      x: 70,
      y: yPosition,
      size: 10,
      font: font
    });

    yPosition -= 30;

    // Personal/Company Information
    if (kycData.clientType === 'PP' && kycData.identityData) {
      await this.addIndividualInfo(page, pdfDoc, font, boldFont, kycData.identityData, yPosition);
    } else if (kycData.clientType === 'PM' && kycData.companyData) {
      await this.addCompanyInfo(page, pdfDoc, font, boldFont, kycData.companyData, yPosition);
    }

    // Generate PDF buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Add a section header to the PDF
   */
  addSection(page, font, boldFont, title, yPosition) {
    page.drawRectangle({
      x: 50,
      y: yPosition - 5,
      width: 495,
      height: 20,
      color: rgb(0.95, 0.95, 0.95)
    });

    page.drawText(title, {
      x: 60,
      y: yPosition,
      size: 11,
      font: boldFont
    });
  }

  /**
   * Add individual (PP) information to PDF
   */
  async addIndividualInfo(page, pdfDoc, font, boldFont, identityData, startY) {
    let yPosition = startY;

    this.addSection(page, font, boldFont, 'INFORMATIONS PERSONNELLES', yPosition);
    yPosition -= 25;

    const fields = [
      { label: 'Nom', value: identityData.lastName },
      { label: 'Prénom', value: identityData.firstName },
      { label: 'Date de naissance', value: identityData.dateOfBirth },
      { label: 'Lieu de naissance', value: identityData.placeOfBirth },
      { label: 'Nationalité', value: identityData.nationality },
      { label: 'Numéro de passeport/CNI', value: identityData.idNumber },
      { label: 'Adresse', value: identityData.address },
      { label: 'Ville', value: identityData.city },
      { label: 'Code postal', value: identityData.postalCode },
      { label: 'Pays', value: identityData.country }
    ];

    for (const field of fields) {
      if (yPosition < 100) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = 792;
      }

      page.drawText(`${field.label}: ${field.value || 'N/A'}`, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font
      });
      yPosition -= 20;
    }
  }

  /**
   * Add company (PM) information to PDF
   */
  async addCompanyInfo(page, pdfDoc, font, boldFont, companyData, startY) {
    let yPosition = startY;

    this.addSection(page, font, boldFont, 'INFORMATIONS SOCIÉTÉ', yPosition);
    yPosition -= 25;

    const fields = [
      { label: 'Raison sociale', value: companyData.companyName },
      { label: 'Forme juridique', value: companyData.legalForm },
      { label: 'SIRET/Registration', value: companyData.registrationNumber },
      { label: 'Date de création', value: companyData.incorporationDate },
      { label: 'Secteur d\'activité', value: companyData.businessSector },
      { label: 'Adresse du siège', value: companyData.address },
      { label: 'Ville', value: companyData.city },
      { label: 'Code postal', value: companyData.postalCode },
      { label: 'Pays', value: companyData.country }
    ];

    for (const field of fields) {
      if (yPosition < 100) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = 792;
      }

      page.drawText(`${field.label}: ${field.value || 'N/A'}`, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font
      });
      yPosition -= 20;
    }
  }

  /**
   * Generate Investment Advisory Agreement (Lettre de Mission)
   */
  async generateMissionLetter(kycData) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Header
    page.drawText('LETTRE DE MISSION', {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0.7, 0.5, 0.2)
    });

    yPosition -= 30;
    page.drawText('Conseil en Investissements Financiers', {
      x: 50,
      y: yPosition,
      size: 12,
      font: font
    });

    yPosition -= 40;

    // Mission content (simplified version)
    const missionText = `
La présente lettre a pour objet de définir les conditions dans lesquelles
OPULANZ BANKING exercera sa mission de conseil en investissements financiers.

Date: ${new Date().toLocaleDateString('fr-FR')}
Client: ${kycData.basicContact?.email || 'N/A'}
Type: ${kycData.clientType === 'PP' ? 'Personne Physique' : 'Personne Morale'}

[... Rest of mission letter content ...]
    `.trim();

    const lines = missionText.split('\n');
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font
      });
      yPosition -= 20;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Generate multiple documents for a KYC submission
   */
  async generateAllDocuments(kycData) {
    const documents = [];

    // 1. QCC (Questionnaire de Connaissance Client)
    const qccPdf = await this.generateKYCDocument(kycData, 'QCC');
    documents.push({
      type: 'QCC',
      name: `QCC_${kycData.clientType}_${Date.now()}.pdf`,
      buffer: qccPdf
    });

    // 2. Mission Letter (Lettre de Mission)
    const missionPdf = await this.generateMissionLetter(kycData);
    documents.push({
      type: 'MISSION_LETTER',
      name: `Lettre_Mission_${Date.now()}.pdf`,
      buffer: missionPdf
    });

    // Additional documents can be added here based on requirements

    return documents;
  }
}

module.exports = new PDFGeneratorService();
