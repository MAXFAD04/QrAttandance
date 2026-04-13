const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('lecture', 'seminar', 'conference', 'workshop', 'club', 'other'),
      allowNull: false,
      defaultValue: 'lecture'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    room: {
      type: DataTypes.STRING,
      allowNull: true
    },
    faculty: {
      type: DataTypes.STRING,
      allowNull: true
    },
    group: {
      type: DataTypes.STRING,
      allowNull: true
    },
    organizerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    eventQrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'QR code data for event check-in'
    },
    qrExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attendanceModel: {
      type: DataTypes.ENUM('event_qr', 'student_qr'),
      defaultValue: 'event_qr',
      comment: 'event_qr: students scan event QR, student_qr: organizer scans student QR'
    },
    allowLateCheckin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    requireAuth: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled'),
      defaultValue: 'draft'
    },
    maxAttendees: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'events',
    timestamps: true
  });

  return Event;
};
