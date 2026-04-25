const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');

// ✅ Default portfolio structure
const defaultPortfolio = {
  name: '',
  title: '',
  location: '',
  phone: '',
  email: '',
  summary: '',
  skills: [],
  education: [],
  projects: [],
  certificates: [],
  languages: [],
  hobbies: []
};

// ✅ GET /api/portfolio (PUBLIC)
router.get('/', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();

    if (!portfolio) {
      console.log('⚠️ No portfolio found → creating default');
      portfolio = await Portfolio.create(defaultPortfolio);
    }

    res.status(200).json(portfolio);

  } catch (err) {
    console.error('🔥 GET /portfolio error:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message   // ✅ actual error show karega
    });
  }
});

// ✅ PUT /api/portfolio (PROTECTED)
router.put('/', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();

    if (!portfolio) {
      console.log('⚠️ No portfolio found → creating default');
      portfolio = await Portfolio.create(defaultPortfolio);
    }

    // ✅ Only allowed fields update kare
    const allowedFields = [
      'name', 'title', 'location', 'phone', 'email', 'summary',
      'skills', 'education', 'projects', 'certificates', 'languages', 'hobbies'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        portfolio[field] = req.body[field];
      }
    });

    await portfolio.save();

    res.status(200).json(portfolio);

  } catch (err) {
    console.error('🔥 PUT /portfolio error:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message   // ✅ debug ke liye
    });
  }
});

module.exports = router;