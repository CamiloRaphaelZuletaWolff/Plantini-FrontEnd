import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { useCardAnimation, useCardPressAnimation } from '../../hooks';
import { useSwipeActions } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';

interface PostulacionCardProps {
  item: any;
  index: number;
  onPress: () => void;
  isAdminView?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  enableSwipe?: boolean;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    secondaryButton: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.primary + '40',
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    secondaryButtonText: {
      color: colors.text,
    },
    swipeBackground: {
      position: 'absolute',
      top: 0,
      bottom: 16,
      width: 120,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    swipeBackgroundLeft: {
      right: 0,
    },
    swipeBackgroundRight: {
      left: 0,
    },
    swipeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
      marginTop: 4,
    },
  });

export const PostulacionCard: React.FC<PostulacionCardProps> = ({
  item,
  index,
  onPress,
  isAdminView = false,
  onApprove,
  onReject,
  enableSwipe = false,
}) => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  
  const cardAnimation = useCardAnimation(index);
  const { scale, onPressIn, onPressOut } = useCardPressAnimation();
  
  // Swipe gestures (solo para admin y status pending)
  const canSwipe = enableSwipe && isAdminView && item.status === 'pending';
  const swipeGesture = useSwipeActions(
    onReject, // swipe izquierda: rechazar
    onApprove, // swipe derecha: aprobar
    canSwipe
  );

  const formattedDate = item.applicationDate
    ? new Date(item.applicationDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Fecha no disponible';

  const isPending = (s: string) => s === 'submitted' || s === 'under_review';

  const getStatusBadgeStyle = (status: string) => {
    if (isPending(status))       return styles.statusBadgePending;
    if (status === 'accepted')   return styles.statusBadgeAccepted;
    if (status === 'rejected')   return styles.statusBadgeRejected;
    if (status === 'waitlisted') return styles.statusBadgeWaitlisted;
    return styles.statusBadgePending;
  };

  const getStatusTextStyle = (status: string) => {
    if (isPending(status))       return styles.statusTextPending;
    if (status === 'accepted')   return styles.statusTextAccepted;
    if (status === 'rejected')   return styles.statusTextRejected;
    if (status === 'waitlisted') return styles.statusTextWaitlisted;
    return styles.statusTextPending;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':    return 'Enviada';
      case 'under_review': return 'En revisión';
      case 'accepted':     return 'Aceptada';
      case 'rejected':     return 'Rechazada';
      case 'waitlisted':   return 'Lista de espera';
      default:             return status;
    }
  };

  return (
    <Animated.View style={[cardAnimation]}>
      <View style={{ position: 'relative' }}>
        {/* Fondos de swipe actions (solo para admin) */}
        {canSwipe && (
          <>
            {/* Acción derecha: Aprobar */}
            <Animated.View
              style={[
                styles.swipeBackground,
                styles.swipeBackgroundRight,
                {
                  backgroundColor: '#4CAF50',
                  opacity: swipeGesture.rightActionOpacity,
                },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: swipeGesture.rightActionScale }] }}>
                <Ionicons name="checkmark-circle" size={32} color="#fff" />
              </Animated.View>
              <Text style={styles.swipeText}>Aprobar</Text>
            </Animated.View>

            {/* Acción izquierda: Rechazar */}
            <Animated.View
              style={[
                styles.swipeBackground,
                styles.swipeBackgroundLeft,
                {
                  backgroundColor: '#F44336',
                  opacity: swipeGesture.leftActionOpacity,
                },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: swipeGesture.leftActionScale }] }}>
                <Ionicons name="close-circle" size={32} color="#fff" />
              </Animated.View>
              <Text style={styles.swipeText}>Rechazar</Text>
            </Animated.View>
          </>
        )}

        <Animated.View
          style={[
            canSwipe ? { transform: [{ translateX: swipeGesture.translateX }] } : {},
          ]}
          {...(canSwipe ? swipeGesture.panResponder : undefined)}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <View style={styles.applicationCard}>
          <View style={styles.applicationHeader}>
            <Text style={styles.applicationTitle}>{item.titulo}</Text>
            <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
              <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.applicationDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={16} color={colors.subtitle} style={styles.detailIcon} />
              <Text style={styles.detailText}>{item.organizacion}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={colors.subtitle} style={styles.detailIcon} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.subtitle} style={styles.detailIcon} />
              <Text style={styles.detailText}>Postulado: {formattedDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color={colors.subtitle} style={styles.detailIcon} />
              <Text style={styles.detailText} numberOfLines={2}>
                {item.descripcion}
              </Text>
            </View>
            {item.disponibilidad && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={colors.subtitle} style={styles.detailIcon} />
                <Text style={styles.detailText}>Disponibilidad: {item.disponibilidad}</Text>
              </View>
            )}
          </View>

          <View style={styles.applicationActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={onPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={1}
            >
              <Ionicons name="eye-outline" size={16} color={colors.text} />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                {isAdminView ? 'Administrar' : 'Ver Detalles'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};
