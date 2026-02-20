const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

const helmet = require('helmet');
const path = require('path');

app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for simplicity in this project, or configure properly
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy', timestamp: new Date() });
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
