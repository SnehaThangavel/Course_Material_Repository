const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        action: {
            type: String,
            required: true,
            enum: ['LOGIN', 'LOGOUT', 'ENROLL', 'COMPLETE_COURSE', 'VIEW_MATERIAL', 'CREATE_COURSE', 'UPDATE_COURSE', 'DELETE_COURSE', 'UPDATE_PROFILE', 'CHANGE_PASSWORD'],
        },
        entityType: {
            type: String,
            enum: ['COURSE', 'MATERIAL', 'USER', 'PROFILE', 'AUTH'],
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        details: {
            type: String,
            default: '',
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries in Activity Feed
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
