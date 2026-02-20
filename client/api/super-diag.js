const User = require('../server/models/User');
const connectDB = require('../server/config/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
        const count = await User.countDocuments();
        const admin = await User.findOne({ email: 'admin@crm.com' });
        const allEmails = await User.find().select('email -_id').limit(10);

        res.status(200).json({
            status: 'ok',
            connection: 'healthy',
            totalUsers: count,
            adminFound: !!admin,
            sampleEmails: allEmails.map(u => u.email),
            message: 'Super-Diagnostic Complete'
        });
    } catch (error) {
        console.error('Super-Diagnostic Error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
};
