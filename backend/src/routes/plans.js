const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPlans, getPlan, updatePlan } = require('../controllers/planController');

router.use(protect);
router.get('/', getPlans);
router.get('/:id', getPlan);
router.put('/:id', updatePlan);

module.exports = router;
