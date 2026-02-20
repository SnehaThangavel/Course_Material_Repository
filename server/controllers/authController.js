const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logActivity = require('../utils/logger');
const asyncHandler = require('express-async-handler');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'student', // Default to student
    });

    if (user) {
        await logActivity({
            userId: user._id,
            action: 'UPDATE_PROFILE',
            entityType: 'USER',
            entityId: user._id,
            details: `User registered: ${email}`,
            req
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
        console.log(`User not found: ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (isMatch) {
        console.log(`Login successful for: ${email}`);
        await logActivity({
            userId: user._id,
            action: 'LOGIN',
            entityType: 'AUTH',
            entityId: user._id,
            details: `User logged in: ${email}`,
            req
        });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        console.log(`Invalid password for: ${email}`);
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        completedCourses: user.completedCourses,
        enrolledCourses: user.enrolledCourses,
        phone: user.phone || '',
        bio: user.bio || '',
        organization: user.organization || '',
        avatar: user.avatar || '',
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
        user.organization = req.body.organization !== undefined ? req.body.organization : user.organization;
        user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

        const updatedUser = await user.save();

        await logActivity({
            userId: user._id,
            action: 'UPDATE_PROFILE',
            entityType: 'PROFILE',
            entityId: user._id,
            details: `Profile updated: ${user.email}`,
            req
        });

        res.status(200).json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
            organization: updatedUser.organization,
            avatar: updatedUser.avatar,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword;
        await user.save();

        await logActivity({
            userId: user._id,
            action: 'CHANGE_PASSWORD',
            entityType: 'AUTH',
            entityId: user._id,
            details: 'User changed password',
            req
        });

        res.status(200).json({ message: 'Password updated successfully' });
    } else {
        res.status(401).json({ message: 'Invalid current password' });
    }
});

// @desc    Get all users with optional role filter
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const filter = role ? { role } : {};

    // Get users and count their completed courses
    const users = await User.find(filter).select('-password');

    res.status(200).json(users);
});

// @desc    Upload profile image
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
    }

    const user = await User.findById(req.user.id);
    if (user) {
        user.avatar = `/uploads/avatars/${req.file.filename}`;
        await user.save();

        await logActivity({
            userId: user._id,
            action: 'UPDATE_PROFILE',
            entityType: 'PROFILE',
            entityId: user._id,
            details: 'Uploaded new avatar',
            req
        });

        res.status(200).json({ avatar: user.avatar });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Get my activity log (paginated)
// @route   GET /api/auth/activity
// @access  Private
const getMyActivity = asyncHandler(async (req, res) => {
    const ActivityLog = require('../models/ActivityLog');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Allow admin to view any user's activity, students only their own
    const targetUserId = (req.user.role === 'admin' && req.query.userId) ? req.query.userId : req.user.id;

    const activities = await ActivityLog.find({ user: targetUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await ActivityLog.countDocuments({ user: targetUserId });

    res.status(200).json({
        activities,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUsers,
    updateProfile,
    changePassword,
    uploadAvatar,
    getMyActivity,
};
