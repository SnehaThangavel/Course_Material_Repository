import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const User = require('../server/models/User');
const connectDB = require('../server/config/db');

export default async (req, res) => {
    try {
        await connectDB();
        const count = await User.countDocuments();
        const admin = await User.findOne({ email: 'admin@crm.com' });

        res.status(200).json({
            status: 'ok',
            connection: 'healthy',
            totalUsers: count,
            adminFound: !!admin,
            message: 'ESM Super-Diagnostic Complete'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
