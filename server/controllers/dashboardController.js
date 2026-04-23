const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

exports.getStats = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const jobs = await Job.find(filter);
    const jobIds = jobs.map(j => j._id);

    const totalJobs = jobs.length;
    const totalCandidates = await Candidate.countDocuments({ jobId: { $in: jobIds } });
    const shortlisted = await Candidate.countDocuments({ jobId: { $in: jobIds }, status: 'shortlisted' });

    const topCandidates = await Candidate.find({ jobId: { $in: jobIds } })
      .sort({ score: -1 }).limit(5).select('name score jobId matchedSkills')
      .populate('jobId', 'title');

    const avgScore = totalCandidates > 0
      ? Math.round((await Candidate.aggregate([
          { $match: { jobId: { $in: jobIds } } },
          { $group: { _id: null, avg: { $avg: '$score' } } }
        ]))[0]?.avg || 0)
      : 0;

    // Score distribution
    const scoreRanges = await Candidate.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $bucket: { groupBy: '$score', boundaries: [0, 20, 40, 60, 80, 101], default: 'Other',
          output: { count: { $sum: 1 } } } }
    ]);

    res.json({
      success: true,
      stats: { totalJobs, totalCandidates, shortlisted, avgScore, topCandidates, scoreRanges }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const recentJobs = await Job.find(filter).sort({ createdAt: -1 }).limit(5).select('title createdAt candidateCount');
    const jobs = await Job.find(filter);
    const jobIds = jobs.map(j => j._id);
    const recentCandidates = await Candidate.find({ jobId: { $in: jobIds } })
      .sort({ createdAt: -1 }).limit(10).select('name score jobId createdAt status')
      .populate('jobId', 'title');

    res.json({ success: true, recentJobs, recentCandidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
