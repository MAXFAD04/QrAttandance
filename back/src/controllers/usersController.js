const { User, Event, Attendance } = require('../models');
const { Op } = require('sequelize');
const { generateQRCode, isLegacyRasterQrPayload } = require('../utils/qrGenerator');

// Получение всех пользователей (с фильтрами) - только admin
exports.getUsers = async (req, res) => {
  try {
    const {
      role,
      faculty,
      group,
      isActive,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    if (role) where.role = role;
    if (faculty) where.faculty = faculty;
    if (group) where.group = group;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    // Поиск по имени или email
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'refreshToken'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: users.map(u => u.toSafeObject()),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение пользователя по ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Обновление пользователя
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Студент может обновлять только свой профиль
    if (req.user.role === 'student' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Чужой профиль может менять только администратор
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Только админ может менять роли
    if (updates.role && req.user.role !== 'admin') {
      delete updates.role;
    }

    // Студент не меняет собственные ФИО, email, факультет и группу
    if (req.user.role === 'student' && req.user.id === user.id) {
      delete updates.fullName;
      delete updates.email;
      delete updates.faculty;
      delete updates.group;
    }

    // Удаляем поля, которые нельзя обновлять напрямую
    delete updates.password;
    delete updates.refreshToken;

    const oldEmail = user.email;
    const isStudent = user.role === 'student';

    await user.update(updates);

    if (isStudent && updates.email !== undefined && user.email !== oldEmail) {
      const qrCodeData = await generateQRCode({
        type: 'student',
        userId: user.id,
        email: user.email
      });
      await user.update({ studentQrCode: qrCodeData });
    }

    await user.reload();

    res.json({
      message: 'User updated successfully',
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Блокировка/разблокировка пользователя (только admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Удаление пользователя (только admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение персонального QR-кода студента
exports.getStudentQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    // Студент может получить только свой QR
    if (req.user.role === 'student' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(400).json({ error: 'QR codes are only for students' });
    }

    // Генерация QR если нет или в БД лежит старый data URL вместо JSON
    if (!user.studentQrCode || isLegacyRasterQrPayload(user.studentQrCode)) {
      const qrCodeData = await generateQRCode({
        type: 'student',
        userId: user.id,
        email: user.email
      });
      await user.update({ studentQrCode: qrCodeData });

      return res.json({
        qrCode: qrCodeData,
        user: user.toSafeObject()
      });
    }

    res.json({
      qrCode: user.studentQrCode,
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Изменение пароля
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Пользователь может менять только свой пароль
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Проверка текущего пароля (кроме админа)
    if (req.user.role !== 'admin') {
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    await user.update({ password: newPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
