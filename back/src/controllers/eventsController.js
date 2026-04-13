const { Event, User, Attendance } = require('../models');
const { Op } = require('sequelize');
const { generateQRCode, isLegacyRasterQrPayload } = require('../utils/qrGenerator');
const { addHours } = require('date-fns');
const { getCurrentToken, getTimeUntilRotation, QR_TOKEN_LIFETIME_MS } = require('../utils/qrTokenStore');
const { resolvePublishedLifecycleStatus } = require('../utils/eventLifecycleStatus');

// Создание мероприятия
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      room,
      faculty,
      group,
      attendanceModel,
      allowLateCheckin,
      requireAuth,
      maxAttendees
    } = req.body;

    // Проверка дат
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Создание мероприятия
    const event = await Event.create({
      title,
      description,
      type,
      startDate,
      endDate,
      room,
      faculty,
      group,
      organizerId: req.user.id,
      attendanceModel: attendanceModel || 'event_qr',
      allowLateCheckin: allowLateCheckin || false,
      requireAuth: requireAuth !== undefined ? requireAuth : true,
      status: 'draft',
      maxAttendees
    });

    // Генерация QR-кода для мероприятия
    const qrExpiry = addHours(new Date(endDate), parseInt(process.env.QR_EXPIRY_HOURS) || 24);
    const qrCodeData = await generateQRCode({
      type: 'event',
      eventId: event.id,
      title: event.title
    });

    await event.update({
      eventQrCode: qrCodeData,
      qrExpiry
    });

    // Загрузка с организатором
    const eventWithOrganizer = await Event.findByPk(event.id, {
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    res.status(201).json({
      message: 'Event created successfully',
      event: eventWithOrganizer
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение всех мероприятий (с фильтрами)
exports.getEvents = async (req, res) => {
  try {
    const {
      type,
      status,
      faculty,
      group,
      startDate,
      endDate,
      organizerId,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    // Фильтры
    if (type) where.type = type;

    const now = new Date();
    if (status === 'ongoing') {
      where.status = 'published';
      where.startDate = { [Op.lte]: now };
      where.endDate = { [Op.gte]: now };
    } else if (status === 'completed') {
      where[Op.or] = [
        { status: 'completed' },
        {
          status: 'published',
          endDate: { [Op.lt]: now }
        }
      ];
    } else if (status) {
      where.status = status;
    }
    if (faculty) where.faculty = faculty;
    if (group) where.group = group;
    if (organizerId) where.organizerId = organizerId;

    // Фильтр по датам
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate[Op.gte] = new Date(startDate);
      if (endDate) where.startDate[Op.lte] = new Date(endDate);
    }

    // Для organizer - только свои мероприятия
    if (req.user.role === 'organizer') {
      where.organizerId = req.user.id;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Attendance,
          as: 'attendances',
          attributes: ['id']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['startDate', 'DESC']]
    });

    // Добавление статистики посещаемости
    const eventsWithStats = events.map(event => {
      const eventJson = event.toJSON();
      const totalAttendees = event.attendances.length;

      return {
        ...eventJson,
        status: resolvePublishedLifecycleStatus(eventJson),
        attendanceStats: {
          registered: totalAttendees,
          attendanceRate: event.maxAttendees 
            ? ((totalAttendees / event.maxAttendees) * 100).toFixed(2)
            : 'N/A'
        }
      };
    });

    res.json({
      events: eventsWithStats,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение одного мероприятия
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'fullName', 'email', 'faculty']
        },
        {
          model: Attendance,
          as: 'attendances',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'group']
          }]
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Проверка прав доступа для organizer
    if (req.user.role === 'organizer' && event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this event' });
    }

    const eventPlain = event.get({ plain: true });
    eventPlain.status = resolvePublishedLifecycleStatus(eventPlain);

    res.json({ event: eventPlain });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновление мероприятия
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Проверка прав: только организатор или админ
    if (req.user.role !== 'admin' && event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to update this event' });
    }

    // Проверка дат при обновлении
    if (updates.startDate && updates.endDate) {
      if (new Date(updates.startDate) >= new Date(updates.endDate)) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    await event.update(updates);

    // Если изменили endDate, обновляем qrExpiry
    if (updates.endDate) {
      const qrExpiry = addHours(
        new Date(updates.endDate), 
        parseInt(process.env.QR_EXPIRY_HOURS) || 24
      );
      await event.update({ qrExpiry });
    }

    const updatedEvent = await Event.findByPk(id, {
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    const updatedPlain = updatedEvent.get({ plain: true });
    updatedPlain.status = resolvePublishedLifecycleStatus(updatedPlain);

    res.json({
      message: 'Event updated successfully',
      event: updatedPlain
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Удаление мероприятия
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Проверка прав
    if (req.user.role !== 'admin' && event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to delete this event' });
    }

    await event.destroy();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Публикация мероприятия
exports.publishEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await event.update({ status: 'published' });
    await event.reload();

    const publishedPlain = event.get({ plain: true });
    publishedPlain.status = resolvePublishedLifecycleStatus(publishedPlain);

    res.json({
      message: 'Event published successfully',
      event: publishedPlain
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение QR-кода мероприятия
exports.getEventQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Старый формат: PNG data URL не помещается в клиентский QR — заменяем на JSON
    if (!event.eventQrCode || isLegacyRasterQrPayload(event.eventQrCode)) {
      const qrExpiry =
        event.qrExpiry && new Date() <= new Date(event.qrExpiry)
          ? event.qrExpiry
          : addHours(new Date(), parseInt(process.env.QR_EXPIRY_HOURS) || 24);
      const qrCodeData = await generateQRCode({
        type: 'event',
        eventId: event.id,
        title: event.title
      });
      await event.update({ eventQrCode: qrCodeData, qrExpiry });
      return res.json({ qrCode: qrCodeData, expiry: qrExpiry });
    }

    // Проверка срока действия QR
    if (event.qrExpiry && new Date() > new Date(event.qrExpiry)) {
      // Перегенерация QR
      const qrExpiry = addHours(new Date(), parseInt(process.env.QR_EXPIRY_HOURS) || 24);
      const qrCodeData = await generateQRCode({
        type: 'event',
        eventId: event.id,
        title: event.title
      });

      await event.update({
        eventQrCode: qrCodeData,
        qrExpiry
      });

      return res.json({
        qrCode: qrCodeData,
        expiry: qrExpiry
      });
    }

    res.json({
      qrCode: event.eventQrCode,
      expiry: event.qrExpiry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение ротируемого QR-кода (меняется каждые 10 сек)
exports.getRotatingQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (req.user.role === 'organizer' && event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tokenEntry = getCurrentToken(id);

    const qrPayload = await generateQRCode({
      type: 'event',
      eventId: event.id,
      token: tokenEntry.currentToken,
    });

    const expiresIn = getTimeUntilRotation(id);

    res.json({
      qrCode: qrPayload,
      token: tokenEntry.currentToken,
      expiresIn,
      lifetimeMs: QR_TOKEN_LIFETIME_MS,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
