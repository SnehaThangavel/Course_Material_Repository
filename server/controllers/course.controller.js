const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');

exports.createCourse = async (req, res) => {
    try {
        const course = new Course({ ...req.body, createdBy: req.user.id });
        await course.save();

        // Trigger Notification
        await Notification.create({
            title: 'New Course Added',
            message: `A new course "${course.title}" is now available.`,
            type: 'new_course',
            courseId: course._id,
            createdBy: req.user.id
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const queryConditions = [];

        // Role-based filtering
        if (req.user && req.user.role === 'admin') {
            console.log('Admin fetching courses');
        } else {
            console.log('Student fetching courses - filtering for published');
            queryConditions.push({ isPublished: true });
        }

        // Handle category filtering - check both fields for backward compatibility
        if (req.query.category && req.query.category !== 'All' && req.query.category !== 'all') {
            queryConditions.push({
                $or: [
                    { skillCategory: req.query.category },
                    { category: req.query.category }
                ]
            });
        }

        // Handle level filtering
        if (req.query.level && req.query.level !== 'All' && req.query.level !== 'all') {
            queryConditions.push({ level: req.query.level });
        }

        // Improved search filtering
        if (req.query.search) {
            const searchRegex = { $regex: req.query.search, $options: 'i' };
            queryConditions.push({
                $or: [
                    { title: searchRegex },
                    { courseCode: searchRegex },
                    { description: searchRegex }
                ]
            });
        }

        const filters = queryConditions.length > 0 ? { $and: queryConditions } : {};
        console.log('Applying final filters:', JSON.stringify(filters));

        const courses = await Course.find(filters)
            .populate('createdBy', 'name')
            .populate('reviews.user', 'name')
            .sort({ createdAt: -1 });

        console.log(`Found ${courses.length} courses`);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('reviews.user', 'name profileImage');
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check if student, ensure course is published
        if (req.user && req.user.role === 'student' && !course.isPublished) {
            return res.status(403).json({ message: 'Course is not published yet' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Trigger Notification for major updates (e.g., description or title change)
        await Notification.create({
            title: 'Course Updated',
            message: `The course "${course.title}" has been updated with new content.`,
            type: 'course_update',
            courseId: course._id,
            createdBy: req.user.id
        });

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Also delete enrollments
        await Enrollment.deleteMany({ courseId: req.params.id });

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const activeCourses = await Course.countDocuments({ isPublished: true });
        const studentsEnrolled = await Enrollment.distinct('studentId').then(docs => docs.length);

        // Calculate average system satisfaction
        const allCourses = await Course.find({}, 'reviews');
        let totalRating = 0;
        let totalReviews = 0;

        allCourses.forEach(course => {
            course.reviews.forEach(review => {
                totalRating += review.rating;
                totalReviews++;
            });
        });

        const systemSatisfaction = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "0.0"; // Default to 0.0 if no reviews

        res.json({ totalCourses, activeCourses, studentsEnrolled, systemSatisfaction });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const alreadyReviewed = course.reviews.find(r => r.user.toString() === req.user.id.toString());
        if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });

        course.reviews.push({ user: req.user.id, rating: Number(rating), comment });
        await course.save();

        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
};
