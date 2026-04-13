const sequelize = require('../config/database');
const UserModel = require('./User');
const EventModel = require('./Event');
const AttendanceModel = require('./Attendance');

// Инициализация моделей
const User = UserModel(sequelize);
const Event = EventModel(sequelize);
const Attendance = AttendanceModel(sequelize);

// Определение связей
User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

User.hasMany(Attendance, { foreignKey: 'userId', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Event.hasMany(Attendance, { foreignKey: 'eventId', as: 'attendances' });
Attendance.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Синхронизация с БД
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // В development режиме пересоздаём таблицы при изменениях
    if (process.env.NODE_ENV === 'development') {
     //await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized (alter mode).');
    } else {
      await sequelize.sync();
      console.log('✅ Database synchronized.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Event,
  Attendance,
  syncDatabase
};
