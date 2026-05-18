import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePickerExpo from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import {
  STORAGE_BUCKETS,
  STORAGE_FOLDERS,
  type StorageBucket,
  type StorageFolder,
  useSupabaseStorage,
} from '../../hooks/storage/useSupabaseStorage';
import { ImagePickerModal } from './ImagePickerModal';
import { ImageUploadSuccessModal } from './ImageUploadSuccessModal';

interface ImagePickerProps {
  /** Public URL currently rendered. */
  currentImageUri?: string;
  /** Storage object path of the current image, used to delete it on replace. */
  currentImagePath?: string;
  /** Called with the new public URL and storage path after a successful upload. */
  onImageSelected: (publicUrl: string, path: string) => void;
  /** Which bucket the image belongs to. Defaults to profile-images. */
  bucket?: StorageBucket;
  /** Logical folder name within the bucket. */
  folder?: StorageFolder;
  aspectRatio?: [number, number];
  quality?: number;
  size?: number;
  shape?: 'circle' | 'rectangle';
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImageUri,
  currentImagePath,
  onImageSelected,
  bucket = STORAGE_BUCKETS.PROFILE,
  folder = STORAGE_FOLDERS.AVATARS,
  aspectRatio = [1, 1],
  quality = 0.8,
  size = 120,
  shape = 'circle',
}) => {
  const { colors } = useThemeColors();
  const { uploadImage, deleteImage, uploading } = useSupabaseStorage();
  const [localUri, setLocalUri] = useState<string | undefined>(currentImageUri);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const borderRadius = shape === 'circle' ? size / 2 : 12;

  const requestPermissions = async (type: 'camera' | 'library') => {
    const permission =
      type === 'camera'
        ? await ImagePickerExpo.requestCameraPermissionsAsync()
        : await ImagePickerExpo.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permisos requeridos',
        `Necesitamos acceso a tu ${type === 'camera' ? 'cámara' : 'galería'} para continuar.`,
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async (source: 'camera' | 'library') => {
    const ok = await requestPermissions(source);
    if (!ok) return;

    try {
      const result =
        source === 'camera'
          ? await ImagePickerExpo.launchCameraAsync({
              allowsEditing: true,
              aspect: aspectRatio,
              quality,
            })
          : await ImagePickerExpo.launchImageLibraryAsync({
              mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: aspectRatio,
              quality,
            });

      if (result.canceled || !result.assets[0]) return;

      const imageUri = result.assets[0].uri;
      setLocalUri(imageUri);

      const uploadResult = await uploadImage(imageUri, { bucket, folder });

      if (uploadResult.success && uploadResult.url && uploadResult.path) {
        // Best-effort delete of the previous object to avoid orphaning storage.
        if (currentImagePath && currentImagePath !== uploadResult.path) {
          deleteImage(bucket, currentImagePath);
        }
        onImageSelected(uploadResult.url, uploadResult.path);
        setLocalUri(uploadResult.url);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', uploadResult.error || 'No se pudo subir la imagen');
        setLocalUri(currentImageUri);
      }
    } catch (err) {
      if (__DEV__) console.error('Error picking image:', err);
      Alert.alert('Error', 'Hubo un problema al seleccionar la imagen');
      setLocalUri(currentImageUri);
    }
  };

  const displayUri = localUri || currentImageUri;

  return (
    <View style={styles.container}>
      <View style={[styles.imageWrapper, { width: size, height: size }]}>
        <TouchableOpacity
          style={[
            styles.imageContainer,
            { borderColor: colors.primary, width: size, height: size, borderRadius },
          ]}
          onPress={() => setShowModal(true)}
          disabled={uploading}
        >
          {displayUri ? (
            <Image source={{ uri: displayUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="image-outline" size={size * 0.5} color={colors.primary} />
            </View>
          )}

          {uploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cameraButton,
            {
              backgroundColor: colors.primary,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
            },
          ]}
          onPress={() => setShowModal(true)}
          disabled={uploading}
        >
          <Ionicons name="camera" size={size * 0.15} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.hint, { color: colors.subtitle }]}>
        Toca para cambiar la imagen
      </Text>

      <ImagePickerModal
        visible={showModal}
        title={folder === STORAGE_FOLDERS.BACKGROUNDS ? 'Imagen de Fondo' : 'Imagen'}
        onSelectGallery={() => {
          setShowModal(false);
          setTimeout(() => handlePickImage('library'), 300);
        }}
        onSelectCamera={() => {
          setShowModal(false);
          setTimeout(() => handlePickImage('camera'), 300);
        }}
        onCancel={() => setShowModal(false)}
      />

      <ImageUploadSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  imageWrapper: { position: 'relative' },
  imageContainer: { borderWidth: 4, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  hint: { fontSize: 13, textAlign: 'center' },
});
