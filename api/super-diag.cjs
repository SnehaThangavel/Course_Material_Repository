const User = require('./server/models/User.cjs');
const connectDB = require('./server/config/db.cjs');

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
            message: 'Internalized CJS Super-Diagnostic Complete'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
