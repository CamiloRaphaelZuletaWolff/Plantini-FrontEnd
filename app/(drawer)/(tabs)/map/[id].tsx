import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../../config/supabase';
import { useThemeColors, useUserLocation, useRouteCalculation } from '../../../../src/hooks';
import { Oportunidad } from '../../../../src/types';
import { getRegionForCoordinates, openNativeMaps } from '../../../../src/utils/mapHelpers';
import { formatDistance, formatTravelTime } from '../../../../src/utils/locationUtils';

type TravelMode = 'walking' | 'driving' | 'transit';

export default function RutaScreen() {
  const { colors } = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mapRef = useRef<MapView>(null);

  // Estados
  const [oportunidad, setOportunidad] = useState<Oportunidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');

  // Hooks
  const { location: userLocation } = useUserLocation();

  // Obtener oportunidad
  useEffect(() => {
    const fetchOportunidad = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('oportunidades')
          .select('id, titulo, descripcion, campus, ciudad, ubicacion, status, deadline, categoria, modalidad, horas_semana')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          const row = data as any;
          const opp: Oportunidad = {
            id: row.id,
            titulo: row.titulo,
            titleLower: '',
            descripcion: row.descripcion,
            organizacion: '',
            organizacionId: '',
            campus: row.campus,
            ciudad: row.ciudad,
            categoria: row.categoria,
            modalidad: row.modalidad,
            horasSemana: row.horas_semana,
            deadline: row.deadline,
            cupos: 0,
            cuposDisponibles: 0,
            ubicacion: row.ubicacion,
            habilidades: [],
            status: row.status,
            createdAt: '',
            updatedAt: '',
            createdBy: '',
          };
          if (!opp.ubicacion?.lat || !opp.ubicacion?.lng) {
            setError('Esta oportunidad no tiene ubicación definida');
          } else {
            setOportunidad(opp);
          }
        } else {
          setError('Oportunidad no encontrada');
        }
      } catch (err) {
        console.error('Error fetching oportunidad:', err);
        setError('Error al cargar la oportunidad');
      } finally {
        setLoading(false);
      }
    };

    fetchOportunidad();
  }, [id]);

  // Calcular ruta
  const { route, loading: routeLoading } = useRouteCalculation(
    userLocation,
    oportunidad?.ubicacion
      ? {
          latitude: oportunidad.ubicacion.lat,
          longitude: oportunidad.ubicacion.lng,
        }
      : null,
    travelMode
  );

  // Ajustar vista del mapa cuando la ruta esté lista
  useEffect(() => {
    if (route && mapRef.current) {
      const region = getRegionForCoordinates(route.polyline);
      mapRef.current.animateToRegion(region, 400);
    }
  }, [route]);

  // Handlers
  const handleIniciarNavegacion = async () => {
    if (!oportunidad?.ubicacion) return;

    console.log('🗺️ Opening maps from route screen...');
    console.log('📍 Coordinates:', { lat: oportunidad.ubicacion.lat, lng: oportunidad.ubicacion.lng });
    console.log('📱 Platform:', Platform.OS);

    const success = await openNativeMaps(
      oportunidad.ubicacion.lat,
      oportunidad.ubicacion.lng,
      oportunidad.titulo
    );

    if (!success) {
      Alert.alert(
        'Error',
        'No se pudo abrir la aplicación de mapas. Verifica que tengas una app de mapas instalada.',
        [{ text: 'OK' }]
      );
    }
  };

  const getPolylineColor = () => {
    switch (travelMode) {
      case 'walking':
        return '#FF3B30'; // Rojo vibrante
      case 'driving':
        return '#FF3B30'; // Rojo vibrante
      case 'transit':
        return '#FF3B30'; // Rojo vibrante
      default:
        return '#FF3B30'; // Rojo vibrante
    }
  };

  const getPolylinePattern = () => {
    return travelMode === 'walking' ? [1, 10] : undefined;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando ruta...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !oportunidad) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.muted} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Oportunidad no encontrada'}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Marcador de usuario */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Marcador de destino */}
        {oportunidad.ubicacion && (
          <Marker
            coordinate={{
              latitude: oportunidad.ubicacion.lat,
              longitude: oportunidad.ubicacion.lng,
            }}
            title={oportunidad.titulo}
            description={oportunidad.organizacion}
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="location" size={36} color="#FF3B30" />
            </View>
          </Marker>
        )}

        {/* Polyline de la ruta */}
        {route && (
          <Polyline
            coordinates={route.polyline}
            strokeColor={getPolylineColor()}
            strokeWidth={6}
            lineDashPattern={getPolylinePattern()}
          />
        )}
      </MapView>

      {/* Panel inferior */}
      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Encabezado */}
          <View style={styles.panelHeader}>
            <Ionicons name="navigate" size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {oportunidad.titulo}
            </Text>
          </View>

          {/* Información de la ruta */}
          {route && (
            <View style={styles.routeInfo}>
              <View style={styles.routeInfoItem}>
                <Ionicons name="navigate" size={24} color={colors.primary} />
                <View>
                  <Text style={[styles.routeInfoLabel, { color: colors.subtitle }]}>
                    Distancia
                  </Text>
                  <Text style={[styles.routeInfoValue, { color: colors.text }]}>
                    {formatDistance(route.distance)}
                  </Text>
                </View>
              </View>

              <View style={styles.routeInfoItem}>
                <Ionicons name="time" size={24} color={colors.primary} />
                <View>
                  <Text style={[styles.routeInfoLabel, { color: colors.subtitle }]}>
                    Tiempo estimado
                  </Text>
                  <Text style={[styles.routeInfoValue, { color: colors.text }]}>
                    {formatTravelTime(route.duration)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Selector de modo de transporte */}
          <View style={styles.modeSelector}>
            <Text style={[styles.modeSelectorLabel, { color: colors.text }]}>
              Modo de transporte:
            </Text>
            <View style={styles.modeButtons}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  travelMode === 'walking' && {
                    backgroundColor: `${colors.primary}20`,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setTravelMode('walking')}
              >
                <Ionicons
                  name="walk"
                  size={20}
                  color={travelMode === 'walking' ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: travelMode === 'walking' ? colors.primary : colors.muted },
                  ]}
                >
                  Caminando
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  travelMode === 'driving' && {
                    backgroundColor: `${colors.primary}20`,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setTravelMode('driving')}
              >
                <Ionicons
                  name="car"
                  size={20}
                  color={travelMode === 'driving' ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: travelMode === 'driving' ? colors.primary : colors.muted },
                  ]}
                >
                  Conduciendo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  travelMode === 'transit' && {
                    backgroundColor: `${colors.primary}20`,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setTravelMode('transit')}
              >
                <Ionicons
                  name="bus"
                  size={20}
                  color={travelMode === 'transit' ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: travelMode === 'transit' ? colors.primary : colors.muted },
                  ]}
                >
                  Transporte
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dirección */}
          {oportunidad.ubicacion?.direccion && (
            <View style={styles.addressContainer}>
              <Ionicons name="location" size={20} color={colors.subtitle} />
              <Text style={[styles.addressText, { color: colors.subtitle }]}>
                {oportunidad.ubicacion.direccion}
              </Text>
            </View>
          )}

          {/* Botones de acción */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleIniciarNavegacion}
            >
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Iniciar Navegación</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                Volver
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Indicador de carga de ruta */}
      {routeLoading && (
        <View style={styles.routeLoadingOverlay}>
          <View style={[styles.routeLoadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.routeLoadingText, { color: colors.text }]}>
              Calculando ruta...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  routeInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  routeInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeInfoLabel: {
    fontSize: 12,
  },
  routeInfoValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  modeSelector: {
    marginBottom: 16,
  },
  modeSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeLoadingOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  routeLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  routeLoadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
