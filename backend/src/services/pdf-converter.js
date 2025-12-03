/**
 * PDF Converter Service
 * Converts DOCX files to PDF using LibreOffice or cloud service
 */

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

const execPromise = util.promisify(exec);

/**
 * Convert DOCX to PDF using LibreOffice (if installed)
 */
async function convertToPDFLibreOffice(docxPath) {
  try {
    const outputDir = path.dirname(docxPath);
    const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${docxPath}"`;

    await execPromise(command);

    // Get PDF path
    const pdfPath = docxPath.replace('.docx', '.pdf');

    return pdfPath;
  } catch (error) {
    console.error('Error converting with LibreOffice:', error.message);
    throw new Error('LibreOffice conversion failed. Please ensure LibreOffice is installed.');
  }
}

/**
 * Convert DOCX buffer to PDF buffer (placeholder for cloud service)
 * In production, you'd use a service like CloudConvert, PDFShift, or AWS Lambda
 */
async function convertBufferToPDF(docxBuffer, originalFilename) {
  try {
    // For now, save to temp file and convert with LibreOffice
    const tempDir = path.join(__dirname, '../../temp');
    await fs.mkdir(tempDir, { recursive: true });

    const tempDocx = path.join(tempDir, originalFilename);
    await fs.writeFile(tempDocx, docxBuffer);

    // Convert
    const pdfPath = await convertToPDFLibreOffice(tempDocx);

    // Read PDF
    const pdfBuffer = await fs.readFile(pdfPath);

    // Cleanup
    await fs.unlink(tempDocx);
    await fs.unlink(pdfPath);

    return pdfBuffer;
  } catch (error) {
    console.error('Error converting buffer to PDF:', error);
    throw error;
  }
}

/**
 * Convert all documents to PDF
 */
async function convertDocumentsToPDF(documents) {
  const pdfDocuments = [];

  for (const doc of documents) {
    try {
      // Save DOCX temporarily
      const tempDir = path.join(__dirname, '../../temp');
      await fs.mkdir(tempDir, { recursive: true });

      const docxPath = path.join(tempDir, doc.filename);
      await fs.writeFile(docxPath, doc.buffer);

      // Convert to PDF
      const pdfPath = await convertToPDFLibreOffice(docxPath);

      // Read PDF
      const pdfBuffer = await fs.readFile(pdfPath);

      pdfDocuments.push({
        ...doc,
        filename: doc.filename.replace('.docx', '.pdf'),
        buffer: pdfBuffer,
        path: pdfPath,
      });

      console.log(`✅ Converted to PDF: ${doc.filename}`);
    } catch (error) {
      console.error(`❌ Failed to convert ${doc.filename}:`, error.message);
      // Continue with next document
    }
  }

  return pdfDocuments;
}

module.exports = {
  convertToPDFLibreOffice,
  convertBufferToPDF,
  convertDocumentsToPDF,
};
