const express = require('express');
const router = express.Router();
const c = require('../controllers/roomController');
router.get('/studios', c.getAllStudios);
router.get('/rooms', c.getAllRooms);
router.get('/rooms/available', c.getAvailableRooms);
router.get('/sports', c.getAllSportTypes);
module.exports = router;