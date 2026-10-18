/** Formats a timestamp as a short local time (e.g. "14:32"). */
export function formatTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
