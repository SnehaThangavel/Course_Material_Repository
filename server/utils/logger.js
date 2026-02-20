const ActivityLog = require('../models/ActivityLog');

/**
 * Log a user activity to the database
 * @param {Object} params
 * @param {string} params.userId - ID of the user performing the action
 * @param {string} params.action - Action type (from enum)
 * @param {string} params.entityType - Type of entity acted upon
 * @param {string} [params.entityId] - ID of the entity acted upon
 * @param {string} [params.details] - Additional details
 * @param {Object} [params.req] - Express request object for IP and UserAgent
 */
const logActivity = async ({ userId, action, entityType, entityId, details, req }) => {
    try {
        await ActivityLog.create({
            user: userId,
            action,
            entityType,
            entityId,
            details,
            ipAddress: req?.ip || '0.0.0.0',
            userAgent: req?.get('User-Agent') || 'unknown',
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = logActivity;
