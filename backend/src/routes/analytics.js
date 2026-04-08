const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getInstitutionalSummary, getRiskModel, getPortfolioSimulation } = require('../controllers/analyticsController');

router.use(protect);
router.get('/summary', getInstitutionalSummary);
router.get('/risk-model', getRiskModel);
router.get('/simulate/:client_id', getPortfolioSimulation);

module.exports = router;
