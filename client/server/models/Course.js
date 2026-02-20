const mongoose = require('mongoose');

const materialSchema = mongoose.Schema({
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['pdf', 'video', 'image', 'note'],
        required: true,
    },
    link: { type: String, required: true }, // URL or text content for notes
});

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true });

const courseSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        materials: [materialSchema],
        reviews: [reviewSchema],
        averageRating: {
            type: Number,
            required: true,
            default: 0
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0
        },
        coverImage: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            default: 'Uncategorized',
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        tags: [String],
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Full-text search index
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
