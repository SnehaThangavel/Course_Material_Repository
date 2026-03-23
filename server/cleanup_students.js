require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Enrollment = require('./models/Enrollment');
const UserProgress = require('./models/UserProgress');

const TARGET_EMAILS = [
    'rahul.cs23@bitsathy.ac.in',
    'verify.student@bitsathy.ac.in',
    'Sowbharaniga@bitsathy.ac.in',
    'Sindhuuja.cs23@bitsathy.ac.in',
    'Sowbharaniga.it23@bitsathy.ac.in'
];

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for cleanup...');

        for (const email of TARGET_EMAILS) {
            const user = await User.findOne({ email });
            if (user) {
                console.log(`\nPurging data for: ${email}`);
                
                const enrollmentCount = await Enrollment.deleteMany({ studentId: user._id });
                console.log(`- Deleted ${enrollmentCount.deletedCount} enrollments`);

                const progressCount = await UserProgress.deleteMany({ userId: user._id });
                console.log(`- Deleted ${progressCount.deletedCount} progress records`);

                await User.deleteOne({ _id: user._id });
                console.log(`- Deleted user record`);
            } else {
                console.log(`\nNo user found with email: ${email}`);
            }
        }

        console.log('\n✅ Cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
