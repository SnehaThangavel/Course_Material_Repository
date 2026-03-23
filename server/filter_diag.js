const mongoose = require('mongoose');
require('dotenv').config();

const courseSchema = new mongoose.Schema({
    title: String,
    level: String,
    category: String,
    skillCategory: String
});
const Course = mongoose.model('Course', courseSchema);

async function diag() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const courses = await Course.find({}, 'title level skillCategory category');
        console.log('--- COURSES ---');
        console.log(JSON.stringify(courses, null, 2));
        console.log('--- END ---');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

diag();
