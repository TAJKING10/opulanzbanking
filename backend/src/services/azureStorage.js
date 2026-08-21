const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob');

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

      // Parse account name + key for SAS generation
      const accountName = /AccountName=([^;]+)/i.exec(this.connectionString)?.[1];
      const accountKey = /AccountKey=([^;]+)/i.exec(this.connectionString)?.[1];
      if (accountName && accountKey) {
        this.sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        this.accountName = accountName;
      }
    } catch (error) {
      console.error('Failed to initialize Azure Storage:', error.message);
      this.isConfigured = false;
    }
  }

  async ensureContainer() {
    if (!this.isConfigured) return false;

    try {
      // Create container without public access (private by default)
      await this.containerClient.createIfNotExists();
      console.log(`✅ Container '${this.containerName}' ready`);
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
      // Demo/mock mode — simulate upload, return local-like URL
      const mockBlobName = `mock-${Date.now()}-${fileName}`;
      console.log(`📁 Azure Storage MOCK: Simulating upload of ${fileName} (${fileBuffer.length} bytes)`);
      return {
        url: `http://localhost:5000/mock-docs/${mockBlobName}`,
        blobName: mockBlobName,
        containerName: 'mock-local',
        isMock: true,
      };
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

      // Prefer a time-limited SAS URL so browsers can View/Download private blobs
      const url = this.getSasUrl(blobName, 60 * 24 * 7) || blockBlobClient.url;

      return {
        url,
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
   * @returns {string|null}
   */
  getSasUrl(blobName, expiryMinutes = 60) {
    if (!this.isConfigured || !this.sharedKeyCredential) {
      return null;
    }

    const expiresOn = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const sas = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn,
      },
      this.sharedKeyCredential
    ).toString();

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    return `${blockBlobClient.url}?${sas}`;
  }

  /**
   * Get a SAS URL for temporary access to a document (async alias)
   */
  async getDocumentUrl(blobName, expiryMinutes = 60) {
    if (!this.isConfigured) {
      throw new Error('Azure Storage is not configured');
    }
    const sasUrl = this.getSasUrl(blobName, expiryMinutes);
    if (sasUrl) return sasUrl;
    return this.containerClient.getBlockBlobClient(blobName).url;
  }
}

module.exports = new AzureStorageService();
