const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: String,
    type: { type: String, enum: ['pdf', 'document', 'image', 'link', 'youtube', 'zip'] },
    url: String,
});

const topicSchema = new mongoose.Schema({
    title: String,
    materials: [materialSchema],
});

const levelSchema = new mongoose.Schema({
    levelNumber: { type: Number, required: true },
    levelTitle: { type: String, default: '' },
    topics: [topicSchema],
});

// Keep existing sectionSchema for backward compat
const sectionSchema = new mongoose.Schema({
    title: String,
    materials: [materialSchema],
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    courseCode: { type: String, required: true, unique: true },
    category: { type: String, default: 'Uncategorized' },
    skillCategory: { type: String, enum: ['Software', 'Hardware', 'General', 'Uncategorized'], default: 'Uncategorized' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
    description: { type: String },
    coverImage: { type: String, default: '' },
    instructors: [{ type: String }],
    topics: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    // New level-based structure
    levels: [levelSchema],
    totalLevels: { type: Number, default: 0 },
    // Legacy sections kept for backward compatibility
    sections: [sectionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
