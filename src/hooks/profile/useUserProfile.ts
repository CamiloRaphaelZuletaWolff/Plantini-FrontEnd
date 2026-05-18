import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { User, UserProfileUpdate } from '../../types';
import { mapUser, UserRow } from '../../utils/supabaseMappers';
import { STORAGE_BUCKETS, useSupabaseStorage } from '../storage/useSupabaseStorage';

export const useUserProfile = () => {
  const { user: authUser } = useAuthStore();
  const { deleteImage } = useSupabaseStorage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    let cancelled = false;

    const fetchUserProfile = async () => {
      if (!authUser?.id) {
        if (!cancelled) setUser(null);
        return;
      }

      try {
        safeSet(setLoading, true);
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (cancelled) return;
        if (fetchError) throw fetchError;

        if (data) {
          safeSet(setUser, mapUser(data as UserRow));
        } else {
          // The DB trigger handle_new_user creates this row on signup. If we
          // get here the trigger didn't fire (older account predating it, or
          // a delete-then-relogin path). Surface the error rather than silently
          // upserting a default profile, which used to mask real schema issues.
          if (__DEV__) {
            console.warn(
              '[useUserProfile] No public.users row for authenticated user',
              authUser.id,
            );
          }
          safeSet(setError, 'Tu perfil no está disponible. Contacta a soporte.');
        }
      } catch (err) {
        if (cancelled) return;
        if (__DEV__) console.error('Error fetching user profile:', err);
        safeSet(setError, 'Error al cargar el perfil');
      } finally {
        if (!cancelled) safeSet(setLoading, false);
      }
    };

    fetchUserProfile();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  const updateProfile = async (updates: UserProfileUpdate) => {
    if (!authUser?.id) {
      safeSet(setError, 'Usuario no autenticado');
      return { success: false };
    }

    try {
      safeSet(setLoading, true);

      const dbUpdates: Record<string, unknown> = {};
      if (updates.nombre !== undefined) dbUpdates.nombre = updates.nombre;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.campus !== undefined) dbUpdates.campus = updates.campus;
      if (updates.carrera !== undefined) dbUpdates.carrera = updates.carrera;
      if (updates.semestre !== undefined) dbUpdates.semestre = updates.semestre;
      if (updates.telefono !== undefined) dbUpdates.telefono = updates.telefono;
      if (updates.intereses !== undefined) dbUpdates.intereses = updates.intereses;
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
      if (updates.avatarPath !== undefined) dbUpdates.avatar_path = updates.avatarPath;
      if (updates.backgroundImage !== undefined) dbUpdates.background_image = updates.backgroundImage;
      if (updates.backgroundImagePath !== undefined)
        dbUpdates.background_image_path = updates.backgroundImagePath;
      if (updates.monthlyGoal !== undefined) dbUpdates.monthly_goal = updates.monthlyGoal;

      const { error: updateError } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', authUser.id);

      if (updateError) throw updateError;

      if (mountedRef.current) {
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
      }
      safeSet(setLoading, false);
      return { success: true };
    } catch (err: any) {
      if (__DEV__) console.error('Error updating profile:', err);
      safeSet(setError, 'Error al actualizar el perfil');
      safeSet(setLoading, false);
      return { success: false, error: err?.message };
    }
  };

  // Optimistic toggle: update UI first, roll back on DB failure so the user
  // sees the real state, not the wishful one.
  const toggleFavorito = async (oportunidadId: string) => {
    if (!authUser?.id || !user) {
      safeSet(setError, 'Usuario no autenticado');
      return { success: false };
    }

    const previousFavoritos = user.favoritos || [];
    const isFavorito = previousFavoritos.includes(oportunidadId);
    const newFavoritos = isFavorito
      ? previousFavoritos.filter((fid) => fid !== oportunidadId)
      : [...previousFavoritos, oportunidadId];

    if (mountedRef.current) {
      setUser((prev) => (prev ? { ...prev, favoritos: newFavoritos } : null));
    }

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ favoritos: newFavoritos })
        .eq('id', authUser.id);

      if (updateError) throw updateError;
      return { success: true };
    } catch (err: any) {
      if (__DEV__) console.error('Error toggling favorito:', err);
      if (mountedRef.current) {
        setUser((prev) => (prev ? { ...prev, favoritos: previousFavoritos } : null));
        setError('Error al actualizar favoritos');
      }
      return { success: false, error: err?.message };
    }
  };

  const uploadAvatar = async (
    imageUrl: string,
    path: string,
  ): Promise<{ success: boolean; url?: string }> => {
    if (!authUser?.id) {
      safeSet(setError, 'Usuario no autenticado');
      return { success: false };
    }

    const previousPath = user?.avatarPath;
    const result = await updateProfile({ avatar: imageUrl, avatarPath: path });

    // Best-effort cleanup of the previous storage object after the row update
    // succeeds. If the new path is identical (upsert), do nothing.
    if (result.success && previousPath && previousPath !== path) {
      deleteImage(STORAGE_BUCKETS.PROFILE, previousPath);
    }

    return { success: result.success, url: result.success ? imageUrl : undefined };
  };

  return {
    user,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    toggleFavorito,
  };
};
