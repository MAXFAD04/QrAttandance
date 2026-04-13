require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const attendanceRoutes = require('./routes/attendance');
const usersRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Отключаем ETag/conditional GET, чтобы эндпоинт `GET /api/auth/me`
// не мог отвечать 304 Not Modified и ломать получение JSON на фронте.
app.disable('etag');

// Запрещаем кэширование для API, чтобы браузер не возвращал 304
// и не подсовывал пустые тела ответов фронту.
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.removeHeader('ETag');
  next();
});

// Security middleware
app.use(helmet());

// CORS: в development разрешаем любой origin (удобно для открытия фронта с телефона по LAN);
// в production — только FRONTEND_URL.
const corsOrigin =
  process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'http://localhost:3000')
    : true;

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    message: 'QR Attendance System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      attendance: '/api/attendance',
      users: '/api/users',
      analytics: '/api/analytics'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
