import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { useOportunidadDetail } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';
import { CategoriaBadge } from '../oportunidades/CategoriaBadge';
import { StatusBadge } from '../oportunidades/StatusBadge';

const { width: screenWidth } = Dimensions.get('window');

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalContent: {
      paddingBottom: 24,
    },
    coverImage: {
      width: '100%',
      height: 220,
      backgroundColor: colors.muted + '20',
    },
    detailSection: {
      padding: 20,
    },
    titleSection: {
      marginBottom: 16,
    },
    oportunidadTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    organizationText: {
      fontSize: 16,
      color: colors.subtitle,
      fontWeight: '500',
      marginBottom: 12,
    },
    badgesRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    infoRowLast: {
      marginBottom: 0,
    },
    infoIcon: {
      marginRight: 12,
      width: 20,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    infoText: {
      fontSize: 14,
      color: colors.subtitle,
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    descriptionText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 16,
    },
    habilidadesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    habilidadChip: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    habilidadText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '500',
    },
    loadingContainer: {
      padding: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.subtitle,
    },
    errorContainer: {
      padding: 40,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: colors.subtitle,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    cuposContainer: {
      backgroundColor: colors.primary + '10',
      padding: 12,
      borderRadius: 10,
      marginTop: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    cuposText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    mapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      justifyContent: 'center',
      marginTop: 16,
    },
    mapButtonText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '600',
      marginLeft: 8,
    },
    adminSection: {
      marginTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 24,
    },
    adminActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    adminButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    acceptButton: {
      backgroundColor: '#E8F5E9',
      borderColor: '#4CAF50',
    },
    rejectButton: {
      backgroundColor: '#FFEBEE',
      borderColor: '#F44336',
    },
    adminButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    contactButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

interface OportunidadDetailModalProps {
  visible: boolean;
  oportunidadId: string | null;
  onClose: () => void;
  isAdminView?: boolean;
}

export const OportunidadDetailModal: React.FC<OportunidadDetailModalProps> = ({
  visible,
  oportunidadId,
  onClose,
}) => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { oportunidad, loading, error } = useOportunidadDetail(oportunidadId || '');

  const formatDate = (date: any) => {
    if (!date) return 'No especificado';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      );
    }

    if (error || !oportunidad) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.subtitle} />
          <Text style={styles.errorText}>
            {error || 'No se pudo cargar la información de la oportunidad'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onClose}>
            <Text style={styles.retryButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        {oportunidad.cover && (
          <Image source={{ uri: oportunidad.cover }} style={styles.coverImage} resizeMode="cover" />
        )}

        {/* Detail Section */}
        <View style={styles.detailSection}>
          {/* Title and Organization */}
          <View style={styles.titleSection}>
            <Text style={styles.oportunidadTitle}>{oportunidad.titulo}</Text>
            <Text style={styles.organizationText}>{oportunidad.organizacion}</Text>

            {/* Badges */}
            <View style={styles.badgesRow}>
              <CategoriaBadge categoria={oportunidad.categoria} />
              <StatusBadge status={oportunidad.status} />
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={colors.primary} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoText}>
                  {oportunidad.campus} - {oportunidad.ciudad}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="desktop" size={20} color={colors.primary} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Modalidad</Text>
                <Text style={styles.infoText}>
                  {oportunidad.modalidad === 'presencial'
                    ? 'Presencial'
                    : oportunidad.modalidad === 'remoto'
                    ? 'Remoto'
                    : 'Híbrido'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={colors.primary} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Horas por semana</Text>
                <Text style={styles.infoText}>{oportunidad.horasSemana} horas</Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Ionicons name="calendar" size={20} color={colors.primary} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Fecha límite</Text>
                <Text style={styles.infoText}>{formatDate(oportunidad.deadline)}</Text>
              </View>
            </View>

            {/* Cupos */}
            <View style={styles.cuposContainer}>
              <Text style={styles.cuposText}>
                📊 Cupos disponibles: {oportunidad.cuposDisponibles} de {oportunidad.cupos}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{oportunidad.descripcion}</Text>

          {/* Habilidades */}
          {oportunidad.habilidades && oportunidad.habilidades.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Habilidades requeridas</Text>
              <View style={styles.habilidadesContainer}>
                {oportunidad.habilidades.map((habilidad, index) => (
                  <View key={index} style={styles.habilidadChip}>
                    <Text style={styles.habilidadText}>{habilidad}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Map Button if location exists */}
          {oportunidad.ubicacion && (
            <TouchableOpacity style={styles.mapButton}>
              <Ionicons name="map" size={20} color="#ffffff" />
              <Text style={styles.mapButtonText}>Abrir en mapa</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de la Oportunidad</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};
