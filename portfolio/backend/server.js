const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ✅ CORS CONFIG (IMPORTANT FIX)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://trail-mocha.vercel.app/'
  ],
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api', require('./routes/contact')); // contact + messages

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4
})
.then(async () => {
  console.log('✅ MongoDB Connected');
  await seedData();
})
.catch(err => {
  console.error('❌ MongoDB Error:', err.message);
});

// ✅ Seed Function
async function seedData() {
  try {
    const Admin = require('./models/Admin');
    const Portfolio = require('./models/Portfolio');
    const bcrypt = require('bcryptjs');

    // ✅ Admin check
    const existingAdmin = await Admin.findOne({ username: 'Gaurav Singh' });

    if (!existingAdmin) {
      const hash = await bcrypt.hash('231209', 10);
      await Admin.create({
        username: 'Gaurav Singh',
        password: hash
      });
      console.log('✅ Admin created');
    }

    // ✅ Portfolio check
    const existingPortfolio = await Portfolio.findOne();

    if (!existingPortfolio) {
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
          { name: 'MongoDB', level: 'Expert' },
          { name: 'React', level: 'Intermediate' },
          { name: 'Node.js', level: 'Intermediate' }
        ],

        education: [
          {
            degree: 'B.Tech',
            institution: 'United Institute of Technology',
            field: 'CSE',
            percentage: '60',
            startYear: '2021',
            endYear: '2025'
          }
        ],

        projects: [
          {
            title: 'Student Management System',
            description: 'CRUD based system',
            tech: ['HTML', 'CSS', 'JS']
          }
        ],

        certificates: [
          { name: 'Python', issuer: 'UIT' }
        ],

        languages: [
          { name: 'English', level: 'Proficient' },
          { name: 'Hindi', level: 'Proficient' }
        ],

        hobbies: ['Coding', 'Learning AI']
      });

      console.log('✅ Portfolio seeded');
    }

  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
  }
}

// ✅ Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});