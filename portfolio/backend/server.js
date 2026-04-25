const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ CORS SETUP
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://trail-mocha.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// ✅ ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api', require('./routes/contact'));

// ✅ MongoDB CONNECT
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4
})
.then(() => {
  console.log('✅ MongoDB Connected');
  seedData(); // 🔥 without await (safe)
})
.catch(err => {
  console.error('❌ MongoDB Error:', err.message);
  process.exit(1);
});

// ✅ SEED DATA (SAFE VERSION)
async function seedData() {
  try {
    const Admin = require('./models/Admin');
    const Portfolio = require('./models/Portfolio'); // ⚠️ file name EXACT same hona chahiye

    // ✅ Admin check
    const existing = await Admin.findOne({ username: 'Gaurav Singh' });

    if (!existing) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('231209', 10);

      await Admin.create({
        username: 'Gaurav Singh',
        password: hash
      });

      console.log('✅ Admin created');
    }

    // ✅ Portfolio check
    const portfolio = await Portfolio.findOne();

    if (!portfolio) {
      await Portfolio.create({
        name: 'Gaurav Singh',
        title: 'Software Engineer',
        location: 'Pune, Maharashtra, India',
        phone: '+919005354680',
        email: 'gauravsingh98872@gmail.com',
        summary: 'Looking for an opportunity to apply expertise in computer science and technical skills as a software engineer.',
        skills: [
          { name: 'Python', level: 'Expert' },
          { name: 'C', level: 'Expert' },
          { name: 'MongoDB', level: 'Expert' }
        ],
        education: [],
        projects: [],
        certificates: [],
        languages: [],
        hobbies: []
      });

      console.log('✅ Portfolio data seeded');
    }

  } catch (err) {
    console.error('❌ Seed Error:', err.message);
  }
}

// ✅ GLOBAL ERROR HANDLER (IMPORTANT)
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ✅ SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});