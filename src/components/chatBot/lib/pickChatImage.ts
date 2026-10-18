import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import type { ChatAttachment } from '../types';

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
  if (!ext) return 'image/jpeg';
  return MIME_BY_EXT[ext] ?? 'image/jpeg';
}

/**
 * Opens the image library and returns a single image attachment, or null if the
 * user cancels. Only images are accepted — the backend does understanding, not
 * generation, and rejects non-image types.
 */
export async function pickChatImage(): Promise<ChatAttachment | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) return null;
    const asset = result.assets?.[0];
    if (!asset?.uri) return null;

    const uri = asset.uri;
    const name = asset.fileName ?? uri.split('/').pop() ?? 'image.jpg';
    const mimeType = inferMime(uri, asset.mimeType ?? undefined);

    return { uri, name, mimeType, size: asset.fileSize };
  } catch (err) {
    if (__DEV__) console.error('[chatBot] pickChatImage failed:', err);
    Alert.alert('Error', 'No se pudo seleccionar la imagen');
    return null;
  }
}
