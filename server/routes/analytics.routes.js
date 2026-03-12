const express = require('express');
const router = express.Router();
const {
    getDepartmentAnalytics,
    getYearAnalytics,
    getSkillAnalytics,
    getLevelAnalytics,
    getOverview,
    getStudentOverview,
} = require('../controllers/analytics.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/department', protect, admin, getDepartmentAnalytics);
router.get('/year', protect, admin, getYearAnalytics);
router.get('/skill', protect, admin, getSkillAnalytics);
router.get('/level', protect, admin, getLevelAnalytics);
router.get('/overview', protect, admin, getOverview);
router.get('/student-overview', protect, getStudentOverview);

module.exports = router;
