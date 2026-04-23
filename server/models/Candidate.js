const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Unknown Candidate',
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  resumeFile: {
    type: String,
    required: true
  },
  resumeOriginalName: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  matchedSkills: [{
    type: String,
    trim: true
  }],
  unmatchedSkills: [{
    type: String,
    trim: true
  }],
  experienceYears: {
    type: Number,
    default: 0
  },
  experienceDetails: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  educationLevel: {
    type: String,
    enum: ['high_school', 'bachelors', 'masters', 'phd', 'other', 'unknown'],
    default: 'unknown'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  scoreBreakdown: {
    skillMatch: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    textSimilarity: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for sorting by score
candidateSchema.index({ jobId: 1, score: -1 });

module.exports = mongoose.model('Candidate', candidateSchema);
