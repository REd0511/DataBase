const express = require('express');
const router = express.Router();
const c = require('../controllers/reportController');

router.get('/bookings', c.getBookingReport);
router.get('/revenue', c.getRevenueReport);
router.get('/courses', c.getCourseReport);
router.get('/members', c.getMemberLevelReport);
router.get('/course-revenue-monthly', c.getMonthlyCourseRevenueReport);
router.get('/loyalty-summary', c.getLoyaltySummaryReport);
router.get('/popular-times', c.getPopularTimeSlots);
router.get('/top-members', c.getTopMembers);

module.exports = router;