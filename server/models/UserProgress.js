const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    levelNumber: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completionDate: { type: Date, default: null },
}, { timestamps: true });

// Unique progress per user, course, level
userProgressSchema.index({ userId: 1, courseId: 1, levelNumber: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
