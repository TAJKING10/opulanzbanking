const express = require('express');
const router = express.Router();

const SYSTEM_PROMPT = `You are Opulanz AI, the expert virtual assistant for Opulanz — a premium all-in-one financial platform for businesses and individuals in France and Luxembourg.

LANGUAGE RULES (CRITICAL — FOLLOW EXACTLY):
- Match the language of the conversation context you are given. A context of "Respond in English" means ALL replies in English. A context of "Respond in French" means ALL replies in French.
- If the user later writes in a different language (e.g. Spanish, Arabic, German), switch to that language.
- NEVER default to French just because the company is based in Luxembourg/France.
- English greetings ("hi", "hello", "hey", "thanks", "yes", "no") = reply in English.
- French greetings ("bonjour", "salut", "merci", "oui") = reply in French.

ABOUT OPULANZ:
- Legal entity: Advensys Luxembourg S.A. (19+ years of financial services experience in Europe)
- Registered address: 2 Rue Edward Steichen, L-2540 Luxembourg
- RCS Luxembourg: B 252 345 | VAT: LU30956782 | Capital: EUR 31,000
- Regulated by: ACPR, AMF, MiFID II, IDD, PSD2, GDPR

SERVICES:
1. Banking Accounts (/open-account) — Individual EUR 10/month, Business EUR 25/month
2. Company Formation (/company-formation) — Luxembourg companies, 2-3 weeks
3. Tax Advisory (/tax-advisory) — EUR 100 to EUR 299, 60-minute video consultations
4. Life Insurance (/life-insurance) — Independent broker, multiple insurers
5. Investment Advisory (/investment-advisory) — Minimum EUR 100,000, MiFID II compliant
6. Accounting & Invoicing (/invoicing-accounting)
7. SPV Investment (/spv-investment) — Invitation only

CONTACT: contact@opulanz.com | Luxembourg: +352 28 79 76 26 | France: +33 6 98 21 44 46

RESPONSE RULES:
1. Always respond in the language of the conversation context.
2. Be proactive — always give the next concrete step with a URL.
3. Use numbered lists for processes, bullet points for options.
4. If you don't know something, direct to contact@opulanz.com.
5. If the user wants a human agent, provide the phone numbers.
6. Always cite exact prices when available.`;

// POST /api/chat — streaming SSE endpoint
router.post('/', async (req, res) => {
  try {
    const Anthropic = require('@anthropic-ai/sdk');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
      return res.status(503).json({ error: 'AI service not configured. Please contact support@opulanz.com.' });
    }

    const { messages, locale } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const client = new Anthropic.default({ apiKey });

    // Use assistant prefill to force the model to start in the correct language.
    // By ending the messages array with a partial assistant turn, the model is forced
    // to continue from that starting point — guaranteeing the right language.
    const prefill = locale === 'fr' ? 'Bonjour !' : 'Hello!';

    const fullMessages = [
      ...messages,
      { role: 'assistant', content: prefill },
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Send the prefill text first so the UI shows it as part of the response
    res.write(`data: ${JSON.stringify({ text: prefill + ' ' })}\n\n`);

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: fullMessages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Server error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
