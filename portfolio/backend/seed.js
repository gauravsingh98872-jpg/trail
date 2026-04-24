const mongoose = require('mongoose');
const Portfolio = require('./models/Portfolio');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const exists = await Portfolio.findOne();
  if (exists) {
    console.log('⚠️  Portfolio already exists, skipping seed.');
    await mongoose.disconnect();
    process.exit(0);
  }

  await Portfolio.create({
    name: 'Gaurav Singh',
    title: 'Data Analyst',
    location: 'Pune, India',
    phone: '',
    email: '',
    summary: '',
    skills: [{ name: 'Python', level: 'Expert' }],
    education: [{
      degree: 'B.Tech',
      institution: 'Your College',
      field: 'Computer Science',
      percentage: '',
      startYear: '2021',
      endYear: '2025'
    }],
    projects: [{
      title: 'Sample Project',
      description: 'Description here',
      tech: ['Python']
    }],
    certificates: [{ name: 'Sample Cert', issuer: 'Issuer' }],
    languages: [{ name: 'Hindi', level: 'Native' }],
    hobbies: ['Reading']
  });

  console.log('✅ Portfolio seeded!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});