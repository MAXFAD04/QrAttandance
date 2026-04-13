const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Все маршруты требуют авторизации
router.use(authenticate);

// Получение всех пользователей (admin)
router.get('/', requireAdmin, usersController.getUsers);

// Получение пользователя по ID
router.get('/:id', usersController.getUserById);

// Обновление пользователя
router.put('/:id', usersController.updateUser);

// Блокировка/разблокировка (admin)
router.patch('/:id/toggle-status', requireAdmin, usersController.toggleUserStatus);

// Удаление пользователя (admin)
router.delete('/:id', requireAdmin, usersController.deleteUser);

// Получение QR-кода студента
router.get('/:id/qrcode', usersController.getStudentQRCode);

// Изменение пароля
router.patch('/:id/change-password', usersController.changePassword);

module.exports = router;
