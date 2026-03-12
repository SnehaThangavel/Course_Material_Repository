const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    levelNumber: { type: Number, default: 0 }, // 0 = whole course, >0 = specific level
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completionDate: { type: Date, default: null },
    // tracks which materials the student has ticked
    completedMaterials: [{
        topicIndex: { type: Number, required: true },
        materialIndex: { type: Number, required: true },
    }],
}, { timestamps: true });

// Allow multiple enrollments per course (one per level)
enrollmentSchema.index({ studentId: 1, courseId: 1, levelNumber: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
