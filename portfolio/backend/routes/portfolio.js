const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');

// Default empty portfolio structure
const defaultPortfolio = {
  name: '', title: '', location: '', phone: '', email: '', summary: '',
  skills: [],
  education: [], 
  projects: [],
  certificates: [],
  languages: [],
  hobbies: []
};

// GET /api/portfolio - public
router.get('/', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();

    // ✅ FIX: Agar DB mein kuch nahi hai toh create karo
    if (!portfolio) {
      portfolio = await Portfolio.create(defaultPortfolio);
    }

    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/portfolio - protected (admin only)
router.put('/', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();

    // ✅ FIX: Agar exist nahi karta toh create karo
    if (!portfolio) {
      portfolio = await Portfolio.create(defaultPortfolio);
    }

    Object.assign(portfolio, req.body);
    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;