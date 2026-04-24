 const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth'); // ✅ auth middleware add kiya

// POST /api/contact - User ka message save karo (no auth needed)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email aur message required hain.' });
    }
    const newMsg = new Message({ name, email, phone, message });
    await newMsg.save();
    res.status(201).json({ success: true, message: 'Message saved!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages - Admin ke liye auth protected ✅
router.get('/messages', auth, async (req, res) => {
  try {
    const msgs = await Message.find().sort({ createdAt: -1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;