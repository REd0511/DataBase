const express = require('express');
const router = express.Router();
const c = require('../controllers/equipmentController');
router.get('/', c.getAllEquipment);
router.get('/available', c.getAvailableEquipment);
module.exports = router;