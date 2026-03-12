const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

exports.enrollInCourse = async (req, res) => {
    try {
        const { courseId, levelNumber } = req.body;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const lvl = levelNumber || 0;

        // Check if already enrolled in this course/level
        const exists = await Enrollment.findOne({ studentId: req.user.id, courseId, levelNumber: lvl });
        if (exists) return res.status(400).json({ message: 'Already enrolled in this level' });

        // PREREQUISITE CHECK: Level N requires Level N-1 to be completed
        if (lvl > 1) {
            const prevLevel = await Enrollment.findOne({
                studentId: req.user.id,
                courseId,
                levelNumber: lvl - 1,
                completed: true
            });
            if (!prevLevel) {
                return res.status(400).json({
                    message: `Prerequisite Required: You must complete Level ${lvl - 1} before registering for Level ${lvl}.`
                });
            }
        }

        const enrollment = new Enrollment({
            studentId: req.user.id,
            courseId,
            levelNumber: lvl,
        });
        await enrollment.save();

        if (lvl > 0) {
            await UserProgress.findOneAndUpdate(
                { userId: req.user.id, courseId, levelNumber: lvl },
                { userId: req.user.id, courseId, levelNumber: lvl, completed: false },
                { upsert: true, new: true }
            );
        } else if (lvl === 0 && course.levels && course.levels.length > 0) {
            // Auto-enroll in Level 1 if the course has levels and they enrolled in the main course
            const hasLvl1 = await Enrollment.findOne({ studentId: req.user.id, courseId, levelNumber: 1 });
            if (!hasLvl1) {
                const lvl1Enrollment = new Enrollment({
                    studentId: req.user.id,
                    courseId,
                    levelNumber: 1,
                });
                await lvl1Enrollment.save();

                await UserProgress.findOneAndUpdate(
                    { userId: req.user.id, courseId, levelNumber: 1 },
                    { userId: req.user.id, courseId, levelNumber: 1, completed: false },
                    { upsert: true, new: true }
                );
            }
        }

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling', error: error.message });
    }
};

exports.getStudentCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ studentId: req.user.id })
            .populate('courseId')
            .sort({ levelNumber: 1 });
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const { courseId, progress, completed, levelNumber } = req.body;
        const lvl = levelNumber !== undefined ? levelNumber : 0;

        const enrollment = await Enrollment.findOne({ studentId: req.user.id, courseId, levelNumber: lvl });
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        if (progress !== undefined) enrollment.progress = progress;
        if (completed !== undefined) {
            enrollment.completed = completed;
            if (completed) {
                enrollment.progress = 100;
                enrollment.completionDate = new Date();

                // Also tick all materials for consistency
                const course = await Course.findById(courseId);
                const level = course?.levels?.find(l => l.levelNumber === lvl);
                if (level) {
                    const allMats = [];
                    (level.topics || []).forEach((topic, tIdx) => {
                        (topic.materials || []).forEach((mat, mIdx) => {
                            allMats.push({ topicIndex: tIdx, materialIndex: mIdx });
                        });
                    });
                    enrollment.completedMaterials = allMats;
                }
            } else {
                enrollment.completionDate = null;
            }
        }

        await enrollment.save();

        if (lvl > 0) {
            await UserProgress.findOneAndUpdate(
                { userId: req.user.id, courseId, levelNumber: lvl },
                { completed: enrollment.completed, completionDate: enrollment.completionDate },
                { upsert: true }
            );
        }

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating progress', error: error.message });
    }
};

// Toggle a specific material as complete/incomplete and recalculate progress
exports.toggleMaterial = async (req, res) => {
    try {
        const { courseId, levelNumber, topicIndex, materialIndex } = req.body;
        const lvl = levelNumber || 0;

        const enrollment = await Enrollment.findOne({ studentId: req.user.id, courseId, levelNumber: lvl });
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        // Toggle: remove if already ticked, add if not
        const existingIdx = enrollment.completedMaterials.findIndex(
            m => m.topicIndex === topicIndex && m.materialIndex === materialIndex
        );

        if (existingIdx >= 0) {
            enrollment.completedMaterials.splice(existingIdx, 1);
        } else {
            enrollment.completedMaterials.push({ topicIndex, materialIndex });
        }

        // Count total materials in this level from the course
        const course = await Course.findById(courseId);
        const level = course?.levels?.find(l => l.levelNumber === lvl);
        let totalMaterials = 0;
        if (level) {
            for (const topic of (level.topics || [])) {
                totalMaterials += (topic.materials || []).length;
            }
        }

        // Recalculate progress %
        enrollment.progress = totalMaterials > 0
            ? Math.round((enrollment.completedMaterials.length / totalMaterials) * 100)
            : 0;

        // Auto-complete when all materials are ticked
        if (enrollment.progress >= 100) {
            enrollment.completed = true;
            enrollment.completionDate = enrollment.completionDate || new Date();
        } else {
            enrollment.completed = false;
            enrollment.completionDate = null;
        }

        await enrollment.save();

        // Sync UserProgress
        if (lvl > 0) {
            await UserProgress.findOneAndUpdate(
                { userId: req.user.id, courseId, levelNumber: lvl },
                { completed: enrollment.completed, completionDate: enrollment.completionDate },
                { upsert: true }
            );
        }

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling material', error: error.message });
    }
};

exports.getCommunityStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

exports.getGlobalSuccessRate = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({});
        if (enrollments.length === 0) return res.json({ successRate: 0 });
        const totalProgress = enrollments.reduce((acc, curr) => acc + curr.progress, 0);
        const successRate = Math.round(totalProgress / enrollments.length);
        res.json({ successRate });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching global success rate', error: error.message });
    }
};

exports.getStudentProgress = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        const progress = await UserProgress.find({ userId })
            .populate('courseId', 'title skillCategory')
            .sort({ createdAt: 1 });
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student progress', error: error.message });
    }
};
