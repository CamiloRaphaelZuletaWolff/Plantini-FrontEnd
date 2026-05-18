import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Image, TouchableOpacity } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Oportunidad } from '../../types';
import { getCategoryColor } from '../../utils/mapHelpers';
import { CATEGORIAS } from '../../types';
import { CategoriaBadge } from '../oportunidades/CategoriaBadge';

interface CustomMarkerProps {
  oportunidad: Oportunidad;
  selected?: boolean;
  onPress?: () => void;
  distanciaFormateada?: string;
}

export function CustomMarker({ oportunidad, selected = false, onPress, distanciaFormateada }: CustomMarkerProps) {
  const selectedScaleAnim = useRef(new Animated.Value(1)).current;
  const markerRef = useRef<any>(null);

  // Animación de selección y mostrar callout
  useEffect(() => {
    Animated.spring(selectedScaleAnim, {
      toValue: selected ? 1.2 : 1,
      tension: 40,
      friction: 3,
      useNativeDriver: false,
    }).start();

    // Mostrar callout cuando se selecciona
    if (selected && markerRef.current) {
      setTimeout(() => {
        markerRef.current?.showCallout();
      }, 100);
    }
  }, [selected]);

  if (!oportunidad.ubicacion?.lat || !oportunidad.ubicacion?.lng) {
    return null;
  }

  const categoryColor = getCategoryColor(oportunidad.categoria);
  const categoria = CATEGORIAS.find((cat) => cat.key === oportunidad.categoria);
  const iconName = categoria?.icon || 'help-circle';
  const isFull = oportunidad.cuposDisponibles === 0;

  return (
    <Marker
      ref={markerRef}
      coordinate={{
        latitude: oportunidad.ubicacion.lat,
        longitude: oportunidad.ubicacion.lng,
      }}
      onPress={onPress}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 1 }}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: selectedScaleAnim }],
          },
          isFull && styles.fullOpacity,
        ]}
      >
        {/* Pin principal */}
        <View
          style={[
            styles.pin,
            {
              backgroundColor: categoryColor,
              borderColor: selected ? '#FFD700' : '#FFFFFF',
              borderWidth: selected ? 4 : 3,
              elevation: selected ? 12 : 8,
              shadowOpacity: selected ? 0.4 : 0.3,
            },
          ]}
        >
          <Ionicons name={iconName as any} size={20} color="#FFFFFF" />
        </View>

        {/* Badge de cupos */}
        {oportunidad.cuposDisponibles > 0 && (
          <View style={[styles.badge, { backgroundColor: categoryColor }]}>
            <Ionicons name="people" size={10} color="#FFFFFF" />
          </View>
        )}

        {/* Punta del pin */}
        <View style={[styles.pinTip, { borderTopColor: categoryColor }]} />
      </Animated.View>

      {/* Callout */}
      <Callout
        tooltip
        onPress={() => {
          router.push(`/(drawer)/(tabs)/opportunities/${oportunidad.id}`);
        }}
      >
        <View style={styles.calloutContainer}>
          {/* Imagen de portada */}
          {oportunidad.cover && (
            <Image
              source={{ uri: oportunidad.cover }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}

          {/* Contenido */}
          <View style={styles.calloutContent}>
            {/* Badge de categoría */}
            <CategoriaBadge categoria={oportunidad.categoria} size="small" />

            {/* Título */}
            <Text style={styles.calloutTitle} numberOfLines={2}>
              {oportunidad.titulo}
            </Text>

            {/* Organización */}
            <View style={styles.calloutRow}>
              <Ionicons name="business" size={14} color="#8E8E93" />
              <Text style={styles.calloutOrganizacion} numberOfLines={1}>
                {oportunidad.organizacion}
              </Text>
            </View>

            {/* Distancia */}
            {distanciaFormateada && (
              <View style={styles.calloutRow}>
                <Ionicons name="navigate" size={14} color="#007AFF" />
                <Text style={styles.calloutDistancia}>{distanciaFormateada}</Text>
              </View>
            )}

            {/* Cupos disponibles */}
            <View style={styles.calloutRow}>
              <Ionicons name="people" size={14} color="#34C759" />
              <Text style={styles.calloutCupos}>
                {oportunidad.cuposDisponibles} cupos disponibles
              </Text>
            </View>

            {/* Botón */}
            <TouchableOpacity
              style={[styles.calloutButton, { backgroundColor: categoryColor }]}
              activeOpacity={0.8}
            >
              <Text style={styles.calloutButtonText}>Ver Detalle</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinTip: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  fullOpacity: {
    opacity: 0.5,
  },
  // Estilos del Callout
  calloutContainer: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  coverImage: {
    width: '100%',
    height: 140,
  },
  calloutContent: {
    padding: 12,
    gap: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calloutOrganizacion: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  calloutDistancia: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  calloutCupos: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  calloutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  calloutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
