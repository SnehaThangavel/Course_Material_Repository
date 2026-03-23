const express = require('express');
const router = express.Router();
const { getNotifications, markRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getNotifications);
router.post('/mark-read', protect, markRead);

module.exports = router;
