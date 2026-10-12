const express = require('express');
const router = express.Router();
const c = require('../controllers/rewardController');
router.get('/', c.getAllRewards);
router.post('/redeem', c.redeemReward);
router.get('/member/:id', c.getMemberRedemptions);
module.exports = router;