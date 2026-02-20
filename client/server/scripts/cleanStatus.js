const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const ActivityLog = require('../models/ActivityLog');
const Course = require('../models/Course');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for cleanup...');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const cleanData = async () => {
    await connectDB();
    try {
        console.log('Cleaning Enrollments...');
        await Enrollment.deleteMany();

        console.log('Cleaning Activity Logs...');
        await ActivityLog.deleteMany();

        console.log('Resetting User enrollment statuses...');
        await User.updateMany({}, {
            $set: {
                enrolledCourses: [],
                completedCourses: []
            }
        });

        console.log('Resetting Course ratings and counts...');
        await Course.updateMany({}, {
            $set: {
                reviews: [],
                numReviews: 0,
                averageRating: 0
            }
        });

        console.log('Database Status Cleaned Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Cleanup failed: ${error.message}`);
        process.exit(1);
    }
};

cleanData();
