const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Fetch notifications created after the user signed up
        // and ideally showing recent ones
        const notifications = await Notification.find({
            createdAt: { $gt: user.createdAt }
        }).sort({ createdAt: -1 }).limit(20);

        // Count unread (created after lastNotificationCheck)
        const unreadCount = await Notification.countDocuments({
            createdAt: { $gt: user.lastNotificationCheck || user.createdAt }
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            lastNotificationCheck: new Date()
        });
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
    }
};
