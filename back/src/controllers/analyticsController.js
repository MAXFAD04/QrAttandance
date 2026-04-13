const { Attendance, Event, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Общая статистика для админ-панели
exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate, faculty, group } = req.query;

    const where = {};
    const eventWhere = {};

    // Фильтр по датам
    if (startDate || endDate) {
      eventWhere.startDate = {};
      if (startDate) eventWhere.startDate[Op.gte] = new Date(startDate);
      if (endDate) eventWhere.startDate[Op.lte] = new Date(endDate);
    }

    // Фильтр по факультету/группе
    if (faculty) eventWhere.faculty = faculty;
    if (group) eventWhere.group = group;

    // Для organizer - только свои мероприятия
    if (req.user.role === 'organizer') {
      eventWhere.organizerId = req.user.id;
    }

    // Получение events для подсчёта
    const events = await Event.findAll({
      where: eventWhere,
      attributes: ['id']
    });
    const eventIds = events.map(e => e.id);

    // Общее количество мероприятий
    const totalEvents = events.length;

    // Уникальные участники
    const uniqueParticipants = await Attendance.count({
      where: { eventId: { [Op.in]: eventIds } },
      distinct: true,
      col: 'userId'
    });

    // Всего отметок посещаемости
    const totalAttendances = await Attendance.count({
      where: { eventId: { [Op.in]: eventIds } }
    });

    // Средний процент посещаемости
    let avgAttendanceRate = 0;
    if (totalEvents > 0) {
      avgAttendanceRate = ((totalAttendances / totalEvents) / uniqueParticipants * 100).toFixed(2);
    }

    // Мероприятия с низкой посещаемостью (<50%)
    const eventsWithLowAttendance = await Event.findAll({
      where: eventWhere,
      include: [{
        model: Attendance,
        as: 'attendances',
        attributes: []
      }],
      attributes: [
        'id',
        'title',
        [sequelize.fn('COUNT', sequelize.col('attendances.id')), 'attendeeCount']
      ],
      group: ['Event.id'],
      having: sequelize.where(
        sequelize.fn('COUNT', sequelize.col('attendances.id')),
        { [Op.lt]: sequelize.literal('Event.maxAttendees * 0.5') }
      )
    });

    res.json({
      stats: {
        totalEvents,
        uniqueParticipants,
        avgAttendanceRate: parseFloat(avgAttendanceRate),
        lowAttendanceEvents: eventsWithLowAttendance.length
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Аналитика посещаемости студентов
exports.getStudentAttendanceAnalytics = async (req, res) => {
  try {
    const {
      faculty,
      group,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const userWhere = {};
    const eventWhere = {};

    if (faculty) userWhere.faculty = faculty;
    if (group) userWhere.group = group;

    if (startDate || endDate) {
      eventWhere.startDate = {};
      if (startDate) eventWhere.startDate[Op.gte] = new Date(startDate);
      if (endDate) eventWhere.startDate[Op.lte] = new Date(endDate);
    }

    // Для organizer - только свои мероприятия
    if (req.user.role === 'organizer') {
      eventWhere.organizerId = req.user.id;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Получаем студентов с их посещаемостью
    const students = await User.findAll({
      where: { ...userWhere, role: 'student' },
      attributes: [
        'id',
        'fullName',
        'email',
        'faculty',
        'group'
      ],
      include: [{
        model: Attendance,
        as: 'attendances',
        attributes: ['id', 'eventId', 'status'],
        include: [{
          model: Event,
          as: 'event',
          where: eventWhere,
          attributes: []
        }]
      }],
      limit: parseInt(limit),
      offset
    });

    // Общее количество мероприятий за период
    const totalEventsInPeriod = await Event.count({ where: eventWhere });

    const studentsWithStats = students.map(student => {
      const studentJson = student.toJSON();
      const attendedCount = studentJson.attendances.length;
      const attendanceRate = totalEventsInPeriod > 0
        ? ((attendedCount / totalEventsInPeriod) * 100).toFixed(2)
        : 0;

      return {
        id: studentJson.id,
        fullName: studentJson.fullName,
        email: studentJson.email,
        faculty: studentJson.faculty,
        group: studentJson.group,
        attendedEvents: attendedCount,
        totalEvents: totalEventsInPeriod,
        attendanceRate: parseFloat(attendanceRate)
      };
    });

    res.json({
      students: studentsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Аналитика по мероприятиям (график посещаемости)
exports.getEventAttendanceTrends = async (req, res) => {
  try {
    const { startDate, endDate, faculty, type } = req.query;

    const where = {};

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate[Op.gte] = new Date(startDate);
      if (endDate) where.startDate[Op.lte] = new Date(endDate);
    }

    if (faculty) where.faculty = faculty;
    if (type) where.type = type;

    if (req.user.role === 'organizer') {
      where.organizerId = req.user.id;
    }

    const events = await Event.findAll({
      where,
      include: [{
        model: Attendance,
        as: 'attendances',
        attributes: []
      }],
      attributes: [
        'id',
        'title',
        'startDate',
        'type',
        'maxAttendees',
        [sequelize.fn('COUNT', sequelize.col('attendances.id')), 'attendeeCount']
      ],
      group: ['Event.id'],
      order: [['startDate', 'ASC']]
    });

    const trends = events.map(event => {
      const eventJson = event.toJSON();
      const attendanceRate = event.maxAttendees
        ? ((eventJson.attendeeCount / event.maxAttendees) * 100).toFixed(2)
        : 'N/A';

      return {
        id: event.id,
        title: event.title,
        date: event.startDate,
        type: event.type,
        attendees: parseInt(eventJson.attendeeCount),
        maxAttendees: event.maxAttendees,
        attendanceRate: attendanceRate !== 'N/A' ? parseFloat(attendanceRate) : null
      };
    });

    res.json({ trends });
  } catch (error) {
    console.error('Event trends error:', error);
    res.status(500).json({ error: error.message });
  }
};
