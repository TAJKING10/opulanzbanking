/**
 * IMAP inbox reader for contact@opulanz.com (INBOX_USER / INBOX_PASS)
 * Host: imap.mail.ovh.net:993 (OVH MX Plan)
 * Fetches client-facing emails (support requests, application inquiries).
 * Automated/Azure emails are filtered out.
 *
 * Uses an in-memory cache (60 s TTL) and a connection lock so that
 * concurrent requests (Overview preview + InboxTab) never open two
 * simultaneous IMAP connections. OVH rejects the second one.
 */

const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

// ─── Simple in-memory cache ──────────────────────────────────────────────────
const CACHE_TTL_MS = 60 * 1000; // 60 seconds
let _listCache      = null;  // { data: [...], at: Date }
let _listLockPromise = null; // prevents concurrent IMAP fetches

/** Wrap imapflow errors so the IMAP server's own message reaches the caller */
function wrapImapError(err) {
  const serverText = err.responseText || err.serverResponse || '';
  const detail     = serverText ? ` — ${serverText}` : '';
  const msg        = `${err.message || 'IMAP error'}${detail}`;
  const out        = new Error(msg);
  out.code         = err.code || err.responseCode || 'IMAP_ERROR';
  return out;
}

// Senders / subject patterns that belong to automated pipeline traffic
const SKIP_DOMAINS   = ['azure.com', 'microsoft.com', 'azuredevops.com', 'visualstudio.com', 'amazonaws.com'];
const SKIP_FROM_PFXS = ['noreply@', 'no-reply@', 'do-not-reply@', 'mailer-daemon@', 'bounce@', 'postmaster@', 'devops@', 'notifications@'];
const SKIP_SUBJECTS  = ['build succeeded', 'build failed', 'release completed', 'pipeline ', 'deployment ', 'azure devops'];

function isAutomated(fromEmail, subject) {
  const f = (fromEmail || '').toLowerCase();
  const s = (subject  || '').toLowerCase();
  if (SKIP_DOMAINS.some(d => f.endsWith('@' + d) || f.includes('.' + d))) return true;
  if (SKIP_FROM_PFXS.some(p => f.startsWith(p) || f.includes('<' + p))) return true;
  if (SKIP_SUBJECTS.some(k => s.includes(k))) return true;
  return false;
}

function getConfig() {
  return {
    host:              process.env.IMAP_HOST || 'imap.mail.ovh.net',
    port:              parseInt(process.env.IMAP_PORT || '993'),
    secure:            true,
    auth: {
      user: process.env.INBOX_USER,
      pass: process.env.INBOX_PASS,
    },
    logger:            false,
    tls:               { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout:   10000,
    socketTimeout:     30000,
  };
}

/**
 * List inbox messages newest-first, filtered to client emails only.
 * Results are cached for 60 s and concurrent calls share one IMAP connection.
 * @param {object} opts
 * @param {number} opts.limit  max messages to scan (default 100)
 * @param {boolean} opts.bust  force a cache refresh
 */
async function listInbox({ limit = 100, bust = false } = {}) {
  // Return cached result if still fresh
  if (!bust && _listCache && (Date.now() - _listCache.at) < CACHE_TTL_MS) {
    return _listCache.data.slice(0, limit);
  }

  // If another request is already fetching, wait for it and return its result
  if (_listLockPromise) {
    await _listLockPromise;
    return _listCache ? _listCache.data.slice(0, limit) : [];
  }

  // This request owns the IMAP fetch
  let resolve;
  _listLockPromise = new Promise(r => { resolve = r; });

  try {
    const messages = await _fetchListFromImap(limit);
    _listCache = { data: messages, at: Date.now() };
    return messages;
  } finally {
    _listLockPromise = null;
    resolve();
  }
}

async function _fetchListFromImap(limit) {
  const cfg = getConfig();
  if (!cfg.auth.user || !cfg.auth.pass) {
    throw new Error('INBOX_USER or INBOX_PASS is not set in environment variables');
  }
  const client = new ImapFlow(cfg);
  try { await client.connect(); } catch (err) { throw wrapImapError(err); }

  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const status = await client.status('INBOX', { messages: true, unseen: true });
      const total = status.messages || 0;
      if (total === 0) return [];

      const from = Math.max(1, total - limit + 1);
      const seq  = `${from}:*`;

      const messages = [];

      for await (const msg of client.fetch(seq, {
        envelope: true,
        flags:    true,
        bodyStructure: false,
      })) {
        const envFrom  = msg.envelope.from?.[0];
        const fromAddr = envFrom ? `${envFrom.mailbox}@${envFrom.host}` : '';
        const fromName = envFrom?.name || '';

        if (isAutomated(fromAddr, msg.envelope.subject)) continue;

        messages.push({
          uid:       msg.uid,
          seq:       msg.seq,
          subject:   msg.envelope.subject || '(no subject)',
          fromName,
          fromEmail: fromAddr,
          from:      fromName ? `${fromName} <${fromAddr}>` : fromAddr,
          date:      msg.envelope.date,
          seen:      msg.flags.has('\\Seen'),
        });
      }

      messages.sort((a, b) => new Date(b.date) - new Date(a.date));
      return messages;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

/**
 * Fetch and parse a single email by UID.
 * Also marks it as \Seen.
 */
async function getEmail(uid) {
  const cfg = getConfig();
  if (!cfg.auth.user || !cfg.auth.pass) {
    throw new Error('INBOX_USER or INBOX_PASS is not set in environment variables');
  }
  const client = new ImapFlow(cfg);
  try { await client.connect(); } catch (err) { throw wrapImapError(err); }

  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const msg = await client.fetchOne(
        String(uid),
        { source: true, envelope: true, flags: true },
        { uid: true }
      );
      if (!msg) return null;

      const parsed = await simpleParser(msg.source);

      // Mark as read
      await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });

      const fromVal  = parsed.from?.value?.[0] || {};
      const replyTo  = parsed.replyTo?.value?.[0]?.address
                    || parsed.from?.value?.[0]?.address
                    || '';

      return {
        uid,
        subject:     msg.envelope.subject || '(no subject)',
        from:        parsed.from?.text     || '',
        fromEmail:   fromVal.address       || '',
        fromName:    fromVal.name          || '',
        replyTo,
        to:          parsed.to?.text       || '',
        date:        msg.envelope.date     || parsed.date,
        text:        parsed.text           || '',
        html:        parsed.html           || parsed.textAsHtml || '',
        attachments: (parsed.attachments || []).map(a => ({
          filename:    a.filename    || 'attachment',
          contentType: a.contentType || 'application/octet-stream',
          size:        a.size        || 0,
        })),
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

/**
 * Count unread non-automated messages (used for the Overview badge).
 */
async function countUnread() {
  try {
    const messages = await listInbox({ limit: 100 });
    return messages.filter(m => !m.seen).length;
  } catch {
    return 0;
  }
}

module.exports = { listInbox, getEmail, countUnread };
