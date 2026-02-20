const Course = require('../models/Course');
const User = require('../models/User');
const logActivity = require('../utils/logger');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
    const filter = {};
    if (req.user.role !== 'admin') {
        filter.isPublished = true;
    }
    const courses = await Course.find(filter);
    res.status(200).json(courses);
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
    const { title, description, code, category, level, tags } = req.body;

    if (!title || !description || !code) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    const course = await Course.create({
        title,
        description,
        code,
        category: category || 'Uncategorized',
        level: level || 'Beginner',
        tags: tags || [],
        isPublished: false, // Start as Draft
        materials: [],
    });

    await logActivity({
        userId: req.user.id,
        action: 'CREATE_COURSE',
        entityType: 'COURSE',
        entityId: course._id,
        details: `Course created: ${title} (${code})`,
        req
    });

    res.status(201).json(course);
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    await logActivity({
        userId: req.user.id,
        action: 'UPDATE_COURSE',
        entityType: 'COURSE',
        entityId: updatedCourse._id,
        details: `Course updated: ${updatedCourse.title}`,
        req
    });

    res.status(200).json(updatedCourse);
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    await course.deleteOne();

    await logActivity({
        userId: req.user.id,
        action: 'DELETE_COURSE',
        entityType: 'COURSE',
        entityId: req.params.id,
        details: `Course deleted: ${course.title}`,
        req
    });

    res.status(200).json({ id: req.params.id });
};


// @desc    Add material to course
// @route   POST /api/courses/:id/materials
// @access  Private/Admin
const addMaterial = async (req, res) => {
    const { title, type, link } = req.body;

    if (!title || !type || !link) {
        return res.status(400).json({ message: 'Please provide material title, type and link' });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    const newMaterial = {
        title,
        type,
        link,
    };

    course.materials.push(newMaterial);
    await course.save();

    await logActivity({
        userId: req.user.id,
        action: 'UPDATE_COURSE',
        entityType: 'COURSE',
        entityId: course._id,
        details: `Added ${type} material: ${title}`,
        req
    });

    res.status(201).json(course);
};

// @desc    Mark course as completed
// @route   POST /api/courses/:id/complete
// @access  Private (Student)
const markCourseCompleted = async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user.completedCourses.includes(courseId)) {
        user.completedCourses.push(courseId);
        await user.save();

        await logActivity({
            userId: userId,
            action: 'COMPLETE_COURSE',
            entityType: 'COURSE',
            entityId: courseId,
            details: `Course completed: ${courseId}`,
            req
        });
    }

    res.status(200).json({ message: 'Course marked as completed', completedCourses: user.completedCourses });
}

// @desc    Get all materials from all courses
// @route   GET /api/courses/materials/all
// @access  Private/Admin
const getAllMaterials = async (req, res) => {
    const courses = await Course.find();
    let allMaterials = [];

    courses.forEach(course => {
        const courseMaterials = course.materials.map(m => ({
            ...m.toObject(),
            courseName: course.title,
            courseId: course._id
        }));
        allMaterials = allMaterials.concat(courseMaterials);
    });

    res.status(200).json(allMaterials);
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
const enrollInCourse = async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user.enrolledCourses.includes(courseId)) {
        user.enrolledCourses.push(courseId);
        await user.save();

        await logActivity({
            userId: userId,
            action: 'ENROLL',
            entityType: 'COURSE',
            entityId: courseId,
            details: `Student enrolled in course: ${courseId}`,
            req
        });
    }

    res.status(200).json({ message: 'Enrolled successfully', enrolledCourses: user.enrolledCourses });
};

// @desc    Get student progress
// @route   GET /api/courses/student/progress
// @access  Private (Student)
const getStudentProgress = async (req, res) => {
    const user = await User.findById(req.user.id).populate('enrolledCourses');
    const allCourses = await Course.find();

    const enrolledIds = (user.enrolledCourses || []).map(c => c._id.toString());
    const completedIds = (user.completedCourses || []).map(id => id.toString());

    // Build progress for enrolled courses only (for the chart)
    const progress = (user.enrolledCourses || []).map(course => {
        const isCompleted = completedIds.includes(course._id.toString());
        return {
            courseId: course._id,
            title: course.title,
            completed: isCompleted,
            percentage: isCompleted ? 100 : 0
        };
    });

    // Overall completion = completed / TOTAL courses (matches dashboard)
    const totalCourses = allCourses.length;
    const completedCount = completedIds.length;
    const overallPercentage = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;

    res.status(200).json({ progress, overallPercentage, totalCourses, completedCount });
};

// @desc    Get completed courses
// @route   GET /api/courses/student/completed
// @access  Private (Student)
const getCompletedCourses = async (req, res) => {
    const user = await User.findById(req.user.id).populate('completedCourses');
    res.status(200).json(user.completedCourses);
};

// @desc    Get student activity timeline
// @route   GET /api/courses/student/activity
// @access  Private (Student)
const getStudentActivity = async (req, res) => {
    const ActivityLog = require('../models/ActivityLog');
    const activities = await ActivityLog.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50);
    res.status(200).json(activities);
};

// @desc    Search courses
// @route   GET /api/courses/search
// @access  Private
const searchCourses = async (req, res) => {
    const { q, category, level, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Only show published courses to students
    if (req.user.role !== 'admin') {
        filter.isPublished = true;
    }

    if (q) {
        filter.$text = { $search: q };
    }
    if (category) {
        filter.category = category;
    }
    if (level) {
        filter.level = level;
    }

    const skip = (page - 1) * limit;
    const courses = await Course.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 });

    const total = await Course.countDocuments(filter);

    res.status(200).json({
        courses,
        page: Number(page),
        pages: Math.ceil(total / limit),
        total
    });
};

// @desc    Create new review
// @route   POST /api/courses/:id/reviews
// @access  Private
const createCourseReview = async (req, res) => {
    const { rating, comment } = req.body;

    const course = await Course.findById(req.params.id);

    if (course) {
        const alreadyReviewed = course.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400).json({ message: 'Course already reviewed' });
            return;
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        course.reviews.push(review);

        course.numReviews = course.reviews.length;

        course.averageRating =
            course.reviews.reduce((acc, item) => item.rating + acc, 0) /
            course.reviews.length;

        await course.save();

        await logActivity({
            userId: req.user.id,
            action: 'REVIEW_COURSE',
            entityType: 'COURSE',
            entityId: course._id,
            details: `Course rated ${rating} stars: ${course.title}`,
            req
        });

        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
};

const uploadCourseCover = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    course.coverImage = `/uploads/${req.file.filename}`;
    await course.save();

    res.status(200).json({ coverImage: course.coverImage });
};

module.exports = {
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
};
