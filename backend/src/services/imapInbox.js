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

// Keep only genuine client emails. Filter out all automated, system,
// and marketing emails from Microsoft, Google, and other platforms.

const SKIP_DOMAINS = [
  // Microsoft / Azure
  'microsoft.com', 'microsoftonline.com', 'microsoftemail.com',
  'azure.com', 'azuredevops.com', 'azurecomm.net',
  'visualstudio.com', 'office.com', 'office365.com',
  // Google automated senders
  'google.com', 'googlemail.com',
  // Amazon / AWS
  'amazonaws.com', 'amazonses.com', 'amazon.com',
  'amazon.co.uk', 'amazon.fr', 'amazon.de',
  // OVH / OVHcloud (all variants)
  'ovh.com', 'ovhcloud.com', 'ovh.net', 'ovh.ca',
  // Other hosting / infrastructure providers
  'godaddy.com', 'namecheap.com', 'ionos.com', '1and1.com',
  'cloudflare.com', 'digitalocean.com', 'linode.com',
  // Marketing / transactional email services
  'mailchimp.com', 'mandrill.com', 'sendgrid.net', 'sendgrid.com',
  'mailgun.org', 'mailgun.net', 'sparkpostmail.com',
  'constantcontact.com', 'hubspot.com', 'klaviyo.com',
  'brevo.com', 'sendinblue.com', 'sib-api.com',
];

// Sender display names that are never real clients
const SKIP_FROM_NAMES = [
  'microsoft', 'microsoft azure', 'microsoft security', 'azure devops', 'azure',
  'google play', 'google', 'youtube',
  'amazon', 'amazon web services', 'aws', 'amazon prime', 'amazon music',
  'mailer-daemon', 'postmaster',
  'ovh', 'ovhcloud', 'vid',
  'mailchimp', 'mailgun', 'sendgrid', 'constantcontact', 'hubspot',
];

const SKIP_FROM_PFXS = [
  'noreply@', 'no-reply@', 'no-reply-', 'donotreply@', 'do-not-reply@',
  'mailer-daemon@', 'postmaster@', 'bounce@', 'bounces@',
  'notifications@', 'notification@', 'alert@', 'alerts@',
  'newsletter@', 'news@', 'promo@', 'promotions@', 'marketing@',
  'info@amazon', 'shipment-tracking@', 'order-update@',
  'azure-', 'msonline', 'ms-noreply',
];

const SKIP_SUBJECTS = [
  // Spam-tagged (OVH and other hosts prefix spam subjects with [SPAM])
  '[spam]',
  // Azure / Microsoft
  'build succeeded', 'build failed', 'release completed',
  'pipeline notification', 'deployment notification',
  'keep going with azure', 'your azure',
  'microsoft entra', 'microsoft 365', 'free account',
  'new recommendation available', 'security recommendation',
  'azure devops', 'azure active directory',
  // OVH / hosting system emails (French + English)
  'renouvellement de domaine', 'domain renewal',
  'rappel de paiement', 'payment reminder',
  'rappel de renouvellement',
  'réactivez vos services', 'reactivate your services',
  'certificat ssl', 'ssl certificate',
  'facture en attente', 'invoice pending',
  'votre domaine', 'your domain',
  'votre hébergement', 'your hosting',
  'expiration', 'expire',
  // Amazon promotional
  'amazon prime', 'prime day', 'lightning deal', 'deal of the day',
  'your amazon order', 'your order has shipped', 'delivery update',
  // Advertising / promotional (English)
  'unsubscribe', 'email verification', 'confirm your email',
  'invoice #', 'your receipt', 'order confirmation',
  'special offer', 'limited time', 'exclusive deal', 'discount',
  'flash sale', 'newsletter', 'weekly digest', 'monthly digest',
  'promotional', 'advertisement', 'advertise', 'sponsore',
  'you have been selected', 'congratulations', 'you won',
  'click here', 'act now', 'don\'t miss',
  // Advertising / promotional (French)
  'offre spéciale', 'offre exclusive', 'promotion',
  'publicité', 'publipostage',
  'vous avez été sélectionné', 'félicitations',
  // Upgrade / upsell (all providers)
  'upgrade', 'reactivate', 'upgrade your plan', 'renew now',
];

function isAutomated(fromEmail, fromName, subject) {
  const f = (fromEmail || '').toLowerCase();
  const n = (fromName  || '').toLowerCase();
  const s = (subject   || '').toLowerCase();

  // Block any sender whose email domain contains 'ovh' (catches all OVH variants)
  const emailDomain = f.split('@')[1] || '';
  if (emailDomain.includes('ovh')) return true;

  if (SKIP_DOMAINS.some(d => f.endsWith('@' + d) || f.includes('.' + d))) return true;
  if (SKIP_FROM_NAMES.some(name => n === name || n.startsWith(name + ' ') || n.includes(' ' + name))) return true;
  if (SKIP_FROM_PFXS.some(p => f.startsWith(p))) return true;
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
    // Fetch ALL messages so the cache is complete for any caller.
    const messages = await _fetchListFromImap();
    _listCache = { data: messages, at: Date.now() };
    return limit ? messages.slice(0, limit) : messages;
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
  // Prevent unhandled 'error' event from crashing the Node.js process when
  // OVH closes the connection unexpectedly after a successful fetch.
  client.on('error', (err) => console.error('ImapFlow error event:', err.message));
  try { await client.connect(); } catch (err) { throw wrapImapError(err); }

  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const status = await client.status('INBOX', { messages: true, unseen: true });
      const total = status.messages || 0;
      if (total === 0) return [];

      // Fetch all messages; caller slices to its own limit.
      const seq = '1:*';

      const messages = [];

      for await (const msg of client.fetch(seq, {
        envelope: true,
        flags:    true,
        bodyStructure: false,
      })) {
        const envFrom  = msg.envelope.from?.[0];
        const fromAddr = (envFrom?.mailbox && envFrom?.host)
          ? `${envFrom.mailbox}@${envFrom.host}`
          : '';
        const fromName = envFrom?.name || '';

        if (isAutomated(fromAddr, fromName, msg.envelope.subject)) continue;

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
  client.on('error', (err) => console.error('ImapFlow error event:', err.message));
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
