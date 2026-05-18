import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { ImagePicker } from '../common/ImagePicker';
import { STORAGE_BUCKETS, STORAGE_FOLDERS } from '../../hooks/storage/useSupabaseStorage';
import { ProfileUpdateSuccessModal } from './ProfileUpdateSuccessModal';
import { CAMPUS_OPTIONS } from '../../types';
import type { User } from '../../types';

interface ProfileEditModalProps {
  visible: boolean;
  profile: User | null;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => Promise<{ success: boolean }>;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  profile,
  onClose,
  onSubmit,
}) => {
  const { colors } = useThemeColors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({
    nombre: '',
    bio: '',
    campus: '',
    carrera: '',
    semestre: 0,
    telefono: '',
    avatar: '',
    backgroundImage: '',
    intereses: [],
  });
  const [newInterest, setNewInterest] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && profile) {
      setEditForm({
        nombre: profile.nombre || '',
        bio: profile.bio || '',
        campus: profile.campus || '',
        carrera: profile.carrera || '',
        semestre: profile.semestre || 0,
        telefono: profile.telefono || '',
        avatar: profile.avatar || '',
        avatarPath: profile.avatarPath || '',
        backgroundImage: profile.backgroundImage || '',
        backgroundImagePath: profile.backgroundImagePath || '',
        intereses: profile.intereses || [],
      });
    }
  }, [visible, profile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!editForm.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (editForm.bio && editForm.bio.length > 300) {
      newErrors.bio = 'La biografía no puede exceder 300 caracteres';
    }
    
    if (editForm.telefono && !/^\+?\d{8,15}$/.test(editForm.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    onClose();
    setErrors({});
    setNewInterest('');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(editForm);
      if (result.success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelected = (url: string, path: string) => {
    setEditForm({ ...editForm, avatar: url, avatarPath: path });
  };

  const handleBackgroundImageSelected = (url: string, path: string) => {
    setEditForm({ ...editForm, backgroundImage: url, backgroundImagePath: path });
  };

  const handleAddInterest = () => {
    const trimmedInterest = newInterest.trim();
    if (trimmedInterest && !editForm.intereses?.includes(trimmedInterest)) {
      setEditForm({
        ...editForm,
        intereses: [...(editForm.intereses || []), trimmedInterest],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setEditForm({
      ...editForm,
      intereses: editForm.intereses?.filter((i) => i !== interest) || [],
    });
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <>
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Editar Perfil</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Background Image */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Imagen de Fondo</Text>
              <ImagePicker
                currentImageUri={editForm.backgroundImage}
                currentImagePath={editForm.backgroundImagePath}
                onImageSelected={handleBackgroundImageSelected}
                bucket={STORAGE_BUCKETS.PROFILE}
                folder={STORAGE_FOLDERS.BACKGROUNDS}
                size={120}
                aspectRatio={[16, 9]}
                shape="rectangle"
                quality={0.8}
              />
            </View>

            {/* Avatar */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Foto de Perfil</Text>
              <ImagePicker
                currentImageUri={editForm.avatar}
                currentImagePath={editForm.avatarPath}
                onImageSelected={handleImageSelected}
                bucket={STORAGE_BUCKETS.PROFILE}
                folder={STORAGE_FOLDERS.AVATARS}
                size={120}
                aspectRatio={[1, 1]}
                quality={0.8}
              />
            </View>

            {/* Nombre */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nombre Completo *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface,
                  borderColor: errors.nombre ? '#FF6B6B' : colors.border,
                  color: colors.text 
                }]}
                placeholder="Tu nombre completo"
                placeholderTextColor={colors.subtitle}
                value={editForm.nombre}
                onChangeText={(text) => {
                  setEditForm({ ...editForm, nombre: text });
                  clearError('nombre');
                }}
              />
              {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            </View>

            {/* Biografía */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Biografía</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: colors.surface,
                  borderColor: errors.bio ? '#FF6B6B' : colors.border,
                  color: colors.text 
                }]}
                placeholder="Cuéntanos sobre ti..."
                placeholderTextColor={colors.subtitle}
                multiline
                numberOfLines={4}
                value={editForm.bio}
                onChangeText={(text) => {
                  setEditForm({ ...editForm, bio: text });
                  clearError('bio');
                }}
                textAlignVertical="top"
                maxLength={300}
              />
              <View style={styles.textAreaFooter}>
                {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
                <Text style={[styles.charCount, { color: colors.subtitle }]}>
                  {editForm.bio?.length || 0}/300
                </Text>
              </View>
            </View>

            {/* Campus */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Campus</Text>
              <View style={styles.campusGrid}>
                {CAMPUS_OPTIONS.map((campus) => (
                  <TouchableOpacity
                    key={campus}
                    style={[styles.campusOption, {
                      backgroundColor: colors.surface,
                      borderColor: editForm.campus === campus ? colors.primary : colors.border,
                      borderWidth: editForm.campus === campus ? 2 : 1,
                    }]}
                    onPress={() => setEditForm({ ...editForm, campus })}
                  >
                    <Ionicons 
                      name="location" 
                      size={20} 
                      color={editForm.campus === campus ? colors.primary : colors.subtitle} 
                    />
                    <Text style={[styles.campusLabel, { 
                      color: editForm.campus === campus ? colors.text : colors.subtitle 
                    }]}>
                      {campus}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Carrera */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Carrera</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="Ej: Ingeniería de Sistemas"
                placeholderTextColor={colors.subtitle}
                value={editForm.carrera}
                onChangeText={(text) => setEditForm({ ...editForm, carrera: text })}
              />
            </View>

            {/* Semestre */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Semestre</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="Ej: 5"
                placeholderTextColor={colors.subtitle}
                keyboardType="numeric"
                value={editForm.semestre?.toString() || ''}
                onChangeText={(text) => setEditForm({ ...editForm, semestre: parseInt(text) || 0 })}
              />
            </View>

            {/* Teléfono */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Teléfono</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface,
                  borderColor: errors.telefono ? '#FF6B6B' : colors.border,
                  color: colors.text 
                }]}
                placeholder="+591 70000000"
                placeholderTextColor={colors.subtitle}
                keyboardType="phone-pad"
                value={editForm.telefono}
                onChangeText={(text) => {
                  setEditForm({ ...editForm, telefono: text });
                  clearError('telefono');
                }}
              />
              {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
            </View>

            {/* Intereses */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Áreas de Interés</Text>
              <View style={styles.interestInputContainer}>
                <TextInput
                  style={[styles.interestInput, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  placeholder="Agregar interés"
                  placeholderTextColor={colors.subtitle}
                  value={newInterest}
                  onChangeText={setNewInterest}
                  onSubmitEditing={handleAddInterest}
                />
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddInterest}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.interestsContainer}>
                {editForm.intereses?.map((interest, index) => (
                  <View 
                    key={index}
                    style={[styles.interestChip, { backgroundColor: colors.primary + '20' }]}
                  >
                    <Text style={[styles.interestChipText, { color: colors.primary }]}>
                      {interest}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveInterest(interest)}>
                      <Ionicons name="close-circle" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                isSubmitting && { opacity: 0.6 }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>

    <ProfileUpdateSuccessModal
      visible={showSuccessModal}
      onClose={handleSuccessModalClose}
    />
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 4,
  },
  campusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  campusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  campusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  interestInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  interestInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 48,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    minHeight: 36,
  },
  interestChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
