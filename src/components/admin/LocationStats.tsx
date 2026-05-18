import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks';

interface LocationStatsProps {
  withLocation: number;
  withoutLocation: number;
}

export const LocationStats: React.FC<LocationStatsProps> = ({
  withLocation,
  withoutLocation,
}) => {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Gestión de Ubicaciones</Text>
      <Text style={[styles.subtitle, { color: colors.subtitle }]}>
        {withLocation} con ubicación • {withoutLocation} sin ubicación
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
});
