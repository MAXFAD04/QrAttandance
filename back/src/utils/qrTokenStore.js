const { v4: uuidv4 } = require('uuid');

const QR_TOKEN_LIFETIME_MS = 10_000; // 10 секунд

const store = new Map();

function rotateToken(eventId) {
  const entry = store.get(eventId);
  const newToken = uuidv4();
  const now = Date.now();

  if (entry) {
    entry.previousToken = entry.currentToken;
    entry.currentToken = newToken;
    entry.rotatedAt = now;
  } else {
    store.set(eventId, {
      currentToken: newToken,
      previousToken: null,
      rotatedAt: now,
    });
  }

  return store.get(eventId);
}

function getCurrentToken(eventId) {
  const entry = store.get(eventId);
  if (!entry) return rotateToken(eventId);

  const age = Date.now() - entry.rotatedAt;
  if (age >= QR_TOKEN_LIFETIME_MS) {
    return rotateToken(eventId);
  }

  return entry;
}

function validateToken(eventId, token) {
  const entry = store.get(eventId);
  if (!entry) return false;

  const age = Date.now() - entry.rotatedAt;
  const isCurrentValid = age < QR_TOKEN_LIFETIME_MS * 2;

  if (entry.currentToken === token && isCurrentValid) return true;
  if (entry.previousToken === token && isCurrentValid) return true;

  return false;
}

function getTimeUntilRotation(eventId) {
  const entry = store.get(eventId);
  if (!entry) return 0;

  const elapsed = Date.now() - entry.rotatedAt;
  const remaining = QR_TOKEN_LIFETIME_MS - elapsed;
  return Math.max(0, remaining);
}

function clearEvent(eventId) {
  store.delete(eventId);
}

module.exports = {
  rotateToken,
  getCurrentToken,
  validateToken,
  getTimeUntilRotation,
  clearEvent,
  QR_TOKEN_LIFETIME_MS,
};
