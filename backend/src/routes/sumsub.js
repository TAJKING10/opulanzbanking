const express = require('express');
const router = express.Router();
const { generateAccessToken } = require('../services/sumsub');

// POST /api/sumsub/access-token
// Body: { userId: string, levelName: 'individual_signup_kyc' | 'corporate_signup_kyc' }
router.post('/access-token', async (req, res) => {
  try {
    const { userId, levelName } = req.body;

    if (!userId || !levelName) {
      return res.status(400).json({ error: 'userId and levelName are required' });
    }

    const validLevels = ['individual_signup_kyc', 'corporate_signup_kyc'];
    if (!validLevels.includes(levelName)) {
      return res.status(400).json({ error: `levelName must be one of: ${validLevels.join(', ')}` });
    }

    const tokenData = await generateAccessToken(userId, levelName);
    res.json(tokenData);
  } catch (error) {
    console.error('Sumsub token error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate Sumsub access token' });
  }
});

module.exports = router;
