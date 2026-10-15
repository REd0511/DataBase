const express = require('express');
const router = express.Router();
const c = require('../controllers/courseController');

router.get('/', c.getAllCourses);
router.post('/', c.createCourse);             // ✅ เพิ่ม Route สำหรับ Create
router.put('/:id', c.updateCourse);           // ✅ เพิ่ม Route สำหรับ Update
router.delete('/:id', c.deleteCourse);        // ✅ เพิ่ม Route สำหรับ Delete

router.post('/enroll', c.enrollCourse);
router.get('/member/:id', c.getMemberEnrollments);

module.exports = router;