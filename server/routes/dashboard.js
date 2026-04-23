const router = require('express').Router();
const { getStats, getRecentActivity } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/recent', getRecentActivity);

module.exports = router;
