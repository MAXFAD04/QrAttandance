const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, requireOrganizer } = require('../middleware/auth');

// Все маршруты требуют авторизации
router.use(authenticate);

// Отметка посещаемости (check-in)
router.post('/checkin', attendanceController.checkIn);

// Получение посещаемости по мероприятию
router.get('/event/:eventId', attendanceController.getAttendanceByEvent);

// Получение посещаемости студента
router.get('/student/:userId', attendanceController.getAttendanceByStudent);

// Обновление статуса (organizer/admin)
router.patch('/:id', requireOrganizer, attendanceController.updateAttendanceStatus);

// Удаление записи (organizer/admin)
router.delete('/:id', requireOrganizer, attendanceController.deleteAttendance);

module.exports = router;
