const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'organizer', 'student'),
      allowNull: false,
      defaultValue: 'student'
    },
    faculty: {
      type: DataTypes.STRING,
      allowNull: true
    },
    group: {
      type: DataTypes.STRING,
      allowNull: true
    },
    studentQrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Personal QR code data for student'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  // Хеширование пароля перед сохранением
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Метод для проверки пароля
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // Метод для получения безопасных данных пользователя
  User.prototype.toSafeObject = function() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
      faculty: this.faculty,
      group: this.group,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  };

  return User;
};
