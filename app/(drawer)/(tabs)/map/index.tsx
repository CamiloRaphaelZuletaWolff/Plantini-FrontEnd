import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import {
  CustomMarker,
  MapFilters,
  LocationPermissionModal,
} from '../../../../src/components';
import {
  useThemeColors,
  useOportunidades,
  useUserLocation,
  useOportunidadesConDistancia,
} from '../../../../src/hooks';
import { useOportunidadesStore } from '../../../../src/store/oportunidadesStore';
import { CategoriaType } from '../../../../src/types';
import { LA_PAZ_COORDINATES } from '../../../../src/utils/mapHelpers';

export default function MapaGeneralScreen() {
  const { colors } = useThemeColors();
  const mapRef = useRef<MapView>(null);

  // Estados
  const [selectedOportunidadId, setSelectedOportunidadId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Hooks
  const { location, loading: locationLoading, hasPermission, requestPermission } = useUserLocation();
  const { oportunidades, loading: oportunidadesLoading } = useOportunidades();

  // Store de filtros
  const {
    filtros,
    setFiltros,
  } = useOportunidadesStore();

  const selectedCategories = filtros.categoria || [];
  const selectedCampus = filtros.campus || [];
  const showOnlyCercanas = filtros.distancia === '5km';

  // Oportunidades con distancia
  const { oportunidades: oportunidadesConDistancia } = useOportunidadesConDistancia(
    oportunidades,
    location,
    showOnlyCercanas ? 5 : undefined
  );

  // Región inicial del mapa
  const [region, setRegion] = useState<Region>({
    latitude: location?.latitude || LA_PAZ_COORDINATES.latitude,
    longitude: location?.longitude || LA_PAZ_COORDINATES.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Actualizar región cuando cambia la ubicación
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        400
      );
    }
  }, [location]);

  // Mostrar modal de permisos si no están concedidos
  useEffect(() => {
    if (!hasPermission && !locationLoading) {
      setTimeout(() => setShowPermissionModal(true), 1000);
    }
  }, [hasPermission, locationLoading]);

  // Handlers
  const handleMarkerPress = (oportunidadId: string, lat: number, lng: number) => {
    setSelectedOportunidadId(oportunidadId);
    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      400
    );
  };

  const handleRecenter = async () => {
    await requestPermission();
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        400
      );
    }
  };

  const handleMapPress = () => {
    setSelectedOportunidadId(null);
    if (showFilters) {
      setShowFilters(false);
    }
  };

  const handleCategoryToggle = (categoria: CategoriaType) => {
    const newCategories = selectedCategories.includes(categoria)
      ? selectedCategories.filter((c: CategoriaType) => c !== categoria)
      : [...selectedCategories, categoria];
    setFiltros({ categoria: newCategories });
  };

  const handleCampusToggle = (campus: string) => {
    const newCampus = selectedCampus.includes(campus)
      ? selectedCampus.filter((c: string) => c !== campus)
      : [...selectedCampus, campus];
    setFiltros({ campus: newCampus });
  };

  const handleCercanasToggle = () => {
    setFiltros({ distancia: showOnlyCercanas ? undefined : '5km' });
  };

  const handleClearFilters = () => {
    setFiltros({ categoria: [], campus: [], distancia: undefined });
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedCampus.length +
    (showOnlyCercanas ? 1 : 0);

  // Oportunidades con ubicación para renderizar en el mapa
  const oportunidadesParaMapa = oportunidadesConDistancia.filter(
    (op) => op.ubicacion?.lat && op.ubicacion?.lng
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? undefined : PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={handleMapPress}
        onRegionChangeComplete={setRegion}
      >
        {/* Marcadores */}
        {oportunidadesParaMapa.map((oportunidad) => {
          const isSelected = selectedOportunidadId === oportunidad.id;
          
          return (
            <CustomMarker
              key={oportunidad.id}
              oportunidad={oportunidad}
              selected={isSelected}
              distanciaFormateada={oportunidad.distanciaFormateada}
              onPress={() =>
                handleMarkerPress(
                  oportunidad.id,
                  oportunidad.ubicacion!.lat,
                  oportunidad.ubicacion!.lng
                )
              }
            />
          );
        })}
      </MapView>

      {/* Indicador de carga */}
      {(locationLoading || oportunidadesLoading) && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              {locationLoading ? 'Obteniendo ubicación...' : 'Cargando oportunidades...'}
            </Text>
          </View>
        </View>
      )}

      {/* Filtros */}
      {showFilters && (
        <MapFilters
          selectedCategories={selectedCategories}
          selectedCampus={selectedCampus}
          showOnlyCercanas={showOnlyCercanas}
          onCategoryToggle={handleCategoryToggle}
          onCampusToggle={handleCampusToggle}
          onCercanasToggle={handleCercanasToggle}
          onClear={handleClearFilters}
          activeCount={activeFilterCount}
        />
      )}

      {/* Botón de filtros */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: colors.surface },
          activeFilterCount > 0 && { borderWidth: 2, borderColor: colors.primary },
        ]}
        onPress={() => setShowFilters(!showFilters)}
        activeOpacity={0.8}
      >
        <Ionicons name="filter" size={24} color={colors.primary} />
        {activeFilterCount > 0 && (
          <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Botón de recentrar */}
      <TouchableOpacity
        style={[styles.recenterButton, { backgroundColor: colors.surface }]}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Modal de permisos */}
      <LocationPermissionModal
        visible={showPermissionModal}
        onRequestPermission={async () => {
          setShowPermissionModal(false);
          await requestPermission();
        }}
        onCancel={() => setShowPermissionModal(false)}
      />
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    position: 'absolute',
    top: 170,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
