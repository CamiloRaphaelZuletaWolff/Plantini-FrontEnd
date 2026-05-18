import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

interface StatsCardProps {
  icon: string;
  value: number | string;
  label: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label }) => {
  const { colors } = useThemeColors();
  
  return (
    <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon as any} size={24} color={colors.primary} />
      <Text style={[styles.statsValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statsLabel, { color: colors.subtitle }]}>{label}</Text>
    </View>
  );
};

interface ProfileStatsProps {
  postulacionesCount: number;
  horasTotales: number;
  eventosProximos: number;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  postulacionesCount,
  horasTotales,
  eventosProximos,
}) => {
  return (
    <View style={styles.statsContainer}>
      <StatsCard
        icon="document-text"
        value={postulacionesCount}
        label="Postulaciones"
      />
      <StatsCard
        icon="time"
        value={horasTotales}
        label="Horas"
      />
      <StatsCard
        icon="calendar"
        value={eventosProximos}
        label="Próximos"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statsLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
