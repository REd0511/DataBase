const express = require('express');
const router = express.Router();
const c = require('../controllers/bookingController');
router.get('/', c.getAllBookings);
router.post('/', c.createBooking);
router.get('/member/:id', c.getMemberBookings);
router.delete('/:id', c.cancelBooking);
module.exports = router;