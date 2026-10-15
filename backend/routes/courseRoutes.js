const express = require('express');
const router = express.Router();
const c = require('../controllers/courseController');

router.get('/', c.getAllCourses);
router.post('/', c.createCourse);           
router.put('/:id', c.updateCourse);          
router.delete('/:id', c.deleteCourse);        

router.post('/enroll', c.enrollCourse);
router.get('/member/:id', c.getMemberEnrollments);

module.exports = router;