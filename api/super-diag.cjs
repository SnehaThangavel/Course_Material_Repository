const User = require('../client/server/models/User');
const connectDB = require('../client/server/config/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
        const count = await User.countDocuments();
        const admin = await User.findOne({ email: 'admin@crm.com' });

        res.status(200).json({
            status: 'ok',
            connection: 'healthy',
            totalUsers: count,
            adminFound: !!admin,
            message: 'CJS Super-Diagnostic Complete'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
