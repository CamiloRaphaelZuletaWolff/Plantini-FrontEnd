import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useThemeColors } from '../../hooks';
import { openNativeMaps } from '../../utils/mapHelpers';

interface NavigationButtonsProps {
  oportunidadId: string;
  latitude: number;
  longitude: number;
  title: string;
  showInAppRoute?: boolean;
}

export function NavigationButtons({
  oportunidadId,
  latitude,
  longitude,
  title,
  showInAppRoute = true,
}: NavigationButtonsProps) {
  const { colors } = useThemeColors();
  const router = useRouter();

  const handleComoLlegar = async () => {
    const success = await openNativeMaps(latitude, longitude, title);
    
    if (!success) {
      Alert.alert(
        'Error',
        'No se pudo abrir la aplicación de mapas. Verifica que tengas una app de mapas instalada.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVerRuta = () => {
    router.push(`/(drawer)/(tabs)/map/${oportunidadId}`);
  };

  return (
    <View style={styles.container}>
      {/* Botón principal: Cómo llegar */}
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleComoLlegar}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>Cómo llegar</Text>
      </TouchableOpacity>

      {/* Botón secundario: Ver ruta en app */}
      {showInAppRoute && (
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={handleVerRuta}
          activeOpacity={0.8}
        >
          <Ionicons name="map" size={20} color={colors.primary} />
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            Ver ruta en el mapa
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
