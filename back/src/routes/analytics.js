const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, requireOrganizer } = require('../middleware/auth');

// Все маршруты требуют авторизации organizer/admin
router.use(authenticate, requireOrganizer);

// Статистика для дашборда
router.get('/dashboard', analyticsController.getDashboardStats);

// Аналитика посещаемости студентов
router.get('/students', analyticsController.getStudentAttendanceAnalytics);

// Тренды посещаемости по мероприятиям
router.get('/events/trends', analyticsController.getEventAttendanceTrends);

module.exports = router;
