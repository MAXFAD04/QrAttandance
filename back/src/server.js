require('dotenv').config();
const app = require('./app');
const { syncDatabase } = require('./models');

const PORT = process.env.PORT || 5000;

// Запуск сервера
async function startServer() {
  try {
    // Синхронизация БД
    await syncDatabase();

    // Запуск сервера
    app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log(`   Server running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   API endpoint: http://localhost:${PORT}/api`);
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
