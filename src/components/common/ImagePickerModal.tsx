import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';

interface ImagePickerModalProps {
  visible: boolean;
  title?: string;
  onSelectGallery: () => void;
  onSelectCamera: () => void;
  onCancel: () => void;
}

const { width } = Dimensions.get('window');

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ 
  visible, 
  title = "Seleccionar imagen",
  onSelectGallery, 
  onSelectCamera, 
  onCancel 
}) => {
  const { colors } = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.content}>
            {/* Plantini Image */}
            <Image
              source={require('../../../assets/Plantini/plantiniCoqueto.png')}
              style={styles.plantiniImage}
              resizeMode="contain"
            />

            {/* Title */}
            <View style={styles.headerContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.subtitle }]}>
                Elige una opción
              </Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {/* Galería Option */}
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: colors.background }]}
                onPress={onSelectGallery}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="images" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  Elegir de Galería
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
              </TouchableOpacity>

              {/* Cámara Option */}
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: colors.background }]}
                onPress={onSelectCamera}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="camera" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  Tomar Foto
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: colors.subtitle }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  plantiniImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
