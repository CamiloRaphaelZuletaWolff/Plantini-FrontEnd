import React, { useState, useMemo } from 'react';
import { Stack } from 'expo-router';
import { 
StyleSheet, 
Text, 
View, 
TouchableOpacity, 
ScrollView, 
FlatList,
RefreshControl,
ActivityIndicator,
Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors, useRolePermissions, usePostulaciones, type PostulacionItem } from '../../../../src/hooks';
import { OportunidadDetailModal, AdminPostulacionModal, PostulacionCard } from '../../../../src/components';
import type { ThemeColors } from '../../../theme/colors';

const createStyles = (colors: ThemeColors) =>
StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: colors.background,
    },
    scrollContent: {
    paddingBottom: 120,
    paddingTop: 8,
    },
    headerSection: {
    padding: 24,
    paddingBottom: 16,
    },
    headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    },
    headerSubtitle: {
    fontSize: 16,
    color: colors.subtitle,
    lineHeight: 22,
    },
    filtersSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    },
    filtersContainer: {
    flexDirection: 'row',
    gap: 12,
    },
    filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    },
    filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    },
    filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    },
    filterTextActive: {
    color: '#ffffff',
    },
    applicationsSection: {
    flex: 1,
    paddingHorizontal: 24,
    },
    applicationsList: {
    flex: 1,
    paddingHorizontal: 24,
    },
    applicationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    },
    applicationImageContainer: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: colors.muted + '20',
    },
    applicationImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    },
    applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    },
    applicationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
    },
    statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 85,
    alignItems: 'center',
    borderWidth: 1,
    },
    statusBadgePending: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFB300',
    },
    statusBadgeAccepted: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    },
    statusBadgeRejected: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    },
    statusBadgeWaitlisted: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FFA94D',
    },
    statusText: {
    fontSize: 12,
    fontWeight: '600',
    },
    statusTextPending: {
    color: '#E65100',
    fontWeight: '600',
    },
    statusTextAccepted: {
    color: '#2E7D32',
    fontWeight: '600',
    },
    statusTextRejected: {
    color: '#C62828',
    fontWeight: '600',
    },
    statusTextWaitlisted: {
    color: '#FF922B',
    fontWeight: '600',
    },
    applicationDetails: {
    marginBottom: 16,
    },
    detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    },
    detailIcon: {
    marginRight: 8,
    width: 16,
    },
    detailText: {
    fontSize: 14,
    color: colors.subtitle,
    flex: 1,
    },
    applicationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    },
    actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    },
    primaryButton: {
    backgroundColor: colors.primary,
    },
    secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary + '40',
    },
    buttonText: {
    fontSize: 14,
    fontWeight: '600',
    },
    primaryButtonText: {
    color: '#ffffff',
    },
    secondaryButtonText: {
    color: colors.text,
    },
    emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    },
    emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    },
    emptyIcon: {
    marginBottom: 0,
    },
    emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    },
    emptyDescription: {
    fontSize: 16,
    color: colors.subtitle,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    },
    emptyActionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    },
    emptyActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    },
    loadingText: {
    marginTop: 16,
    fontSize: 16,
    },
});

export default function ApplicationsScreen() {
  const { colors } = useThemeColors();
  const { canViewAllApplications } = useRolePermissions();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const isAdminView = canViewAllApplications();

  // Status filter — keyed by DB values.
  // 'pending' is a UI alias covering both 'submitted' and 'under_review'.
  type FilterKey = 'all' | 'pending' | 'accepted' | 'rejected' | 'waitlisted';
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [selectedPostulacion, setSelectedPostulacion] = useState<PostulacionItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { postulaciones, loading, refreshing, refresh, updatePostulacionStatus } = usePostulaciones();

  const isPending = (s: string) => s === 'submitted' || s === 'under_review';

  const filters: { key: FilterKey; title: string; count: number }[] = useMemo(() => [
    { key: 'all',        title: 'Todas',          count: postulaciones.length },
    { key: 'pending',    title: 'Pendientes',      count: postulaciones.filter(a => isPending(a.status)).length },
    { key: 'accepted',   title: 'Aceptadas',       count: postulaciones.filter(a => a.status === 'accepted').length },
    { key: 'rejected',   title: 'Rechazadas',      count: postulaciones.filter(a => a.status === 'rejected').length },
    { key: 'waitlisted', title: 'Lista de espera', count: postulaciones.filter(a => a.status === 'waitlisted').length },
  ], [postulaciones]);

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'all') return postulaciones;
    if (activeFilter === 'pending') return postulaciones.filter(a => isPending(a.status));
    return postulaciones.filter(a => a.status === activeFilter);
  }, [activeFilter, postulaciones]);

  const openModal = (postulacion: PostulacionItem) => {
    setSelectedPostulacion(postulacion);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPostulacion(null);
  };

  const renderApplicationCard = ({ item, index }: { item: PostulacionItem; index: number }) => {
    const handleApprove = async () => {
      const ok = await updatePostulacionStatus(item.id, 'accepted');
      if (ok) Alert.alert('✅ Aprobado', 'La postulación ha sido aprobada exitosamente');
    };
    const handleReject = async () => {
      const ok = await updatePostulacionStatus(item.id, 'rejected');
      if (ok) Alert.alert('❌ Rechazado', 'La postulación ha sido rechazada');
    };
    return (
      <PostulacionCard
        item={item}
        index={index}
        onPress={() => openModal(item)}
        isAdminView={isAdminView}
        enableSwipe={isAdminView}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="document-text-outline" size={48} color={colors.primary} style={styles.emptyIcon} />
      </View>
      <Text style={styles.emptyTitle}>No hay postulaciones</Text>
      <Text style={styles.emptyDescription}>
        {isAdminView
          ? 'No hay postulaciones registradas aún.'
          : 'Aún no has aplicado a ningún voluntariado.\nExplora las oportunidades disponibles.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: isAdminView ? 'Gestión de Postulaciones' : 'Mis Postulaciones' }} />

      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>
          {isAdminView ? 'Gestión de Postulaciones' : 'Mis Postulaciones'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isAdminView
            ? 'Administra todas las postulaciones de los estudiantes.'
            : 'Seguimiento de tus aplicaciones y su estado actual.'}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
                {filter.title} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading && postulaciones.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Cargando postulaciones...</Text>
        </View>
      ) : filteredApplications.length > 0 ? (
        <FlatList
          data={filteredApplications}
          renderItem={renderApplicationCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.applicationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
          }
        />
      ) : (
        <View style={styles.applicationsSection}>
          {renderEmptyState()}
        </View>
      )}

      {/* Modals */}
      {isAdminView ? (
        <AdminPostulacionModal
          visible={modalVisible}
          postulacion={selectedPostulacion}
          onClose={handleCloseModal}
          onUpdateStatus={async (id, status) => {
            const ok = await updatePostulacionStatus(id, status);
            if (ok) { refresh(); handleCloseModal(); }
          }}
        />
      ) : (
        <OportunidadDetailModal
          visible={modalVisible}
          oportunidadId={selectedPostulacion?.oportunidadId ?? null}
          onClose={handleCloseModal}
        />
      )}
    </View>
  );
}