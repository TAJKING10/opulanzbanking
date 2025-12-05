const { BlobServiceClient } = require('@azure/storage-blob');

class AzureStorageService {
  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'opulanz-documents';

    if (!this.connectionString || this.connectionString.includes('YOUR_')) {
      console.warn('⚠️  Azure Storage not configured. Documents will be stored locally.');
      this.isConfigured = false;
      return;
    }

    try {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to initialize Azure Storage:', error.message);
      this.isConfigured = false;
    }
  }

  async ensureContainer() {
    if (!this.isConfigured) return false;

    try {
      await this.containerClient.createIfNotExists({
        access: 'private'
      });
      return true;
    } catch (error) {
      console.error('Error creating container:', error.message);
      return false;
    }
  }

  /**
   * Upload a document to Azure Blob Storage
   * @param {Buffer} fileBuffer - The file content as a buffer
   * @param {string} fileName - The name for the file
   * @param {string} contentType - MIME type of the file
   * @returns {Promise<{url: string, blobName: string}>}
   */
  async uploadDocument(fileBuffer, fileName, contentType = 'application/pdf') {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured');
    }

    await this.ensureContainer();

    // Generate unique blob name with timestamp
    const timestamp = Date.now();
    const blobName = `${timestamp}-${fileName}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    try {
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      });

      return {
        url: blockBlobClient.url,
        blobName: blobName,
        containerName: this.containerName
      };
    } catch (error) {
      console.error('Error uploading to Azure Storage:', error.message);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Download a document from Azure Blob Storage
   * @param {string} blobName - The blob name to download
   * @returns {Promise<Buffer>}
   */
  async downloadDocument(blobName) {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    try {
      const downloadResponse = await blockBlobClient.download();
      const chunks = [];

      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error downloading from Azure Storage:', error.message);
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  /**
   * Delete a document from Azure Blob Storage
   * @param {string} blobName - The blob name to delete
   * @returns {Promise<boolean>}
   */
  async deleteDocument(blobName) {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    try {
      await blockBlobClient.deleteIfExists();
      return true;
    } catch (error) {
      console.error('Error deleting from Azure Storage:', error.message);
      return false;
    }
  }

  /**
   * Get a SAS URL for temporary access to a document
   * @param {string} blobName - The blob name
   * @param {number} expiryMinutes - Minutes until the URL expires (default: 60)
   * @returns {Promise<string>}
   */
  async getDocumentUrl(blobName, expiryMinutes = 60) {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    // For now, return the blob URL (in production, you'd generate a SAS token)
    return blockBlobClient.url;
  }
}

module.exports = new AzureStorageService();
