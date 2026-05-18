import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import type { ChatFile } from '../types/Message';

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

function inferMime(uri: string, fallback?: string): string {
  if (fallback) return fallback;
  const ext = uri.split('.').pop()?.toLowerCase();
  if (!ext) return 'application/octet-stream';
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

export async function pickImage(): Promise<ChatFile | null> {
  try {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (res.canceled) return null;
    const asset = res.assets?.[0];
    if (!asset?.uri) return null;

    const uri = asset.uri;
    const name = asset.fileName ?? uri.split('/').pop() ?? 'image.jpg';
    const mime = inferMime(uri, asset.mimeType);

    const lower = name.toLowerCase();
    const allowedExt = lower.endsWith('.jpg')
      || lower.endsWith('.jpeg')
      || lower.endsWith('.png')
      || lower.endsWith('.webp');

    if (!allowedExt && mime !== 'image/heic' && mime !== 'image/heif') {
      Alert.alert('Archivo no soportado', 'Se recomienda usar imágenes JPG, PNG o WEBP');
    }

    return { uri, name, type: mime, size: asset.fileSize };
  } catch (err) {
    if (__DEV__) console.error('Error picking image:', err);
    Alert.alert('Error', 'No se pudo seleccionar la imagen');
    return null;
  }
}
