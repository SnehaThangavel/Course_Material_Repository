const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Course = require('../models/Course');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    res.status(403).json({ message: 'Access denied: Admins only' });
};

// @route   GET /api/courses  (all published for students, all for admin)
router.get('/', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { isPublished: true };
        const courses = await Course.find(filter).sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/courses (admin)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { title, description, code } = req.body;
        const course = await Course.create({ title, description, code, createdBy: req.user._id });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/courses/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/courses/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/courses/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
