const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// removed top level connectDB() for serverless stability

const app = express();

const helmet = require('helmet');
const path = require('path');

app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity in this project, or configure properly
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://course-material-repository.vercel.app', /\.vercel\.app$/]
        : true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');

// Logging middleware for debugging
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        console.log(`[PROD API] ${req.method} ${req.path}`);
    }
    next();
});

// Mount under both /api and root for Vercel/Local compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/courses', courseRoutes);
app.use('/courses', courseRoutes);

app.get('/api', (req, res) => {
    res.status(200).send('Express API Root');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy', timestamp: new Date() });
});

app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Express diagnostic route works!', time: new Date() });
});

app.all('/api/*', (req, res) => {
    res.status(200).json({
        message: 'API Function reached, but no specific route matched.',
        path: req.path,
        method: req.method
    });
});

// Error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
