require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api', require('./routes/enrollment.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend in Production
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
