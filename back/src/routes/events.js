const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { authenticate, requireOrganizer } = require('../middleware/auth');

// Все маршруты требуют авторизации
router.use(authenticate);

// Получение списка мероприятий
router.get('/', eventsController.getEvents);

// Получение одного мероприятия
router.get('/:id', eventsController.getEventById);

// Создание мероприятия (organizer/admin)
router.post('/', requireOrganizer, eventsController.createEvent);

// Обновление мероприятия (organizer/admin)
router.put('/:id', requireOrganizer, eventsController.updateEvent);

// Удаление мероприятия (organizer/admin)
router.delete('/:id', requireOrganizer, eventsController.deleteEvent);

// Публикация мероприятия (organizer/admin)
router.patch('/:id/publish', requireOrganizer, eventsController.publishEvent);

// Получение QR-кода мероприятия (статический, legacy)
router.get('/:id/qrcode', eventsController.getEventQRCode);

// Ротируемый QR-код (меняется каждые 10 сек)
router.get('/:id/qrcode/active', eventsController.getRotatingQRCode);

module.exports = router;
