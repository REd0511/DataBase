const express = require('express');
const router = express.Router();
const c = require('../controllers/memberController');
router.get('/', c.getAllMembers);
router.get('/:id', c.getMemberById);
router.post('/', c.createMember);
router.get('/:id/points', c.getMemberPoints);
router.get('/:id/transactions', c.getMemberTransactions);
module.exports = router;