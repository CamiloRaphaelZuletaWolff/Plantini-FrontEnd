/** Generates a unique id, preferring `uuid` and falling back to a time+random id. */
export function makeId(): string {
  try {
    // `uuid` needs `react-native-get-random-values` (polyfilled at app entry).
    const uuid = require('uuid');
    if (uuid && typeof uuid.v4 === 'function') return uuid.v4();
  } catch {
    // fall through to the lightweight fallback
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
