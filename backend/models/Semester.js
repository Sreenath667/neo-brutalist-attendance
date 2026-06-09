const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  workingDays: {
    type: Number,
    default: 90
  },
  startDate: Date,
  endDate: Date,
  totalPeriods: {
    type: Number,
    default: 7
  },
  minimumAttendancePercentage: {
    type: Number,
    default: 75
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Semester', semesterSchema);
