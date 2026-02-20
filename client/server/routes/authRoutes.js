const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const {
    registerUser,
    loginUser,
    getMe,
    getUsers,
    updateProfile,
    changePassword,
    uploadAvatar,
    getMyActivity,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { loginSchema, signupSchema, updateProfileSchema, changePasswordSchema } = require('../utils/validation');

router.post('/signup', validate(signupSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, admin, getUsers);
router.get('/activity', protect, getMyActivity);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
