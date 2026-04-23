const User = require('../models/User');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    await Job.deleteMany({ createdBy: user._id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, stats: { totalUsers, totalRecruiters, totalJobs, totalCandidates, recentUsers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
