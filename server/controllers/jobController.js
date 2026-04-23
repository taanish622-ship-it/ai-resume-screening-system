const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const { extractJobSkills } = require('../utils/skillExtractor');

exports.createJob = async (req, res) => {
  try {
    const { title, description, experienceRequired, educationRequired } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, message: 'Title and description are required' });

    const requiredSkills = extractJobSkills(description);

    const job = await Job.create({
      title, description, requiredSkills, experienceRequired, educationRequired,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const jobs = await Job.find(filter).sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (title) job.title = title;
    if (description) { job.description = description; job.requiredSkills = extractJobSkills(description); }
    if (status) job.status = status;
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await Candidate.deleteMany({ jobId: job._id });
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job and associated candidates deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
