import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { PostulacionFormData, Oportunidad } from '../../types';

export const usePostulacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSetLoading = (v: boolean) => {
    if (mountedRef.current) setLoading(v);
  };
  const safeSetError = (v: string | null) => {
    if (mountedRef.current) setError(v);
  };

  const crearPostulacion = async (
    oportunidad: Oportunidad,
    formData: PostulacionFormData
  ) => {
    if (!user) {
      safeSetError('Debes iniciar sesión para postularte');
      return { success: false };
    }

    try {
      safeSetLoading(true);
      safeSetError(null);

      const postulacionData = {
        estudiante_id: user.id,
        estudiante_nombre: user.user_metadata?.full_name || user.email || 'Usuario',
        estudiante_email: user.email,
        oportunidad_id: oportunidad.id,
        oportunidad_titulo: oportunidad.titulo,
        motivacion: formData.motivacion,
        disponibilidad: formData.disponibilidad,
        telefono: formData.telefono || '',
        estado: 'submitted',
        confirmado: false,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('postulaciones')
        .insert(postulacionData)
        .select('id')
        .single();

      if (insertError) {
        // DB trigger raises this when cupos_disponibles = 0
        if (insertError.message?.includes('no_cupos_disponibles')) {
          throw new Error('No hay cupos disponibles para esta oportunidad');
        }
        // Unique constraint: student already applied
        if (insertError.code === '23505') {
          throw new Error('Ya tienes una postulación activa para esta oportunidad');
        }
        throw insertError;
      }

      // cupos_disponibles is decremented atomically by the DB trigger
      // (trg_postulaciones_cupos) — no client-side update needed.

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Postulación Enviada',
          body: `Tu postulación a "${oportunidad.titulo}" fue enviada exitosamente. Te notificaremos cuando sea revisada.`,
          data: {
            type: 'postulacion_enviada',
            postulacionId: inserted.id,
            oportunidadId: oportunidad.id,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      safeSetLoading(false);
      return { success: true };
    } catch (err: any) {
      if (__DEV__) console.error('Error creating postulacion:', err);
      const message = err?.message || 'Error al crear la postulación';
      safeSetError(message);
      safeSetLoading(false);
      return { success: false, error: message };
    }
  };

  return {
    crearPostulacion,
    loading,
    error,
  };
};

