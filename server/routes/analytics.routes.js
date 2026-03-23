const express = require('express');
const router = express.Router();
const {
    getDepartmentAnalytics,
    getYearAnalytics,
    getSkillAnalytics,
    getLevelAnalytics,
    getOverview,
    getStudentOverview,
    getStudentsList,
    getPublishedCoursesList,
    getCourseEnrollmentCounts,
    getCourseCompletionCounts
} = require('../controllers/analytics.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/department', protect, admin, getDepartmentAnalytics);
router.get('/year', protect, admin, getYearAnalytics);
router.get('/skill', protect, admin, getSkillAnalytics);
router.get('/level', protect, admin, getLevelAnalytics);
router.get('/overview', protect, admin, getOverview);
router.get('/students-list', protect, admin, getStudentsList);
router.get('/published-courses', protect, admin, getPublishedCoursesList);
router.get('/enrollment-details', protect, admin, getCourseEnrollmentCounts);
router.get('/completed-details', protect, admin, getCourseCompletionCounts);

router.get('/student-overview', protect, getStudentOverview);

module.exports = router;
