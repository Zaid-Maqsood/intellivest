const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPortfolios, getPortfolio, createPortfolio, updatePortfolio } = require('../controllers/portfolioController');

router.use(protect);
router.get('/', getPortfolios);
router.post('/', createPortfolio);
router.get('/:id', getPortfolio);
router.put('/:id', updatePortfolio);

module.exports = router;
