const express = require('express');
const router = express.Router();
const c = require('../controllers/rewardController');   // require rewardController

router.get('/', c.getAllRewards);                       // GET /api/rewards
router.post('/redeem', c.redeemReward);                 // POST /api/rewards/redeem
router.get('/member/:id', c.getMemberRedemptions);      // GET /api/rewards/member/:id

module.exports = router;