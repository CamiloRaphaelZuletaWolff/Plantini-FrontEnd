export function makeId(): string {
  try {
    const uuid = require('uuid');
    if (uuid && typeof uuid.v4 === 'function') {
      return uuid.v4();
    }
  } catch (err) {
    // ignore and use fallback
  }

  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
