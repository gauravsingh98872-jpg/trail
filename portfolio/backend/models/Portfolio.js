const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  name: String,
  title: String,
  location: String,
  phone: String,
  email: String,
  summary: String,
  skills: [{ name: String, level: String }],
  education: [{
    degree: String,
    institution: String,
    field: String,
    percentage: String,
    startYear: String,
    endYear: String
  }],
  projects: [{
    title: String,
    description: String,
    tech: [String]
  }],
  certificates: [{ name: String, issuer: String }],
  languages: [{ name: String, level: String }],
  hobbies: [String]
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
