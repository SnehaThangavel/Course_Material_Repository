const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
        const count = await User.countDocuments();
        const admin = await User.findOne({ email: 'admin@crm.com' });
        res.status(200).json({
            status: 'ok',
            db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            userCount: count,
            adminFound: !!admin,
            message: 'Production Data Diagnostic Complete'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
