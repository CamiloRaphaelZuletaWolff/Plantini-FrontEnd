import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../hooks';
import { CATEGORIAS } from '../../types';
import type { Oportunidad } from '../../types';

interface FavoritesSectionProps {
  favoriteOportunidades: Oportunidad[];
  favoritesCount: number;
  loading: boolean;
  onToggleFavorite: (id: string) => Promise<any>;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favoriteOportunidades,
  favoritesCount,
  loading,
  onToggleFavorite,
}) => {
  const { colors } = useThemeColors();
  const router = useRouter();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: '#4CAF50', label: 'Abierto' };
      case 'waitlist':
        return { bg: '#FF9800', label: 'Lista de espera' };
      case 'closed':
        return { bg: '#FF6B6B', label: 'Cerrado' };
      default:
        return { bg: '#9E9E9E', label: 'Finalizado' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Favoritos</Text>
        {favoritesCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.countText}>{favoritesCount}</Text>
          </View>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : favoriteOportunidades.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={48} color={colors.subtitle} />
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>
            No hay favoritos aún
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.muted }]}>
            Marca las oportunidades que te interesen para verlas aquí.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {favoriteOportunidades.map((oportunidad) => {
              const categoria = CATEGORIAS.find(c => c.key === oportunidad.categoria);
              const statusConfig = getStatusConfig(oportunidad.status);
              
              return (
                <TouchableOpacity
                  key={oportunidad.id}
                  style={[styles.card, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border 
                  }]}
                  onPress={() => router.push(`/opportunities/${oportunidad.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={[
                      styles.categoryBadge, 
                      { backgroundColor: categoria?.color || colors.primary }
                    ]}>
                      <Ionicons 
                        name={categoria?.icon as any || 'heart'} 
                        size={20} 
                        color="#fff" 
                      />
                    </View>
                    <TouchableOpacity
                      onPress={async (e) => {
                        if (e && typeof e.stopPropagation === 'function') {
                          e.stopPropagation();
                        }
                        await onToggleFavorite(oportunidad.id);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="heart" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                    {oportunidad.titulo}
                  </Text>
                  
                  <Text style={[styles.organization, { color: colors.subtitle }]} numberOfLines={1}>
                    {oportunidad.organizacion}
                  </Text>

                  <View style={styles.footer}>
                    <View style={styles.info}>
                      <Ionicons name="time-outline" size={14} color={colors.subtitle} />
                      <Text style={[styles.infoText, { color: colors.subtitle }]}>
                        {oportunidad.horasSemana}h/semana
                      </Text>
                    </View>
                    <View style={styles.info}>
                      <Ionicons name="location-outline" size={14} color={colors.subtitle} />
                      <Text style={[styles.infoText, { color: colors.subtitle }]}>
                        {oportunidad.campus}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={styles.statusText}>{statusConfig.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {favoriteOportunidades.length > 5 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/opportunities')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                Ver todos los favoritos
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  loader: {
    marginVertical: 20,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 13,
  },
  scrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  card: {
    width: 240,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    minHeight: 40,
  },
  organization: {
    fontSize: 13,
    marginBottom: 12,
  },
  footer: {
    gap: 6,
    marginBottom: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
