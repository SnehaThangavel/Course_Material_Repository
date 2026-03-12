require('dotenv').config();
const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const user = await User.findOne({ email: 'student@cmr.com' });
    if (!user) {
        console.log('User not found');
        process.exit(1);
    }
    const enrollments = await Enrollment.find({ studentId: user._id }).populate('courseId', 'title');
    console.log('Enrollments for student@cmr.com:');
    enrollments.forEach(e => {
        console.log(`- Course: "${e.courseId?.title}", Level: ${e.levelNumber}, Progress: ${e.progress}`);
    });

    const groupedMap = {};
    enrollments.forEach(e => {
        if (!e.courseId) return;
        const rawTitle = e.courseId.title || 'Unknown';
        const normKey = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!groupedMap[normKey]) {
            groupedMap[normKey] = { count: 0, titles: new Set() };
        }
        groupedMap[normKey].count++;
        groupedMap[normKey].titles.add(rawTitle);
    });

    console.log('\nGrouping Analysis:');
    Object.entries(groupedMap).forEach(([key, val]) => {
        console.log(`Key: "${key}", Count: ${val.count}, Original Titles: ${Array.from(val.titles).join(', ')}`);
    });

    process.exit(0);
});
