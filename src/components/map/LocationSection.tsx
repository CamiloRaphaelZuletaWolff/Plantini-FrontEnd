import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Oportunidad } from '../../types';
import { useThemeColors } from '../../hooks';
import { useOportunidadLocation } from '../../hooks';
import { EmbeddedMap } from './EmbeddedMap';
import { NavigationButtons } from './NavigationButtons';

interface LocationSectionProps {
  oportunidad: Oportunidad;
  onMapPress?: () => void;
}

export function LocationSection({ oportunidad, onMapPress }: LocationSectionProps) {
  const { colors } = useThemeColors();
  const location = useOportunidadLocation(oportunidad);

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Ubicación
      </Text>

      {/* Dirección */}
      <View style={styles.addressContainer}>
        <Ionicons name="location" size={20} color={colors.primary} />
        <Text style={[styles.addressText, { color: colors.text }]}>
          {location.displayText}
        </Text>
      </View>

      {/* Mapa embebido */}
      {location.hasLocation && location.latitude && location.longitude && (
        <>
          <EmbeddedMap
            latitude={location.latitude}
            longitude={location.longitude}
            title={oportunidad.titulo}
            onPress={onMapPress}
          />

          {/* Botones de navegación */}
          <NavigationButtons
            oportunidadId={oportunidad.id}
            latitude={location.latitude}
            longitude={location.longitude}
            title={oportunidad.titulo}
          />
        </>
      )}

      {/* Mensaje cuando no hay ubicación precisa */}
      {!location.hasLocation && (
        <View style={[styles.noLocationContainer, { backgroundColor: `${colors.muted}20` }]}>
          <Ionicons name="information-circle" size={20} color={colors.muted} />
          <Text style={[styles.noLocationText, { color: colors.muted }]}>
            No hay ubicación precisa disponible para esta oportunidad
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  noLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
  },
  noLocationText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
