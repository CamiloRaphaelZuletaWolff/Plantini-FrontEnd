import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { Oportunidad } from '../../types';
import { CategoriaBadge, StatusBadge } from '../index';

interface OportunidadLocationCardProps {
  oportunidad: Oportunidad;
  hasLocation: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}

export const OportunidadLocationCard: React.FC<OportunidadLocationCardProps> = ({
  oportunidad,
  hasLocation,
  onEdit,
  onDelete,
}) => {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CategoriaBadge categoria={oportunidad.categoria} size="small" />
          <StatusBadge status={oportunidad.status} size="small" />
        </View>
        <Ionicons
          name={hasLocation ? 'location' : 'location-outline'}
          size={24}
          color={hasLocation ? '#34C759' : colors.muted}
        />
      </View>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {oportunidad.titulo}
      </Text>

      <View style={styles.info}>
        <Ionicons name="business" size={14} color={colors.subtitle} />
        <Text style={[styles.subtitle, { color: colors.subtitle }]} numberOfLines={1}>
          {oportunidad.organizacion}
        </Text>
      </View>

      {hasLocation && oportunidad.ubicacion?.direccion && (
        <View style={styles.info}>
          <Ionicons name="navigate" size={14} color={colors.subtitle} />
          <Text style={[styles.subtitle, { color: colors.subtitle }]} numberOfLines={1}>
            {oportunidad.ubicacion.direccion}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={onEdit}
        >
          <Ionicons name={hasLocation ? 'pencil' : 'add-circle'} size={16} color="#FFFFFF" />
          <Text style={styles.editButtonText}>
            {hasLocation ? 'Editar' : 'Agregar'} Ubicación
          </Text>
        </TouchableOpacity>

        {hasLocation && onDelete && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: colors.border }]}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitle: {
    fontSize: 14,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
});
