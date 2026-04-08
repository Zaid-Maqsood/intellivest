const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTaxOpportunities, getTaxSummary } = require('../controllers/taxController');

router.use(protect);
router.get('/opportunities/:client_id', getTaxOpportunities);
router.get('/summary', getTaxSummary);

module.exports = router;
