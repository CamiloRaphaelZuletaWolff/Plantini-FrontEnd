import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';

// Buckets must match the ones created in gemini-backend/sql/schema.sql.
export const STORAGE_BUCKETS = {
  PROFILE: 'profile-images',
  OPORTUNIDADES: 'oportunidad-covers',
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

// Logical folder names — purely cosmetic, used to organize objects within
// a bucket. Storage RLS keys off the first path segment (the user id) for
// the PROFILE bucket; see schema.sql storage policies.
export const STORAGE_FOLDERS = {
  AVATARS: 'avatars',
  BACKGROUNDS: 'backgrounds',
  COVERS: 'covers',
} as const;

export type StorageFolder = (typeof STORAGE_FOLDERS)[keyof typeof STORAGE_FOLDERS];

interface UploadOptions {
  bucket: StorageBucket;
  folder: StorageFolder;
  filename?: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

function inferMime(uri: string, headerType?: string | null): string {
  if (headerType && headerType !== 'application/octet-stream') return headerType;
  const ext = uri.split('.').pop()?.toLowerCase().split('?')[0];
  return (ext && MIME_BY_EXT[ext]) || 'image/jpeg';
}

export const useSupabaseStorage = () => {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSet = <T,>(setter: (v: T) => void, value: T) => {
    if (mountedRef.current) setter(value);
  };

  const uploadImage = async (
    uri: string,
    options: UploadOptions
  ): Promise<UploadResult> => {
    if (!user?.id) {
      const msg = 'Debes iniciar sesión para subir imágenes';
      safeSet(setError, msg);
      return { success: false, error: msg };
    }

    try {
      safeSet(setUploading, true);
      safeSet(setError, null);

      // React Native's Hermes runtime ships an incomplete Blob polyfill, so
      // `Response.blob()` either crashes ("Property 'blob' doesn't exist")
      // or returns an opaque object that supabase-js can't read. ArrayBuffer
      // is the supported path for RN per Supabase's own docs.
      const response = await fetch(uri);
      const headerType = response.headers.get('content-type');
      const arrayBuffer = await response.arrayBuffer();

      const mimeType = inferMime(uri, headerType);
      const extension = mimeType.split('/')[1] || 'jpg';
      const name =
        options.filename ||
        `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${extension}`;

      // Storage RLS in schema.sql requires the first path segment to be the
      // user id for profile-images. Keep the same shape for cover uploads so
      // we can audit ownership later.
      const path = `${user.id}/${options.folder}/${name}`;

      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(path, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(path);

      safeSet(setUploading, false);
      return { success: true, url: publicData.publicUrl, path };
    } catch (err: any) {
      if (__DEV__) console.error('Error uploading image:', err);
      const message = err?.message || 'Error al subir la imagen';
      safeSet(setError, message);
      safeSet(setUploading, false);
      return { success: false, error: message };
    }
  };

  const deleteImage = async (
    bucket: StorageBucket,
    path: string
  ): Promise<{ success: boolean }> => {
    if (!path) return { success: false };
    try {
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove([path]);
      if (removeError) throw removeError;
      return { success: true };
    } catch (err: any) {
      if (__DEV__) console.error('Error deleting image:', err);
      return { success: false };
    }
  };

  const getPublicUrl = (bucket: StorageBucket, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    uploadImage,
    deleteImage,
    getPublicUrl,
    uploading,
    error,
  };
};
