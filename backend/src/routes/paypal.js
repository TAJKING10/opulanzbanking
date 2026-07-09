const express = require('express');
const router = express.Router();

const PAYPAL_API =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// POST /api/paypal/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'EUR', description = 'Opulanz Consultation' } = req.body;

    if (!amount) return res.status(400).json({ error: 'amount is required' });

    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description,
            amount: {
              currency_code: currency,
              value: String(amount),
            },
          },
        ],
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      console.error('[PayPal] create-order error:', order);
      return res.status(response.status).json({ error: order.message || 'Failed to create order' });
    }

    console.log('[PayPal] Order created:', order.id);
    res.json({ orderId: order.id });
  } catch (err) {
    console.error('[PayPal] create-order exception:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/paypal/capture-order/:orderId
router.post('/capture-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[PayPal] capture-order error:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to capture order' });
    }

    console.log('[PayPal] Order captured:', orderId, 'status:', data.status);
    res.json(data);
  } catch (err) {
    console.error('[PayPal] capture-order exception:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
