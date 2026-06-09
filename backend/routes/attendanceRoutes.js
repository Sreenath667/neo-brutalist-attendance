const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/mark', attendanceController.markAttendance);
router.get('/user/:userId', attendanceController.getUserAttendance);
router.get('/stats/:userId', attendanceController.getAttendanceStats);
router.get('/daily/:date', attendanceController.getDailyAttendance);

module.exports = router;
