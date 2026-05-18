/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del primer punto
 * @param lon1 Longitud del primer punto
 * @param lat2 Latitud del segundo punto
 * @param lon2 Longitud del segundo punto
 * @returns Distancia en kilómetros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Redondear a 1 decimal
}

/**
 * Convierte grados a radianes
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Formatea una distancia en kilómetros a un string legible
 * @param km Distancia en kilómetros
 * @returns String formateado (ej: "500 m" o "2.5 km")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Estima el tiempo de viaje basado en la distancia y modo de transporte
 * @param km Distancia en kilómetros
 * @param mode Modo de transporte: 'walking', 'driving', o 'transit'
 * @returns Tiempo estimado en minutos
 */
export function estimateTravelTime(
  km: number,
  mode: 'walking' | 'driving' | 'transit' = 'walking'
): number {
  const speeds = {
    walking: 5, // km/h
    driving: 30, // km/h (considerando tráfico urbano)
    transit: 20, // km/h
  };
  
  const speed = speeds[mode];
  const hours = km / speed;
  const minutes = Math.round(hours * 60);
  
  return minutes;
}

/**
 * Formatea un tiempo en minutos a un string legible
 * @param minutes Tiempo en minutos
 * @returns String formateado (ej: "45 min" o "1 h 30 min")
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  
  return `${hours} h ${remainingMinutes} min`;
}

/**
 * Calcula el bearing (dirección) entre dos puntos
 * Útil para rotar marcadores según dirección
 * @returns Ángulo en grados (0-360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  
  return bearing;
}
