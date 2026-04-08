const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLogs, resolveLog, createLog } = require('../controllers/complianceController');

router.use(protect);
router.get('/logs', getLogs);
router.post('/logs', createLog);
router.patch('/logs/:id/resolve', resolveLog);

module.exports = router;
