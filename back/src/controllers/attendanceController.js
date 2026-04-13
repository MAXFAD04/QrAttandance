const { Attendance, Event, User } = require('../models');
const { Op } = require('sequelize');
const { validateToken } = require('../utils/qrTokenStore');

// Отметка посещаемости (сканирование QR)
exports.checkIn = async (req, res) => {
  try {
    const { eventId, userId, qrData } = req.body;

    // Проверка мероприятия
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Проверка статуса мероприятия
    if (event.status !== 'published' && event.status !== 'ongoing') {
      return res.status(400).json({ error: 'Event is not active for check-in' });
    }

    // Валидация ротируемого QR-токена
    const qrToken = req.body.qrToken;
    if (qrToken) {
      if (!validateToken(eventId, qrToken)) {
        return res.status(400).json({ error: 'QR-код устарел. Попросите организатора показать актуальный QR-код' });
      }
    }

    // Проверка пользователя
    const user = await User.findByPk(userId || req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Проверка дублирования
    const existingAttendance = await Attendance.findOne({
      where: { userId: user.id, eventId: event.id }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        error: 'Already checked in',
        attendance: existingAttendance
      });
    }

    // Определение статуса (present/late)
    const now = new Date();
    const eventStart = new Date(event.startDate);
    let status = 'present';

    if (now > eventStart) {
      if (event.allowLateCheckin) {
        status = 'late';
      } else {
        return res.status(400).json({ error: 'Late check-in not allowed for this event' });
      }
    }

    // Проверка максимального количества участников
    if (event.maxAttendees) {
      const currentAttendees = await Attendance.count({ where: { eventId: event.id } });
      if (currentAttendees >= event.maxAttendees) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    // Создание записи посещаемости
    const attendance = await Attendance.create({
      userId: user.id,
      eventId: event.id,
      checkinTime: now,
      status,
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    // Загрузка с связями
    const attendanceWithDetails = await Attendance.findByPk(attendance.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'group']
        },
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'room']
        }
      ]
    });

    res.status(201).json({
      message: `Check-in successful (${status})`,
      attendance: attendanceWithDetails
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение посещаемости по мероприятию
exports.getAttendanceByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Проверка прав для organizer
    if (req.user.role === 'organizer' && event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attendances = await Attendance.findAll({
      where: { eventId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'faculty', 'group']
      }],
      order: [['checkinTime', 'ASC']]
    });

    res.json({
      event: {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate
      },
      totalAttendees: attendances.length,
      attendances
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение посещаемости студента
exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { userId } = req.params;

    // Студенты могут смотреть только свою посещаемость
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const attendances = await Attendance.findAll({
      where: { userId },
      include: [{
        model: Event,
        as: 'event',
        attributes: ['id', 'title', 'type', 'startDate', 'endDate', 'room', 'faculty']
      }],
      order: [['checkinTime', 'DESC']]
    });

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        group: user.group
      },
      totalAttended: attendances.length,
      attendances
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Удаление записи посещаемости (админ/организатор)
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByPk(id, {
      include: [{ model: Event, as: 'event' }]
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Проверка прав
    if (req.user.role === 'organizer' && 
        attendance.event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await attendance.destroy();

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Обновление статуса посещаемости
exports.updateAttendanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const attendance = await Attendance.findByPk(id, {
      include: [{ model: Event, as: 'event' }]
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Проверка прав
    if (req.user.role === 'organizer' && 
        attendance.event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await attendance.update({ status, notes });

    res.json({
      message: 'Attendance status updated',
      attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
