const { z } = require('zod');

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const signupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['admin', 'student']).optional(),
});

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    bio: z.string().max(500).optional(),
    organization: z.string().optional(),
    avatar: z.string().url().or(z.literal('')).optional(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6),
});

const courseSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    code: z.string().min(3),
    category: z.string().optional(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().or(z.literal('')).optional(),
    isPublished: z.boolean().optional(),
});

const materialSchema = z.object({
    title: z.string().min(2),
    type: z.enum(['pdf', 'video', 'image', 'note']),
    link: z.string().min(1),
});

module.exports = {
    loginSchema,
    signupSchema,
    updateProfileSchema,
    changePasswordSchema,
    courseSchema,
    materialSchema
};
