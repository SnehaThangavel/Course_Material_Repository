const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['course_update', 'new_course', 'system'], default: 'course_update' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
