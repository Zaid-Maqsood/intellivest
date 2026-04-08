const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRecommendations, generatePlan, generateReport, runSimulation
} = require('../controllers/aiController');

router.use(protect);
router.get('/recommendations/:client_id', getRecommendations);
router.post('/plan', generatePlan);
router.post('/report', generateReport);
router.get('/simulate/:client_id', runSimulation);

module.exports = router;
