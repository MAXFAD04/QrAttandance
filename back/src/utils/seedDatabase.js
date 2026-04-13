const { User, Event } = require('../models');
const { generateQRCode } = require('./qrGenerator');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Создание админа
    const admin = await User.create({
      email: 'admin@university.edu',
      password: 'admin123',
      fullName: 'Иван Админов',
      role: 'admin',
      faculty: 'IT',
      group: 'Admin'
    });
    console.log('✅ Admin created:', admin.email);

    // Создание организатора
    const organizer = await User.create({
      email: 'organizer@university.edu',
      password: 'organizer123',
      fullName: 'Мария Организаторова',
      role: 'organizer',
      faculty: 'IT',
      group: 'ИВТ-Org'
    });
    console.log('✅ Organizer created:', organizer.email);

    // Создание студентов
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const student = await User.create({
        email: `student${i}@university.edu`,
        password: 'student123',
        fullName: `Студент ${i}`,
        role: 'student',
        faculty: 'IT',
        group: `ИВТ-4${i}`
      });

      // Генерация персонального QR
      const qrCode = await generateQRCode({
        type: 'student',
        userId: student.id,
        email: student.email
      });
      await student.update({ studentQrCode: qrCode });

      students.push(student);
      console.log(`✅ Student created: ${student.email}`);
    }

    // Создание тестовых мероприятий
    const event1 = await Event.create({
      title: 'Лекция по веб-разработке',
      description: 'Введение в Express.js и REST API',
      type: 'lecture',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // завтра
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 часа
      room: 'Ауд. 305',
      faculty: 'IT',
      group: 'ИВТ-41',
      organizerId: organizer.id,
      status: 'published',
      maxAttendees: 30
    });

    const qr1 = await generateQRCode({
      type: 'event',
      eventId: event1.id,
      title: event1.title
    });
    await event1.update({ eventQrCode: qr1 });
    console.log('✅ Event 1 created:', event1.title);

    const event2 = await Event.create({
      title: 'Семинар по базам данных',
      description: 'PostgreSQL и Sequelize ORM',
      type: 'seminar',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000),
      room: 'Ауд. 210',
      faculty: 'IT',
      group: 'ИВТ-42',
      organizerId: organizer.id,
      status: 'published',
      maxAttendees: 25
    });

    const qr2 = await generateQRCode({
      type: 'event',
      eventId: event2.id,
      title: event2.title
    });
    await event2.update({ eventQrCode: qr2 });
    console.log('✅ Event 2 created:', event2.title);

    console.log('\n✅ Database seeding completed!\n');
    console.log('📋 Test accounts:');
    console.log('Admin: admin@university.edu / admin123');
    console.log('Organizer: organizer@university.edu / organizer123');
    console.log('Student: student1@university.edu / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Запуск при вызове напрямую
if (require.main === module) {
  const { syncDatabase } = require('../models');
  syncDatabase().then(() => seedDatabase());
}

module.exports = seedDatabase;
