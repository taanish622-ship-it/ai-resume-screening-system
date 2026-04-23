const path = require('path');
const multer = require('multer');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { extractText, extractName, extractEmail, extractPhone } = require('../utils/resumeParser');
const { scoreCandidate } = require('../utils/scorer');
const { extractExperienceDetails } = require('../utils/experienceParser');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF, DOCX, and TXT files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadMiddleware = upload.array('resumes', 50);

exports.uploadResumes = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded' });

    const candidates = [];
    for (const file of req.files) {
      try {
        const text = await extractText(file.path);
        const result = scoreCandidate(text, job.description, job.requiredSkills);
        const name = extractName(text);
        const email = extractEmail(text);
        const phone = extractPhone(text);
        const expDetails = extractExperienceDetails(text);

        const candidate = await Candidate.create({
          name, email, phone,
          resumeFile: file.filename,
          resumeOriginalName: file.originalname,
          extractedText: text,
          jobId: job._id,
          skills: result.skills,
          matchedSkills: result.matchedSkills,
          unmatchedSkills: result.unmatchedSkills,
          experienceYears: result.experienceYears,
          experienceDetails: expDetails,
          education: result.education,
          educationLevel: result.educationLevel,
          score: result.score,
          scoreBreakdown: result.scoreBreakdown
        });
        candidates.push(candidate);
      } catch (parseErr) {
        console.error(`Error processing ${file.originalname}:`, parseErr.message);
        candidates.push({ error: true, file: file.originalname, message: parseErr.message });
      }
    }

    // Update candidate count
    const count = await Candidate.countDocuments({ jobId: job._id });
    job.candidateCount = count;
    await job.save();

    res.status(201).json({ success: true, count: candidates.length, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidatesByJob = async (req, res) => {
  try {
    const candidates = await Candidate.find({ jobId: req.params.jobId }).sort({ score: -1 }).select('-extractedText');
    res.json({ success: true, count: candidates.length, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('jobId', 'title description requiredSkills');
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
