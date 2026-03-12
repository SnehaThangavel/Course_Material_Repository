const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
