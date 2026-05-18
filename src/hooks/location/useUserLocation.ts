import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LA_PAZ_COORDINATES } from '../../utils/mapHelpers';

const LOCATION_STORAGE_KEY = '@voluntariado_last_location';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface UseUserLocationReturn {
  location: LocationCoords | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
  watchLocation: () => Promise<void>;
  recenterToUser: () => Promise<void>;
}

export function useUserLocation(): UseUserLocationReturn {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const mountedRef = useRef(true);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  const safeSetLocation = (v: LocationCoords | null) => {
    if (mountedRef.current) setLocation(v);
  };
  const safeSetLoading = (v: boolean) => {
    if (mountedRef.current) setLoading(v);
  };
  const safeSetError = (v: string | null) => {
    if (mountedRef.current) setError(v);
  };
  const safeSetHasPermission = (v: boolean) => {
    if (mountedRef.current) setHasPermission(v);
  };

  const loadLastLocation = useCallback(async () => {
    try {
      const lastLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (lastLocation) {
        const parsed = JSON.parse(lastLocation) as LocationCoords;
        safeSetLocation(parsed);
        return true;
      }
    } catch (err) {
      if (__DEV__) console.error('Error loading last location:', err);
    }
    return false;
  }, []);

  const saveLocation = useCallback(async (coords: LocationCoords) => {
    try {
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
    } catch (err) {
      if (__DEV__) console.error('Error saving location:', err);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      safeSetLoading(true);
      safeSetError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        safeSetHasPermission(false);
        safeSetError('Permisos de ubicación denegados');

        const hasLastLocation = await loadLastLocation();
        if (!hasLastLocation) {
          safeSetLocation(LA_PAZ_COORDINATES);
        }

        safeSetLoading(false);
        return;
      }

      safeSetHasPermission(true);

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      safeSetLocation(coords);
      await saveLocation(coords);
      safeSetLoading(false);
    } catch (err) {
      if (__DEV__) console.error('Error requesting location permission:', err);
      safeSetError('Error al obtener ubicación');

      const hasLastLocation = await loadLastLocation();
      if (!hasLastLocation) {
        safeSetLocation(LA_PAZ_COORDINATES);
      }

      safeSetLoading(false);
    }
  }, [loadLastLocation, saveLocation]);

  const watchLocation = useCallback(async () => {
    // Idempotent: skip if there is already an active watcher.
    if (watcherRef.current) return;

    if (!hasPermission) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        safeSetError('No hay permisos para seguir la ubicación');
        return;
      }
      safeSetHasPermission(true);
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 100,
        },
        (newLocation) => {
          if (!mountedRef.current) return;
          const coords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          safeSetLocation(coords);
          saveLocation(coords);
        }
      );

      if (!mountedRef.current) {
        // Component unmounted between request and resolution.
        subscription.remove();
        return;
      }

      watcherRef.current = subscription;
    } catch (err) {
      if (__DEV__) console.error('Error watching location:', err);
    }
  }, [hasPermission, saveLocation]);

  const recenterToUser = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    mountedRef.current = true;
    requestPermission();
    return () => {
      mountedRef.current = false;
      watcherRef.current?.remove();
      watcherRef.current = null;
    };
    // requestPermission is intentionally omitted — we only want the initial
    // permission request to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    location,
    loading,
    error,
    hasPermission,
    requestPermission,
    watchLocation,
    recenterToUser,
  };
}
