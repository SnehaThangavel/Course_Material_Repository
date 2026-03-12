const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const UserProgress = require('../models/UserProgress');

// GET /api/analytics/department - Department-wise analytics (admin)
exports.getDepartmentAnalytics = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('department year');
        const deptMap = {};
        students.forEach(s => {
            const dept = s.department || 'Not Set';
            deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        const data = Object.entries(deptMap).map(([name, value]) => ({ name, value }));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching department analytics', error: error.message });
    }
};

// GET /api/analytics/year - Year-wise analytics (admin)
exports.getYearAnalytics = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('year');
        const yearMap = {};
        students.forEach(s => {
            const year = s.year ? `Year ${s.year}` : 'Not Set';
            yearMap[year] = (yearMap[year] || 0) + 1;
        });
        const data = Object.entries(yearMap).map(([name, value]) => ({ name, value }));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching year analytics', error: error.message });
    }
};

// GET /api/analytics/skill - Skill-category-wise analytics (admin)
exports.getSkillAnalytics = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).select('skillCategory title');
        const enrollments = await Enrollment.find({}).populate('courseId', 'skillCategory');
        const skillMap = {};
        enrollments.forEach(e => {
            if (e.courseId) {
                const cat = e.courseId.skillCategory || 'Uncategorized';
                skillMap[cat] = (skillMap[cat] || 0) + 1;
            }
        });
        const data = Object.entries(skillMap).map(([name, value]) => ({ name, value }));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching skill analytics', error: error.message });
    }
};

// GET /api/analytics/level - Level completion analytics (admin)
exports.getLevelAnalytics = async (req, res) => {
    try {
        const progress = await UserProgress.find({}).populate('courseId', 'title');
        const levelMap = {};
        const totalMap = {};
        progress.forEach(p => {
            const key = `${p.courseId?.title || 'Unknown'} – Level ${p.levelNumber}`;
            if (!totalMap[key]) totalMap[key] = 0;
            if (!levelMap[key]) levelMap[key] = 0;
            totalMap[key]++;
            if (p.completed) levelMap[key]++;
        });
        const data = Object.keys(totalMap).map(name => ({
            name,
            completed: levelMap[name] || 0,
            total: totalMap[name]
        }));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching level analytics', error: error.message });
    }
};

// GET /api/analytics/overview - Admin overview stats
exports.getOverview = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalCourses = await Course.countDocuments({ isPublished: true });
        const totalEnrollments = await Enrollment.countDocuments();
        const completedCount = await Enrollment.countDocuments({ completed: true });
        const completionRate = totalEnrollments > 0
            ? Math.round((completedCount / totalEnrollments) * 100)
            : 0;

        // Monthly enrollment trend (last 6 months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const count = await Enrollment.countDocuments({
                createdAt: { $gte: start, $lte: end }
            });
            monthlyData.push({
                month: start.toLocaleString('default', { month: 'short' }),
                enrollments: count
            });
        }

        res.json({ totalStudents, totalCourses, totalEnrollments, completionRate, monthlyData });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching overview', error: error.message });
    }
};

// GET /api/analytics/student-overview - Student's own analytics
exports.getStudentOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        // Enrollments are per level. Populate course details.
        const enrollments = await Enrollment.find({ studentId: userId }).populate('courseId', 'title skillCategory');
        const progress = await UserProgress.find({ userId }).populate('courseId', 'title skillCategory');

        // System wide skills: check all courses to get available categories
        const allStatsCourses = await Course.find({}).select('skillCategory');
        const systemCategoriesSet = new Set();
        // Add base categories
        ['Software', 'Hardware', 'General Skills'].forEach(cat => systemCategoriesSet.add(cat));
        // Add categories from actual courses
        allStatsCourses.forEach(c => {
            if (c.skillCategory) systemCategoriesSet.add(c.skillCategory.trim());
        });
        const totalSystemSkills = systemCategoriesSet.size;

        // Group by course ID to completely avoid duplicates for multi-level enrollments
        const groupedMap = {};
        enrollments.forEach(e => {
            if (!e.courseId) return;
            const courseId = e.courseId._id.toString();

            if (!groupedMap[courseId]) {
                groupedMap[courseId] = {
                    displayName: e.courseId.title || 'Unknown',
                    progress: 0,
                    category: e.courseId.skillCategory || 'Uncategorized'
                };
            }
            if (e.progress > groupedMap[courseId].progress) {
                groupedMap[courseId].progress = e.progress || 0;
            }
        });

        const uniqueCourseIds = Object.keys(groupedMap);
        const totalEnrolledCourses = uniqueCourseIds.length;
        const fullyCompletedCourses = Object.values(groupedMap).filter(g => g.progress >= 100).length;
        const activeCount = totalEnrolledCourses - fullyCompletedCourses;
        const levelsCompletedCount = enrollments.filter(e => e.completed).length;

        // Skill status (categories student has engaged with)
        const studentSkillSet = new Set();
        const completedSkillSet = new Set();

        uniqueCourseIds.forEach(id => {
            studentSkillSet.add(groupedMap[id].category.trim());
        });

        enrollments.forEach(e => {
            if (e.courseId && e.courseId.skillCategory && e.completed) {
                completedSkillSet.add(e.courseId.skillCategory.trim());
            }
        });

        const studentSkillCount = studentSkillSet.size;
        const completedSkillCount = completedSkillSet.size;

        // Prepare Pie Chart data
        const pieDataMap = {};
        studentSkillSet.forEach(cat => {
            pieDataMap[cat] = (pieDataMap[cat] || 0) + 1;
        });
        const skillData = Object.entries(pieDataMap).map(([name, value]) => ({ name, value }));

        // Level completion over time
        const completedLevels = progress
            .filter(p => p.completed && p.completionDate)
            .sort((a, b) => new Date(a.completionDate) - new Date(b.completionDate));

        const growthData = completedLevels.map((p, idx) => ({
            date: new Date(p.completionDate).toLocaleDateString(),
            levels: idx + 1,
        }));

        // Course completion percentage - use display name for the chart
        const courseProgress = Object.values(groupedMap).map(data => ({
            name: data.displayName,
            progress: data.progress
        }));

        res.json({
            totalEnrolled: totalEnrolledCourses,
            activeCount: activeCount,
            completedCount: levelsCompletedCount,
            skillData,
            growthData,
            courseProgress,
            totalSystemSkills,
            studentSkillCount,
            completedSkillCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student overview', error: error.message });
    }
};
