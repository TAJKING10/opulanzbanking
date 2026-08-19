const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { adminAuth, adminAuthIfAdminSender } = require('../middleware/adminAuth');

// Auto-create tables on startup
async function initTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_chats (
        id SERIAL PRIMARY KEY,
        visitor_name VARCHAR(255) NOT NULL,
        visitor_email VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'closed')),
        assigned_admin_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS support_messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER NOT NULL REFERENCES support_chats(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('visitor', 'admin')),
        sender_name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_support_messages_chat_id ON support_messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_support_chats_status ON support_chats(status);
    `);
    console.log('Support chat tables ready');
  } catch (err) {
    console.error('Support chat table init error:', err.message);
  }
}

initTables();

// POST / - Create a new chat session (visitor starts chat)
router.post('/', async (req, res) => {
  const { visitor_name, visitor_email } = req.body;
  if (!visitor_name || !visitor_email) {
    return res.status(400).json({ success: false, error: 'Name and email required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO support_chats (visitor_name, visitor_email, status)
       VALUES ($1, $2, 'waiting') RETURNING *`,
      [visitor_name.trim(), visitor_email.trim().toLowerCase()]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create chat error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create chat session' });
  }
});

// GET / - Get all chats (for admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sc.*,
        (SELECT content FROM support_messages WHERE chat_id = sc.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT COUNT(*) FROM support_messages WHERE chat_id = sc.id)::int AS message_count
      FROM support_chats sc
      ORDER BY
        CASE WHEN sc.status = 'waiting' THEN 0
             WHEN sc.status = 'active'  THEN 1
             ELSE 2 END,
        sc.last_message_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get chats error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to get chats' });
  }
});

// GET /stats - Get open chat count (for badge in admin nav)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS open_count FROM support_chats WHERE status IN ('waiting', 'active')`
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

// GET /:id - Get a single chat with all messages
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const chatResult = await pool.query('SELECT * FROM support_chats WHERE id = $1', [id]);
    if (chatResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    const messagesResult = await pool.query(
      'SELECT * FROM support_messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json({
      success: true,
      data: { ...chatResult.rows[0], messages: messagesResult.rows },
    });
  } catch (err) {
    console.error('Get chat error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to get chat' });
  }
});

// POST /:id/messages - Add a message to a chat
// Visitors may post freely; admin sender_type requires x-admin-token
router.post('/:id/messages', adminAuthIfAdminSender, async (req, res) => {
  const { id } = req.params;
  const { sender_type, sender_name, content } = req.body;
  if (!sender_type || !content || !['visitor', 'admin'].includes(sender_type)) {
    return res.status(400).json({ success: false, error: 'sender_type and content required' });
  }
  try {
    // Mark chat as active when admin first replies
    if (sender_type === 'admin') {
      await pool.query(
        `UPDATE support_chats
         SET status = 'active', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND status = 'waiting'`,
        [id]
      );
    }
    // Update last_message_at
    await pool.query(
      `UPDATE support_chats SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
    const result = await pool.query(
      `INSERT INTO support_messages (chat_id, sender_type, sender_name, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, sender_type, (sender_name || 'Unknown').trim(), content.trim()]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Add message error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// PATCH /:id - Update chat status (close, reopen) — admin only
router.patch('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['waiting', 'active', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  try {
    const result = await pool.query(
      `UPDATE support_chats SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update chat error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update chat' });
  }
});

module.exports = router;
