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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';
import type { PostulacionItem } from '../../hooks';

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
      shadowOffset: { width: 0, height: -4 },
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
    modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, flex: 1 },
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
    content: { padding: 20 },
    section: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
    value: { fontSize: 14, color: colors.subtitle },
    foto: { width: 72, height: 72, borderRadius: 36, marginRight: 12 },
    actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
    actionBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    accept: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#4CAF50' },
    reject: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#F44336' },
    waitlist: { backgroundColor: '#FFF4E6', borderWidth: 1, borderColor: '#FFA94D' },
    actionText: { fontSize: 14, fontWeight: '600' },
  });

interface Props {
  visible: boolean;
  postulacion: PostulacionItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'accepted' | 'rejected' | 'pending' | 'waitlisted') => Promise<void>;
}

export const AdminPostulacionModal: React.FC<Props> = ({ visible, postulacion, onClose, onUpdateStatus }) => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = React.useState(false);

  if (!postulacion) return null;

  const handleChangeStatus = async (status: 'accepted' | 'rejected' | 'pending' | 'waitlisted') => {
    if (!postulacion?.id) return;
    const getLabel = (s: string) => {
      switch (s) {
        case 'accepted': return 'Aceptada';
        case 'rejected': return 'Rechazada';
        case 'pending': return 'Pendiente';
        case 'waitlisted': return 'En lista de espera';
        default: return s;
      }
    };

    Alert.alert('Confirmar', `¿Deseas marcar la postulación como "${getLabel(status)}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí',
        onPress: async () => {
          setLoading(true);
          try {
            await onUpdateStatus(postulacion.id, status);
          } catch (err) {
            console.error('Error updating status from admin modal', err);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Administrar Postulación</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Postulante</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {postulacion.estudianteFoto ? (
                  <Image source={{ uri: postulacion.estudianteFoto }} style={styles.foto} />
                ) : (
                  <View style={[styles.foto, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="person" size={32} color={colors.subtitle} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.value}>{postulacion.estudianteNombre || 'Sin nombre'}</Text>
                  <Text style={[styles.value, { marginTop: 4 }]}>{postulacion.estudianteEmail || 'No disponible'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Motivación / Descripción</Text>
              <Text style={styles.value}>{postulacion.motivacion || 'No especificado'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Disponibilidad</Text>
              <Text style={styles.value}>{postulacion.disponibilidad || 'No especificado'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.value}>{postulacion.telefono || 'No disponible'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Estado actual</Text>
              <Text style={styles.value}>{postulacion.status === 'waitlisted' ? 'En lista de espera' : postulacion.status}</Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.accept]} disabled={loading} onPress={() => handleChangeStatus('accepted')}>
                {loading ? <ActivityIndicator /> : <Text style={[styles.actionText, { color: '#2E7D32' }]}>Aceptar</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.waitlist]} disabled={loading} onPress={() => handleChangeStatus('waitlisted')}>
                {loading ? <ActivityIndicator /> : <Text style={[styles.actionText, { color: '#FF922B' }]}>Lista de espera</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.reject]} disabled={loading} onPress={() => handleChangeStatus('rejected')}>
                {loading ? <ActivityIndicator /> : <Text style={[styles.actionText, { color: '#C62828' }]}>Rechazar</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AdminPostulacionModal;
