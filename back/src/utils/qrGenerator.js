const { v4: uuidv4 } = require('uuid');


exports.generateQRCode = async (data) => {
  try {
    const qrData = {
      id: uuidv4(),
      type: data.type,
      timestamp: new Date().toISOString(),
      ...(data.eventId && { eventId: data.eventId }),
      ...(data.userId && { userId: data.userId }),
      ...(data.email && { email: data.email }),
      ...(data.title && { title: data.title }),
      ...(data.token && { token: data.token })
    };

    return JSON.stringify(qrData);
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/** Старые записи в БД: PNG в виде data URL вместо JSON */
exports.isLegacyRasterQrPayload = (value) =>
  typeof value === 'string' && value.startsWith('data:image');

/**
 * Декодирование QR-кода (если нужно на сервере)
 */
exports.decodeQRCode = (qrString) => {
  try {
    return JSON.parse(qrString);
  } catch (error) {
    throw new Error('Invalid QR code format');
  }
};
