const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkInTime: Date,
  checkOutTime: Date,
  checkInLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
  },
  checkOutLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
  },
  isInsideLocation: {
    type: Boolean,
    default: false,
  },
  faceVerified: {
    type: Boolean,
    default: false,
  },
  faceVerificationScore: Number,
  checkInImage: String,
  checkOutImage: String,
  totalHours: Number,
  status: {
    type: String,
    enum: ['present', 'absent', 'half_day', 'on_leave', 'late'],
    default: 'absent',
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

attendanceSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
