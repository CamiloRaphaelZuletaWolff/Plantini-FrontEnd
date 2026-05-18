import { useState, useEffect, useRef } from 'react';

import { calculateDistance, estimateTravelTime } from '../../utils/locationUtils';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

interface RouteData {
  polyline: Coordinate[];
  distance: number; // en kilómetros
  duration: number; // en minutos
  steps: RouteStep[];
}

interface UseRouteCalculationReturn {
  route: RouteData | null;
  loading: boolean;
  error: string | null;
}

type TravelMode = 'walking' | 'driving' | 'transit';

export function useRouteCalculation(
  startCoords: Coordinate | null,
  endCoords: Coordinate | null,
  mode: TravelMode = 'walking'
): UseRouteCalculationReturn {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar refs para evitar re-renders innecesarios
  const prevCoordsRef = useRef<{
    start: string;
    end: string;
    mode: string;
  } | null>(null);

  useEffect(() => {
    if (!startCoords || !endCoords) {
      setRoute(null);
      setLoading(false);
      return;
    }

    // Crear un string único de las coordenadas para comparación
    const coordsKey = `${startCoords.latitude},${startCoords.longitude}-${endCoords.latitude},${endCoords.longitude}-${mode}`;
    
    // Evitar recalcular si las coordenadas no han cambiado
    if (prevCoordsRef.current?.start === `${startCoords.latitude},${startCoords.longitude}` &&
        prevCoordsRef.current?.end === `${endCoords.latitude},${endCoords.longitude}` &&
        prevCoordsRef.current?.mode === mode) {
      return;
    }

    // Actualizar ref
    prevCoordsRef.current = {
      start: `${startCoords.latitude},${startCoords.longitude}`,
      end: `${endCoords.latitude},${endCoords.longitude}`,
      mode,
    };

    setLoading(true);
    setError(null);

    try {
      // Calcular distancia directa usando Haversine
      const distance = calculateDistance(
        startCoords.latitude,
        startCoords.longitude,
        endCoords.latitude,
        endCoords.longitude
      );

      // Estimar tiempo de viaje
      const duration = estimateTravelTime(distance, mode);

      // Crear polyline simple (línea recta entre dos puntos)
      const polyline: Coordinate[] = [
        {
          latitude: startCoords.latitude,
          longitude: startCoords.longitude,
        },
        {
          latitude: endCoords.latitude,
          longitude: endCoords.longitude,
        },
      ];

      // Crear paso simple
      const steps: RouteStep[] = [
        {
          instruction: `Dirigirse hacia el destino`,
          distance,
          duration,
        },
      ];

      setRoute({
        polyline,
        distance,
        duration,
        steps,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Error al calcular la ruta');
      setLoading(false);
    }
  }, [startCoords?.latitude, startCoords?.longitude, endCoords?.latitude, endCoords?.longitude, mode]);

  return {
    route,
    loading,
    error,
  };
}

// Nota: Para una implementación más completa con rutas turn-by-turn,
// se recomienda integrar Google Directions API o Mapbox Directions API
// Ejemplo de llamada a Google Directions API:
/*
const fetchGoogleDirections = async (
  startCoords: Coordinate,
  endCoords: Coordinate,
  mode: TravelMode,
  apiKey: string
) => {
  const modeMap = {
    walking: 'walking',
    driving: 'driving',
    transit: 'transit',
  };

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.latitude},${startCoords.longitude}&destination=${endCoords.latitude},${endCoords.longitude}&mode=${modeMap[mode]}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(data.error_message || 'Error fetching directions');
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  // Decodificar polyline
  const polyline = decodePolyline(route.overview_polyline.points);

  return {
    polyline,
    distance: leg.distance.value / 1000, // convertir a km
    duration: leg.duration.value / 60, // convertir a minutos
    steps: leg.steps.map((step: any) => ({
      instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
      distance: step.distance.value / 1000,
      duration: step.duration.value / 60,
    })),
  };
};
*/
