const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateQRCode } = require('../utils/qrGenerator');

// Генерация токенов
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Регистрация
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, role, faculty, group } = req.body;

    // Проверка существующего пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Создание пользователя
    const user = await User.create({
      email,
      password,
      fullName,
      role: role || 'student',
      faculty,
      group
    });

    // Генерация персонального QR для студента
    if (user.role === 'student') {
      const qrCodeData = await generateQRCode({
        type: 'student',
        userId: user.id,
        email: user.email
      });
      await user.update({ studentQrCode: qrCodeData });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    await user.update({ refreshToken });

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toSafeObject(),
      tokens: { accessToken, refreshToken }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Вход
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Проверка пароля
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Проверка активности аккаунта
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact administrator.' });
    }

    // Генерация токенов
    const { accessToken, refreshToken } = generateTokens(user.id);
    await user.update({ refreshToken });

    res.json({
      message: 'Login successful',
      user: user.toSafeObject(),
      tokens: { accessToken, refreshToken }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Обновление токена
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Верификация refresh токена
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findByPk(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Генерация новых токенов
    const tokens = generateTokens(user.id);
    await user.update({ refreshToken: tokens.refreshToken });

    res.json({
      message: 'Token refreshed successfully',
      tokens
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Выход
exports.logout = async (req, res) => {
  try {
    await req.user.update({ refreshToken: null });
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение текущего пользователя
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    // Запрещаем кэширование, чтобы фронт гарантированно получал JSON (иначе возможен 304)
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.removeHeader('ETag');

    res.json({ user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
