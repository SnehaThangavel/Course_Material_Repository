const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    addMaterial,
    markCourseCompleted,
    getAllMaterials,
    enrollInCourse,
    getStudentProgress,
    searchCourses,
    getCompletedCourses,
    getStudentActivity,
    uploadCourseCover,
    createCourseReview,
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { courseSchema, materialSchema } = require('../utils/validation');

router.get('/materials/all', protect, admin, getAllMaterials);
router.get('/student/progress', protect, getStudentProgress);
router.get('/student/completed', protect, getCompletedCourses);
router.get('/student/activity', protect, getStudentActivity);
router.get('/search', protect, searchCourses);

router.route('/').get(protect, getCourses).post(protect, admin, validate(courseSchema), createCourse);
router.post('/complete-course', protect, markCourseCompleted);

router
    .route('/:id')
    .get(protect, getCourse)
    .put(protect, admin, validate(courseSchema), updateCourse)
    .delete(protect, admin, deleteCourse);

router.post('/:id/materials', protect, admin, validate(materialSchema), addMaterial);
router.post('/:id/upload-cover', protect, admin, require('../utils/upload').single('cover'), uploadCourseCover);
router.post('/:id/complete', protect, markCourseCompleted);
router.post('/:id/enroll', protect, enrollInCourse);
router.post('/:id/reviews', protect, createCourseReview);

module.exports = router;
