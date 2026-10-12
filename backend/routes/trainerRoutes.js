const express = require('express');
const router = express.Router();
const c = require('../controllers/trainerController');
router.get('/', c.getAllTrainers);
router.get('/available', c.getAvailableTrainers);
router.get('/:id', c.getTrainerById);
module.exports = router;