/**
 * In-memory temporary file store.
 * Holds file buffers for up to TTL_MS so notification routes can attach
 * them to admin emails, then auto-purges them.
 */

const { randomUUID } = require('crypto');

const TTL_MS = 30 * 60 * 1000; // 30 minutes

/** @type {Map<string, { buffer: Buffer, originalname: string, mimetype: string, expiresAt: number }>} */
const store = new Map();

/**
 * Store a file buffer and return a unique tempId.
 * @param {Buffer} buffer
 * @param {string} originalname
 * @param {string} mimetype
 * @returns {string} tempId
 */
function put(buffer, originalname, mimetype) {
  const tempId = randomUUID();
  store.set(tempId, {
    buffer,
    originalname,
    mimetype,
    expiresAt: Date.now() + TTL_MS,
  });
  // Auto-cleanup after TTL
  setTimeout(() => store.delete(tempId), TTL_MS);
  return tempId;
}

/**
 * Retrieve a stored file by tempId. Returns null if not found or expired.
 * @param {string} tempId
 * @returns {{ buffer: Buffer, originalname: string, mimetype: string } | null}
 */
function get(tempId) {
  const entry = store.get(tempId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(tempId);
    return null;
  }
  return entry;
}

/**
 * Remove a file from the store (call after attaching to email).
 * @param {string} tempId
 */
function del(tempId) {
  store.delete(tempId);
}

module.exports = { put, get, del };
