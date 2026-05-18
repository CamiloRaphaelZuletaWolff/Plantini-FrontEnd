import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks';

interface EmbeddedMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  height?: number;
  onPress?: () => void;
  showExpandButton?: boolean;
}

export function EmbeddedMap({
  latitude,
  longitude,
  title,
  height = 180,
  onPress,
  showExpandButton = true,
}: EmbeddedMapProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? undefined : PROVIDER_GOOGLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        pointerEvents="none"
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={title}
        >
          <View style={styles.customMarker}>
            <Ionicons name="location" size={36} color="#FF3B30" />
          </View>
        </Marker>
      </MapView>

      {/* Botón para expandir el mapa */}
      {showExpandButton && onPress && (
        <TouchableOpacity
          style={[styles.expandButton, { backgroundColor: colors.surface }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Ionicons name="expand" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Overlay transparente para capturar taps */}
      {onPress && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onPress}
          activeOpacity={1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
