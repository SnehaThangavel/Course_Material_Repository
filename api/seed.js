const User = require('../client/server/models/User');
const Course = require('../client/server/models/Course');
const connectDB = require('../client/server/config/db');

module.exports = async (req, res) => {
    try {
        await connectDB();

        // Basic data check
        const count = await User.countDocuments();
        if (count > 0 && req.query.force !== 'true') {
            return res.status(200).json({
                message: 'Database already has users. Use ?force=true to re-seed.',
                userCount: count
            });
        }

        // Clear existing data (optional, but good for clean seed)
        await User.deleteMany();
        await Course.deleteMany();

        // Create Admin
        await User.create({
            name: 'Admin User',
            email: 'admin@crm.com',
            password: 'Admin@123',
            role: 'admin',
        });

        // Create a few courses
        await Course.create([
            {
                title: 'Introduction to React',
                description: 'Learn the basics of React.js',
                code: 'REACT101'
            },
            {
                title: 'Advanced Node.js',
                description: 'Deep dive into Node.js',
                code: 'NODE201'
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Production Database Seeded Successfully!',
            adminEmail: 'admin@crm.com'
        });
    } catch (error) {
        console.error('Seeding Error:', error);
        res.status(500).json({ error: error.message });
    }
};
