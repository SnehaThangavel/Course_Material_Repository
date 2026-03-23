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
        const totalEnrollments = await Enrollment.countDocuments({ levelNumber: { $ne: 0 } });
        const completedCount = await Enrollment.countDocuments({ completed: true, levelNumber: { $ne: 0 } });
        const completionRate = totalEnrollments > 0
            ? Math.round((completedCount / totalEnrollments) * 100)
            : 0;

        // Daily enrollment trend (last 7 days)
        const dailyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const start = new Date(date).setHours(0,0,0,0);
            const end = new Date(date).setHours(23,59,59,999);
            const count = await Enrollment.countDocuments({
                createdAt: { $gte: start, $lte: end }
            });
            dailyData.push({
                name: new Date(date).toLocaleString('default', { weekday: 'short' }),
                enrollments: count
            });
        }

        // Weekly enrollment trend (last 4 weeks)
        const weeklyData = [];
        for (let i = 3; i >= 0; i--) {
            const end = new Date();
            end.setDate(end.getDate() - (i * 7));
            end.setHours(23,59,59,999);
            const start = new Date(end);
            start.setDate(start.getDate() - 6);
            start.setHours(0,0,0,0);
            const count = await Enrollment.countDocuments({
                createdAt: { $gte: start, $lte: end }
            });
            weeklyData.push({
                name: `Week ${4-i}`,
                enrollments: count
            });
        }

        res.json({ totalStudents, totalCourses, totalEnrollments, completedCount, completionRate, dailyData, weeklyData });
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

        // Level completion over time - with a starting zero baseline
        const firstEnrollment = await Enrollment.findOne({ studentId: userId }).sort({ createdAt: 1 });
        const startDate = firstEnrollment ? firstEnrollment.createdAt : null;

        const completedLevels = progress
            .filter(p => p.completed && p.completionDate)
            .sort((a, b) => new Date(a.completionDate) - new Date(b.completionDate));

        const growthData = [];
        if (startDate && completedLevels.length > 0) {
            // Add initial point (0 levels at enrollment date)
            growthData.push({
                date: new Date(startDate).toLocaleDateString(),
                levels: 0,
            });
        }

        completedLevels.forEach((p, idx) => {
            growthData.push({
                date: new Date(p.completionDate).toLocaleDateString(),
                levels: idx + 1,
            });
        });

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

// GET /api/analytics/students-list - List of all students with enrollment stats (admin)
exports.getStudentsList = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 }).lean();
        
        // Enhance students with enrollment and completion counts
        const enhancedStudents = await Promise.all(students.map(async (student) => {
            const enrollments = await Enrollment.find({ studentId: student._id });
            
            // Count unique courses
            const enrolledCourseIds = new Set(enrollments.map(e => e.courseId.toString()));
            const enrolledCount = enrolledCourseIds.size;
            
            // Count completed enrollments (levels/courses)
            const completedCount = enrollments.filter(e => e.completed).length;
            
            return {
                ...student,
                enrolledCount,
                completedCount
            };
        }));

        res.json(enhancedStudents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students list', error: error.message });
    }
};

// GET /api/analytics/published-courses - List of published courses (admin) with enrollment stats
exports.getPublishedCoursesList = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
        
        const enhancedCourses = await Promise.all(courses.map(async (course) => {
            const enrollments = await Enrollment.find({ courseId: course._id }).populate('studentId', 'name email rollNumber department year');
            const enrollmentCount = enrollments.filter(e => e.levelNumber !== 0).length;
            const completedCount = enrollments.filter(e => e.completed && e.levelNumber !== 0).length;
            
            // Group by level
            const levelBreakdown = {};
            enrollments.forEach(e => {
                const levelKey = e.levelNumber === 0 ? 'Full Course' : `Level ${e.levelNumber}`;
                if (!levelBreakdown[levelKey]) {
                    levelBreakdown[levelKey] = { count: 0, students: [] };
                }
                levelBreakdown[levelKey].count++;
                if (e.studentId) {
                    levelBreakdown[levelKey].students.push(e.studentId);
                }
            });

            return {
                ...course,
                enrollmentCount,
                completedCount,
                levelBreakdown
            };
        }));

        res.json(enhancedCourses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching published courses', error: error.message });
    }
};

// GET /api/analytics/enrollment-details - Enrollment counts per course with level breakdown and student lists (admin)
exports.getCourseEnrollmentCounts = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({}).populate('courseId', 'title skillCategory levels').populate('studentId', 'name email rollNumber department year');
        const courseMap = {};
        
        enrollments.forEach(e => {
            if (e.courseId) {
                const courseId = e.courseId._id.toString();
                if (!courseMap[courseId]) {
                    courseMap[courseId] = {
                        _id: courseId,
                        title: e.courseId.title,
                        category: e.courseId.skillCategory || 'Uncategorized',
                        enrollmentCount: 0,
                        levelBreakdown: {}
                    };
                }
                if (e.levelNumber !== 0) {
                    courseMap[courseId].enrollmentCount++;
                }
                
                const levelKey = e.levelNumber === 0 ? 'Full Course' : `Level ${e.levelNumber}`;
                if (!courseMap[courseId].levelBreakdown[levelKey]) {
                    courseMap[courseId].levelBreakdown[levelKey] = { count: 0, students: [] };
                }
                courseMap[courseId].levelBreakdown[levelKey].count++;
                if (e.studentId) {
                    courseMap[courseId].levelBreakdown[levelKey].students.push(e.studentId);
                }
            }
        });
        
        const data = Object.values(courseMap).sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course enrollment details', error: error.message });
    }
};

// GET /api/analytics/completed-details - Completion counts per course with level breakdown and student lists (admin)
exports.getCourseCompletionCounts = async (req, res) => {
    try {
        const completedEnrollments = await Enrollment.find({ completed: true }).populate('courseId', 'title skillCategory').populate('studentId', 'name email rollNumber department year');
        const courseMap = {};
        
        completedEnrollments.forEach(e => {
            if (e.courseId) {
                const courseId = e.courseId._id.toString();
                if (!courseMap[courseId]) {
                    courseMap[courseId] = {
                        _id: courseId,
                        title: e.courseId.title,
                        category: e.courseId.skillCategory || 'Uncategorized',
                        completedCount: 0,
                        levelBreakdown: {}
                    };
                }
                if (e.levelNumber !== 0) {
                    courseMap[courseId].completedCount++;
                }
                
                const levelKey = e.levelNumber === 0 ? 'Full Course' : `Level ${e.levelNumber}`;
                if (!courseMap[courseId].levelBreakdown[levelKey]) {
                    courseMap[courseId].levelBreakdown[levelKey] = { count: 0, students: [] };
                }
                courseMap[courseId].levelBreakdown[levelKey].count++;
                if (e.studentId) {
                    courseMap[courseId].levelBreakdown[levelKey].students.push(e.studentId);
                }
            }
        });
        
        const data = Object.values(courseMap).sort((a, b) => b.completedCount - a.completedCount);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course completion details', error: error.message });
    }
};

// GET /api/analytics/detailed - Detailed filtering for students/enrollments (admin)
exports.getDetailedAnalytics = async (req, res) => {
    try {
        const { department, year, skillCategory, courseId, level } = req.query;
        
        const filter = {};
        const studentFilter = { role: 'student' };

        // Handle multi-select arrays
        if (department && department.length) studentFilter.department = { $in: Array.isArray(department) ? department : [department] };
        if (year && year.length) studentFilter.year = { $in: (Array.isArray(year) ? year : [year]).map(Number) };
        
        // Find matching students first
        const students = await User.find(studentFilter).select('_id name email rollNumber department year').lean();
        const studentIds = students.map(s => s._id);

        // Build main enrollment filter
        const enrollmentFilter = { studentId: { $in: studentIds } };
        
        if (courseId && courseId.length) enrollmentFilter.courseId = { $in: Array.isArray(courseId) ? courseId : [courseId] };
        
        if (level && level.length) {
            const levels = (Array.isArray(level) ? level : [level]).map(l => {
                const match = l.match(/\d+/);
                return match ? parseInt(match[0]) : null;
            }).filter(l => l !== null);
            if (levels.length) enrollmentFilter.levelNumber = { $in: levels };
        }

        // Fetch enrollments with population
        const enrollments = await Enrollment.find(enrollmentFilter)
            .populate('studentId', 'name email rollNumber department year')
            .populate('courseId', 'title skillCategory')
            .lean();

        let filteredData = enrollments.filter(e => e.studentId && e.courseId);
        
        if (skillCategory && skillCategory.length) {
            const categories = Array.isArray(skillCategory) ? skillCategory : [skillCategory];
            filteredData = filteredData.filter(e => categories.includes(e.courseId.skillCategory));
        }

        // Deduplicate: if a student has both Level 0 and Level N (>0) for the same course, remove Level 0
        const enrollmentMap = new Map();
        filteredData.forEach(e => {
            const key = `${e.studentId._id.toString()}_${e.courseId._id.toString()}`;
            if (!enrollmentMap.has(key)) {
                enrollmentMap.set(key, []);
            }
            enrollmentMap.get(key).push(e);
        });

        const deduplicatedData = [];
        enrollmentMap.forEach(courseEnrollments => {
            const hasLevels = courseEnrollments.some(e => e.levelNumber > 0);
            if (hasLevels) {
                // Keep only level > 0 enrollments
                deduplicatedData.push(...courseEnrollments.filter(e => e.levelNumber > 0));
            } else {
                // Keep the level 0 enrollment
                deduplicatedData.push(...courseEnrollments);
            }
        });

        // Map to flat structure for table
        const tableData = deduplicatedData.map(e => ({
            _id: e._id,
            studentName: e.studentId.name,
            rollNumber: e.studentId.rollNumber,
            department: e.studentId.department,
            year: e.studentId.year,
            courseTitle: e.courseId.title,
            skillCategory: e.courseId.skillCategory,
            level: e.levelNumber === 0 ? 'Full Course' : `Level ${e.levelNumber}`,
            status: e.completed ? 'Completed' : 'In Progress',
            progress: e.progress || 0,
            completionDate: e.completionDate
        }));

        // Advanced Metrics
        const totalFilteredStudents = new Set(tableData.map(t => t.studentName)).size;
        const avgCompletion = tableData.length > 0 
            ? Math.round(tableData.reduce((acc, curr) => acc + curr.progress, 0) / tableData.length)
            : 0;
        
        // Find top performing group (by department)
        const deptStats = {};
        tableData.forEach(t => {
            if (!deptStats[t.department]) deptStats[t.department] = { total: 0, progress: 0 };
            deptStats[t.department].total++;
            deptStats[t.department].progress += t.progress;
        });

        let topGroup = 'N/A';
        let maxAvg = -1;
        Object.entries(deptStats).forEach(([dept, stat]) => {
            const avg = stat.progress / stat.total;
            if (avg > maxAvg) {
                maxAvg = avg;
                topGroup = dept;
            }
        });

        res.json({
            tableData,
            metrics: {
                totalStudents: totalFilteredStudents,
                totalRecords: tableData.length,
                avgCompletion,
                topGroup
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching detailed analytics', error: error.message });
    }
};

