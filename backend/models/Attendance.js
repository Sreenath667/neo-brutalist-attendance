const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  periods: [{
    periodNumber: {
      type: Number,
      min: 1,
      max: 7,
      required: true
    },
    subject: String,
    status: {
      type: String,
      enum: ['present', 'absent', 'leave'],
      default: 'absent'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  totalPeriodsWorked: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
