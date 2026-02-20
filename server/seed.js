const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const ActivityLog = require('./models/ActivityLog');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Course.deleteMany();
        await Enrollment.deleteMany();
        await ActivityLog.deleteMany();

        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@cmr.com',
                password: 'Admin@123',
                role: 'admin',
            },
            {
                name: 'Student One',
                email: 'student1@cmr.com',
                password: 'Student@123',
                role: 'student',
            },
            {
                name: 'Student Two',
                email: 'student2@cmr.com',
                password: 'Student@123',
                role: 'student',
            },
        ]);

        console.log('Users Imported!');

        const courses = await Course.create([
            {
                title: 'Introduction to React',
                description: 'Learn the basics of React.js, components, state, and props.',
                code: 'REACT101',
                materials: [
                    { title: 'Lecture Notes', type: 'note', link: 'React is a library for building UIs...' },
                    { title: 'React Documentation', type: 'pdf', link: 'https://react.dev' },
                    { title: 'Intro Video', type: 'video', link: 'https://youtube.com/watch?v=Ke90Tje7VS0' }
                ]
            },
            {
                title: 'Advanced Node.js',
                description: 'Deep dive into Node.js, Express, and asynchronous programming.',
                code: 'NODE201',
                materials: [
                    { title: 'Event Loop Guide', type: 'pdf', link: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/' },
                    { title: 'Building REST APIs', type: 'video', link: 'https://youtube.com/watch?v=pKd0Rpw7O48' }
                ]
            },
            {
                title: 'MongoDB Schema Design',
                description: 'Best practices for data modeling in MongoDB.',
                code: 'MONGO301',
                materials: [
                    { title: 'Schema Design Patterns', type: 'image', link: 'https://webassets.mongodb.com/_com_assets/cms/mongodb_schema_design_patterns-1.png' }
                ]
            },
            {
                title: 'Full-Stack Web Development',
                description: 'Master the MERN stack: MongoDB, Express, React, and Node.js.',
                code: 'MERN401',
                materials: [
                    { title: 'Project Roadmap', type: 'pdf', link: 'https://roadmap.sh/full-stack' },
                    { title: 'GitHub Repo', type: 'note', link: 'Practice projects available at github.com/mern-stack-course' }
                ]
            },
            {
                title: 'Data Science with Python',
                description: 'Learn data analysis, visualization, and machine learning using Python.',
                code: 'PYTHON501',
                materials: [
                    { title: 'Pandas Cheat Sheet', type: 'pdf', link: 'https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf' },
                    { title: 'Intro to NumPy', type: 'video', link: 'https://youtube.com/watch?v=QUT1VHiLmmI' }
                ]
            },
            {
                title: 'UI/UX Design Fundamentals',
                description: 'Principles of user interface and user experience design.',
                code: 'UIUX601',
                materials: [
                    { title: 'Design Principles', type: 'note', link: 'Hierarchy, Balance, Contrast, and Space are key...' }
                ]
            },
        ]);

        console.log('Courses Imported!');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
