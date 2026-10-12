const express = require('express');
const router = express.Router();
const c = require('../controllers/paymentController');
router.post('/', c.createPayment);
router.get('/member/:id', c.getMemberPayments);
module.exports = router;