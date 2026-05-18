import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  useThemeColors,
  useOportunidades,
  useLocationManager,
} from '../../../src/hooks';
import { useRolePermissions } from '../../../src/hooks';
import { Oportunidad } from '../../../src/types';
import { ErrorModal, SuccessModal, ConfirmModal } from '../../../src/components';
import {
  SearchBar,
  LocationStats,
  OportunidadLocationCard,
  LocationMapModal,
} from '../../../src/components/admin';

export default function GestionUbicacionesScreen() {
  const { colors } = useThemeColors();
  const { oportunidades, loading } = useOportunidades();
  const { canManageOpportunities } = useRolePermissions();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Protección: redirigir si no es admin
  useEffect(() => {
    if (!canManageOpportunities()) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [canManageOpportunities]);

  // Hook para manejar la lógica de ubicaciones
  const locationManager = useLocationManager();

  // Filtrar y separar oportunidades
  const { filteredOportunidades, conUbicacion, sinUbicacion } = useMemo(() => {
    const filtered = oportunidades.filter(
      (op: Oportunidad) =>
        op.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.organizacion.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      filteredOportunidades: filtered,
      conUbicacion: filtered.filter((op) => op.ubicacion?.lat && op.ubicacion?.lng),
      sinUbicacion: filtered.filter((op) => !op.ubicacion?.lat || !op.ubicacion?.lng),
    };
  }, [oportunidades, searchQuery]);

  const renderOportunidadItem = ({ item }: { item: Oportunidad }) => {
    const hasLocation = !!(item.ubicacion?.lat && item.ubicacion?.lng);
    return (
      <OportunidadLocationCard
        oportunidad={item}
        hasLocation={hasLocation}
        onEdit={() => locationManager.handleOpenMap(item)}
        onDelete={hasLocation ? () => locationManager.handleRemoveLocation(item) : undefined}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando oportunidades...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LocationStats withLocation={conUbicacion.length} withoutLocation={sinUbicacion.length} />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <FlatList
        data={[...sinUbicacion, ...conUbicacion]}
        keyExtractor={(item) => item.id}
        renderItem={renderOportunidadItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No hay oportunidades
            </Text>
          </View>
        }
      />

      <LocationMapModal
        visible={locationManager.showMapModal}
        title={locationManager.selectedOportunidad?.titulo || ''}
        tempLocation={locationManager.tempLocation}
        saving={locationManager.saving}
        onClose={locationManager.handleCloseModal}
        onMapPress={locationManager.handleMapPress}
        onDireccionChange={locationManager.updateDireccion}
        onSave={locationManager.handleSaveLocation}
      />

      <ErrorModal
        visible={locationManager.showErrorModal}
        message={locationManager.errorMessage}
        onClose={() => locationManager.setShowErrorModal(false)}
      />

      <SuccessModal
        visible={locationManager.showSuccessModal}
        message={locationManager.successMessage}
        onClose={() => locationManager.setShowSuccessModal(false)}
      />

      <ConfirmModal
        visible={locationManager.showDeleteConfirm}
        title="Eliminar Ubicación"
        message={`¿Estás seguro de eliminar la ubicación de "${locationManager.oportunidadToDelete?.titulo}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={locationManager.handleConfirmDelete}
        onCancel={locationManager.handleCancelDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
