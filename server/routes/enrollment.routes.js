const express = require('express');
const router = express.Router();
const {
    enrollInCourse,
    getStudentCourses,
    updateProgress,
    toggleMaterial,
    getCommunityStudents,
    getGlobalSuccessRate,
    getStudentProgress,
} = require('../controllers/enrollment.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/global-success-rate', protect, getGlobalSuccessRate);
router.post('/enroll', protect, enrollInCourse);
router.get('/mycourses', protect, getStudentCourses);
router.put('/progress', protect, updateProgress);
router.post('/progress/material', protect, toggleMaterial);
router.get('/community', protect, admin, getCommunityStudents);
router.get('/student-progress/:id', protect, getStudentProgress);
router.get('/student-progress', protect, getStudentProgress);

module.exports = router;
