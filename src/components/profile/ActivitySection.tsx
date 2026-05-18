import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

interface Postulacion {
  id: string;
  titulo: string;
  status: string;
  applicationDate: Date;
}

interface ActivitySectionProps {
  postulaciones: Postulacion[];
  loading: boolean;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({ postulaciones, loading }) => {
  const { colors } = useThemeColors();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted':
        return { iconBg: '#B4FFB4', icon: 'checkmark-circle', badgeBg: '#4CAF50', label: 'Aceptado' };
      case 'rejected':
        return { iconBg: '#FFB4B4', icon: 'close-circle', badgeBg: '#FF6B6B', label: 'Rechazado' };
      default:
        return { iconBg: '#FFE4B4', icon: 'time', badgeBg: '#FFA726', label: 'Pendiente' };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Actividades</Text>
      
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : postulaciones.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={colors.subtitle} />
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>
            No tienes postulaciones aún
          </Text>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {postulaciones.slice(0, 5).map((postulacion) => {
            const statusConfig = getStatusConfig(postulacion.status);
            
            return (
              <View key={postulacion.id} style={[styles.card, { 
                backgroundColor: colors.surface,
                borderColor: colors.border 
              }]}>
                <View style={[styles.iconContainer, { backgroundColor: statusConfig.iconBg }]}>
                  <Ionicons name={statusConfig.icon as any} size={24} color="#fff" />
                </View>
                <View style={styles.content}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                    {postulacion.titulo}
                  </Text>
                  <Text style={[styles.date, { color: colors.subtitle }]}>
                    {postulacion.applicationDate.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: statusConfig.badgeBg }]}>
                  <Text style={styles.badgeText}>{statusConfig.label}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  loader: {
    marginVertical: 20,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
  scrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  card: {
    width: 260,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
