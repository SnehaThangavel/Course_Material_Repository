const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const userPublicFields = (user) => ({
    _id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    bio: user.bio,
    institute: user.institute,
    rollNumber: user.rollNumber,
    department: user.department,
    year: user.year,
    stream: user.stream,
    phone: user.phone,
});

exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
        });

        res.status(201).json({
            ...userPublicFields(user),
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                ...userPublicFields(user),
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, bio, institute, profileImage, rollNumber, department, year, stream, phone } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (institute !== undefined) user.institute = institute;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (rollNumber !== undefined) user.rollNumber = rollNumber;
        if (department !== undefined) user.department = department;
        if (year !== undefined) user.year = year;
        if (stream !== undefined) user.stream = stream;
        if (phone !== undefined) user.phone = phone;

        const updatedUser = await user.save();
        res.json({
            ...userPublicFields(updatedUser),
            token: generateToken(updatedUser.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Incorrect current password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
