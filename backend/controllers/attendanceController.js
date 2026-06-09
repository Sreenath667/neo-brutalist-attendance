const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Semester = require('../models/Semester');

// Mark attendance for a period
exports.markAttendance = async (req, res) => {
  try {
    const { userId, date, periodNumber, subject, status } = req.body;

    if (!userId || !date || !periodNumber || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (![1, 2, 3, 4, 5, 6, 7].includes(periodNumber)) {
      return res.status(400).json({ error: 'Invalid period number' });
    }

    if (!['present', 'absent', 'leave'].includes(status)) {
      return res.status(400).json({ error: 'Invalid attendance status' });
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const dbAvailable = req.app && req.app.locals && req.app.locals.dbConnected === true;
    if (!dbAvailable) {
      // Return a mock attendance response for local testing when DB is offline
      const mockAttendance = {
        userId,
        date: dateObj,
        periods: [{ periodNumber, subject, status, timestamp: new Date() }],
        totalPeriodsWorked: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return res.status(200).json({ message: 'Attendance marked (mock)', attendance: mockAttendance });
    }

    let attendance = await Attendance.findOne({ 
      userId, 
      date: { $gte: dateObj, $lt: new Date(dateObj.getTime() + 86400000) }
    });

    if (!attendance) {
      attendance = new Attendance({
        userId,
        date: dateObj,
        periods: []
      });
    }

    const periodIndex = attendance.periods.findIndex(p => p.periodNumber === periodNumber);
    if (periodIndex > -1) {
      attendance.periods[periodIndex].status = status;
      attendance.periods[periodIndex].subject = subject || attendance.periods[periodIndex].subject;
      attendance.periods[periodIndex].timestamp = new Date();
    } else {
      attendance.periods.push({
        periodNumber,
        subject,
        status,
        timestamp: new Date()
      });
    }

    attendance.totalPeriodsWorked = attendance.periods.length;
    attendance.updatedAt = new Date();
    await attendance.save();

    res.status(200).json({ 
      message: 'Attendance marked successfully',
      attendance 
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance', details: error.message });
  }
};

// Get attendance for a user
exports.getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const dbAvailable = req.app && req.app.locals && req.app.locals.dbConnected === true;
    if (!dbAvailable) {
      return res.status(200).json({ message: 'No attendance records found (mock)', records: [], summary: null });
    }

    const attendanceRecords = await Attendance.find(query).sort({ date: -1 });

    // Calculate summary
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalClasses = 0;

    attendanceRecords.forEach(record => {
      record.periods.forEach(period => {
        totalClasses++;
        if (period.status === 'present') totalPresent++;
        if (period.status === 'absent') totalAbsent++;
        if (period.status === 'leave') totalLeave++;
      });
    });

    const attendancePercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;

    res.status(200).json({
      records: attendanceRecords,
      summary: {
        totalPresent,
        totalAbsent,
        totalLeave,
        totalClasses,
        attendancePercentage: parseFloat(attendancePercentage)
      }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
  }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const dbAvailable = req.app && req.app.locals && req.app.locals.dbConnected === true;
    if (!dbAvailable) {
      return res.status(200).json({
        stats: {
          totalPresent: 0,
          totalAbsent: 0,
          totalLeave: 0,
          attendancePercentage: 0,
          daysAttended: 0,
          totalDaysWorked: 90
        }
      });
    }

    const attendanceRecords = await Attendance.find({ userId });

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let daysAttended = 0;

    attendanceRecords.forEach(record => {
      const hasPresent = record.periods.some(p => p.status === 'present');
      if (hasPresent) daysAttended++;

      record.periods.forEach(period => {
        if (period.status === 'present') totalPresent++;
        if (period.status === 'absent') totalAbsent++;
        if (period.status === 'leave') totalLeave++;
      });
    });

    const totalClasses = totalPresent + totalAbsent + totalLeave;
    const attendancePercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;

    res.status(200).json({
      stats: {
        totalPresent,
        totalAbsent,
        totalLeave,
        attendancePercentage: parseFloat(attendancePercentage),
        daysAttended,
        totalDaysWorked: 90
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
};

// Get daily attendance
exports.getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.params;
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const dbAvailable = req.app && req.app.locals && req.app.locals.dbConnected === true;
    if (!dbAvailable) {
      return res.status(200).json({ date: dateObj, attendance: [] });
    }

    const attendance = await Attendance.find({
      date: { $gte: dateObj, $lt: new Date(dateObj.getTime() + 86400000) }
    }).populate('userId', 'name email rollNumber');

    res.status(200).json({ 
      date: dateObj,
      attendance 
    });
  } catch (error) {
    console.error('Error fetching daily attendance:', error);
    res.status(500).json({ error: 'Failed to fetch daily attendance', details: error.message });
  }
};
