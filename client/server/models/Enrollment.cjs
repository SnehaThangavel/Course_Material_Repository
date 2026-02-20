const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
        status: {
            type: String,
            enum: ['enrolled', 'completed', 'dropped'],
            default: 'enrolled',
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        completedMaterials: [
            {
                type: mongoose.Schema.Types.ObjectId,
            },
        ],
        enrolledAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure a student can only have one enrollment record per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
