import { Region } from 'react-native-maps';
import { Platform } from 'react-native';

import { CategoriaType } from '../types';

interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calcula la región óptima para mostrar un conjunto de coordenadas
 * @param points Array de coordenadas
 * @returns Región con centro y deltas apropiados
 */
export function getRegionForCoordinates(points: Coordinate[]): Region {
  // Región predeterminada centrada en La Paz
  const defaultRegion: Region = {
    latitude: -16.5,
    longitude: -68.15,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  if (points.length === 0) {
    return defaultRegion;
  }

  // Calcular límites
  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;

  points.forEach((point) => {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  });

  // Calcular centro
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calcular deltas con padding del 50%
  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
  const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);

  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

/**
 * Obtiene el color hexadecimal para una categoría
 * @param categoria Tipo de categoría
 * @returns Color hexadecimal
 */
export function getCategoryColor(categoria: CategoriaType): string {
  const colors: Record<CategoriaType, string> = {
    social: '#FF6B6B',
    ambiental: '#51CF66',
    educativo: '#4ECDC4',
    cultural: '#AA96DA',
    salud: '#F38181',
  };

  return colors[categoria] || '#8E8E93';
}

/**
 * Genera un deeplink a la aplicación de mapas del sistema
 * @param latitude Latitud del destino
 * @param longitude Longitud del destino
 * @param label Etiqueta del destino
 * @param provider 'google' o 'apple'
 * @returns URL del deeplink
 */
export function generateMapDeeplink(
  latitude: number,
  longitude: number,
  label: string,
  provider: 'google' | 'apple' = Platform.OS === 'ios' ? 'apple' : 'google'
): string {
  const encodedLabel = encodeURIComponent(label);

  if (provider === 'apple') {
    // Apple Maps - Formato óptimo para navegación
    // Este formato abre Apple Maps con las direcciones desde la ubicación actual
    // saddr: source address (origen) - vacío para usar ubicación actual
    // daddr: destination address (destino)
    // dirflg: tipo de dirección (d=driving, w=walking, r=transit)
    return `http://maps.apple.com/?saddr=Current+Location&daddr=${latitude},${longitude}&dirflg=d`;
  }

  // Google Maps - usar el esquema correcto con API v1
  // travelmode puede ser: driving, walking, bicycling, transit
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
}

/**
 * Intenta abrir el mapa nativo con múltiples intentos de fallback
 * Esta función es más robusta y prueba diferentes esquemas de URL
 */
export async function openNativeMaps(
  latitude: number,
  longitude: number,
  label: string
): Promise<boolean> {
  const { Linking } = require('react-native');
  
  if (Platform.OS === 'ios') {
    // Intentar múltiples esquemas para iOS
    const iosUrls = [
      `maps://?ll=${latitude},${longitude}&q=${encodeURIComponent(label)}&dirflg=d`,
      `http://maps.apple.com/?saddr=Current+Location&daddr=${latitude},${longitude}&dirflg=d`,
      `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(label)}`,
    ];

    for (const url of iosUrls) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return true;
        }
      } catch (error) {
        console.log('Failed to open with URL:', url, error);
      }
    }
  } else {
    // Android - intentar Google Maps primero, luego fallback
    const androidUrls = [
      `google.navigation:q=${latitude},${longitude}`,
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
    ];

    for (const url of androidUrls) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return true;
        }
      } catch (error) {
        console.log('Failed to open with URL:', url, error);
      }
    }
  }

  // Fallback final: URL web de Google Maps (funciona en todos lados)
  try {
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    await Linking.openURL(webUrl);
    return true;
  } catch (error) {
    console.error('All map opening attempts failed:', error);
    return false;
  }
}

/**
 * Coordenadas predeterminadas de campus universitarios en Bolivia
 */
export const CAMPUS_COORDINATES: Record<string, Coordinate> = {
  'UMSA': { latitude: -16.5350, longitude: -68.0747 },
  'UCB': { latitude: -16.5061, longitude: -68.1192 },
  'EMI': { latitude: -16.5233, longitude: -68.0586 },
  'UPB': { latitude: -16.5400, longitude: -68.0500 },
  'UPSA': { latitude: -17.7964, longitude: -63.1853 },
};

/**
 * Coordenadas de La Paz (fallback)
 */
export const LA_PAZ_COORDINATES: Coordinate = {
  latitude: -16.5,
  longitude: -68.15,
};
