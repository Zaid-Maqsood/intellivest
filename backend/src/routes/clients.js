const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getClients, getClient, createClient, updateClient, deleteClient
} = require('../controllers/clientController');

router.use(protect);
router.get('/', getClients);
router.post('/', createClient);
router.get('/:id', getClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;
