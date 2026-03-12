const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  profileImage: { type: String, default: '' },
  bio: { type: String, default: '' },
  institute: { type: String, default: '' },
  // Extended student profile fields
  rollNumber: { type: String, default: '' },
  department: { type: String, default: '' },
  year: { type: String, default: '' },
  stream: { type: String, enum: ['BE', 'BTECH', 'MCA', 'MBA', 'Other', ''], default: '' },
  phone: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
