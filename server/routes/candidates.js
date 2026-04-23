const router = require('express').Router();
const { uploadMiddleware, uploadResumes, getCandidatesByJob, getCandidate, updateCandidateStatus, deleteCandidate } = require('../controllers/candidateController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/upload/:jobId', uploadMiddleware, uploadResumes);
router.get('/job/:jobId', getCandidatesByJob);
router.get('/:id', getCandidate);
router.put('/:id/status', updateCandidateStatus);
router.delete('/:id', deleteCandidate);

module.exports = router;
