const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const contactRoutes = require('./routes/contact');

dotenv.config();

const app = express();

// ── CORS SETUP ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',                    // Local development
    'https://trail-mocha.vercel.app/',      // ← Vercel deploy hone ke baad apna URL yahan daalo
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api', contactRoutes);  // /api/contact aur /api/messages dono cover hote hain

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4
})
.then(async () => {
  console.log('✅ MongoDB Connected');
  await seedData();  // ✅ seedData ab MongoDB connect hone KE BAAD call hogi
})
.catch(err => console.error('❌ MongoDB Error:', err.message));

async function seedData() {
  const Admin = require('./models/Admin');
  const Portfolio = require('./models/Portfolio');

  const existing = await Admin.findOne({ username: 'Gaurav Singh' });
  if (!existing) {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('231209', 10);
    await Admin.create({ username: 'Gaurav Singh', password: hash });
    console.log('✅ Admin created');
  }

  const portfolio = await Portfolio.findOne();
  if (!portfolio) {
    await Portfolio.create({
      name: 'Gaurav Singh',
      title: 'Software Engineer',
      location: 'Pune, Maharashtra, India',
      phone: '+919005354680',
      email: 'gauravsingh98872@gmail.com',
      summary: 'Looking for an opportunity to apply expertise in computer science and technical skills as a software engineer. Proficient in Python, C, web development, and database management internship experience, and project work to contribute effectively in a dynamic IT environment. Strong communication, teamwork, and analytical abilities with a continuous learning mindset.',
      skills: [
        { name: 'Python', level: 'Expert' },
        { name: 'C', level: 'Expert' },
        { name: 'OOPs', level: 'Expert' },
        { name: 'Operating System', level: 'Expert' },
        { name: 'Software Engineering', level: 'Expert' },
        { name: 'Database MongoDB', level: 'Expert' },
        { name: 'SQL', level: 'Expert' },
        { name: 'MySQL', level: 'Expert' },
        { name: 'CSS', level: 'Expert' },
        { name: 'HTML', level: 'Expert' },
        { name: 'Excel', level: 'Expert' },
        { name: 'MS Office', level: 'Expert' }
      ],
      education: [
        {
          degree: 'Bachelor of Technology',
          institution: 'United Institute of Technology, Prayagraj',
          field: 'Computer Science and Engineering',
          percentage: '60',
          startYear: 'Jul 2021',
          endYear: 'Aug 2025'
        },
        {
          degree: '12th Standard',
          institution: 'Babu Shrinath Singh Inter Mediate College',
          field: 'UP Board curriculum',
          percentage: '76',
          startYear: 'Jan 2021',
          endYear: 'Present'
        },
        {
          degree: '10th Standard',
          institution: 'Vindhyasini Inter Mediate College',
          field: 'UP Board curriculum',
          percentage: '71.2',
          startYear: 'Jan 2019',
          endYear: 'Present'
        }
      ],
      projects: [
        {
          title: 'Student Management System',
          description: 'Created using HTML, CSS, JavaScript. Includes student sign-up and login page.',
          tech: ['HTML', 'CSS', 'JavaScript']
        },
        {
          title: 'Virtual Assistant',
          description: 'Developed using Python. Performs tasks like playing songs and search engine queries.',
          tech: ['Python']
        }
      ],
      certificates: [
        { name: 'Python', issuer: 'United Institute of Technology' },
        { name: 'Soft Computing', issuer: 'United Institute of Technology' }
      ],
      languages: [
        { name: 'English', level: 'Highly Proficient' },
        { name: 'Hindi', level: 'Highly Proficient' }
      ],
      hobbies: ['Problem solving and analytical skills', 'Good communication skill', 'Customer support']
    });
    console.log('✅ Portfolio data seeded');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));