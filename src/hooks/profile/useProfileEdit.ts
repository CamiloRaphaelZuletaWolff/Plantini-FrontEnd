import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useUserProfile } from './useUserProfile';
import type { UserProfileUpdate } from '../../types';

export const useProfileEdit = () => {
  const { user, updateProfile } = useUserProfile();
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newInterest, setNewInterest] = useState('');
  
  const [editForm, setEditForm] = useState<UserProfileUpdate>({
    nombre: '',
    bio: '',
    campus: '',
    carrera: '',
    semestre: 0,
    telefono: '',
    avatar: '',
    avatarPath: '',
    intereses: [],
  });

  useEffect(() => {
    if (modalVisible && user) {
      setEditForm({
        nombre: user.nombre || '',
        bio: user.bio || '',
        campus: user.campus || '',
        carrera: user.carrera || '',
        semestre: user.semestre || 0,
        telefono: user.telefono || '',
        avatar: user.avatar || '',
        avatarPath: user.avatarPath || '',
        intereses: user.intereses || [],
      });
    }
  }, [modalVisible, user]);

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

  const handleOpenEditModal = () => {
    setModalVisible(true);
  };

  const handleCancelEdit = () => {
    setModalVisible(false);
    setErrors({});
    setNewInterest('');
  };

  const handleSubmitEdit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProfile(editForm);
      if (result.success) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setModalVisible(false);
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

  const handleImageSelected = async (url: string, path: string) => {
    setEditForm({
      ...editForm,
      avatar: url,
      avatarPath: path,
    });
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

  return {
    modalVisible,
    editForm,
    setEditForm,
    isSubmitting,
    errors,
    setErrors,
    newInterest,
    setNewInterest,
    handleOpenEditModal,
    handleCancelEdit,
    handleSubmitEdit,
    handleImageSelected,
    handleAddInterest,
    handleRemoveInterest,
  };
};
