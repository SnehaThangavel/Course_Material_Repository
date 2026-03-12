const express = require('express');
const router = express.Router();
const { createCourse, getCourses, getCourseById, updateCourse, deleteCourse, getStats, addReview } = require('../controllers/course.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/stats', protect, admin, getStats);
router.route('/')
    .get(protect, getCourses)
    .post(protect, admin, createCourse);

router.route('/:id')
    .get(protect, getCourseById)
    .put(protect, admin, updateCourse)
    .delete(protect, admin, deleteCourse);

router.route('/:id/reviews')
    .post(protect, addReview);

module.exports = router;
