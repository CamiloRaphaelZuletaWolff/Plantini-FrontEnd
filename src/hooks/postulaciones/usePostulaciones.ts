import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { supabase } from '../../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useRolePermissions } from '../auth/useRolePermissions';

// UI-facing shape for postulaciones rows joined with their oportunidad. This
// is intentionally distinct from the DB-shaped `Postulacion` in src/types —
// list/detail screens need the joined fields (titulo/organizacion/location)
// and Date objects.
//
// Status values here are a superset because we kept legacy 'pending' for
// rendering existing data; new inserts always use canonical PostulacionEstadoType.
export interface PostulacionItem {
  id: string;
  estudianteId: string;
  oportunidadId: string;
  titulo: string;
  organizacion: string;
  descripcion: string;
  location: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted' | 'submitted' | 'under_review';
  motivacion: string;
  disponibilidad: string;
  telefono?: string;
  applicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  estudianteNombre?: string;
  estudianteEmail?: string;
  estudianteFoto?: string;
}

type PostulacionRow = {
  id: string;
  estudiante_id: string;
  oportunidad_id: string;
  oportunidad_titulo: string;
  motivacion: string;
  disponibilidad: string;
  telefono?: string;
  estado: string;
  confirmado: boolean;
  created_at: string;
  updated_at: string;
  estudiante_nombre?: string;
  estudiante_email?: string;
  estudiante_avatar?: string;
  oportunidad?: {
    titulo: string;
    organizacion: string;
    descripcion: string;
    campus: string;
    ciudad: string;
  } | null;
};

function mapRow(row: PostulacionRow): PostulacionItem {
  const opp = row.oportunidad;
  return {
    id: row.id,
    estudianteId: row.estudiante_id,
    oportunidadId: row.oportunidad_id,
    titulo: opp?.titulo ?? row.oportunidad_titulo,
    organizacion: opp?.organizacion ?? '',
    descripcion: opp?.descripcion ?? '',
    location: opp ? `${opp.campus}, ${opp.ciudad}` : '',
    status: row.estado as PostulacionItem['status'],
    motivacion: row.motivacion,
    disponibilidad: row.disponibilidad,
    telefono: row.telefono,
    applicationDate: new Date(row.created_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    estudianteNombre: row.estudiante_nombre,
    estudianteEmail: row.estudiante_email,
    estudianteFoto: row.estudiante_avatar,
  };
}

export const usePostulaciones = () => {
  const { user } = useAuthStore();
  const { canViewAllApplications } = useRolePermissions();
  const canViewAll = canViewAllApplications();

  const [postulaciones, setPostulaciones] = useState<PostulacionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPostulaciones = useCallback(async () => {
    if (!user?.id) {
      if (mountedRef.current) {
        setPostulaciones([]);
        setLoading(false);
      }
      return;
    }

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      let q = supabase
        .from('postulaciones')
        .select(
          '*, oportunidad:oportunidades!oportunidad_id(titulo, organizacion, descripcion, campus, ciudad)'
        )
        .order('created_at', { ascending: false });

      if (!canViewAll) {
        q = q.eq('estudiante_id', user.id);
      }

      const { data, error: fetchError } = await q;
      if (fetchError) throw fetchError;

      if (!mountedRef.current) return;
      setPostulaciones((data as PostulacionRow[]).map(mapRow));
    } catch (err) {
      if (__DEV__) console.error('Error fetching postulaciones:', err);
      if (mountedRef.current) setError('Error al cargar las postulaciones');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [user?.id, canViewAll]);

  // The realtime callback always invokes the latest fetcher.
  const fetchRef = useRef(fetchPostulaciones);
  useEffect(() => {
    fetchRef.current = fetchPostulaciones;
  }, [fetchPostulaciones]);

  // Fetch whenever the user identity OR role permissions change. This fixes
  // the race where admins first see student-scoped data because `canViewAll`
  // resolved asynchronously from useRolePermissions.
  useEffect(() => {
    fetchPostulaciones();
  }, [fetchPostulaciones]);

  // Realtime subscription — stable channel name per (hook instance, user)
  // so Strict Mode's double-mount in dev doesn't leak channels.
  const channelId = useId();
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`postulaciones-${channelId}-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'postulaciones' },
        () => {
          fetchRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, channelId]);

  const refresh = async () => {
    if (!user?.id) return;
    if (mountedRef.current) setRefreshing(true);
    try {
      await fetchPostulaciones();
    } catch (err) {
      if (__DEV__) console.error('Error refreshing postulaciones:', err);
      if (mountedRef.current) setError('Error al actualizar');
    } finally {
      if (mountedRef.current) setRefreshing(false);
    }
  };

  const updatePostulacionStatus = async (
    postulacionId: string,
    newStatus: PostulacionItem['status']
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('postulaciones')
        .update({ estado: newStatus })
        .eq('id', postulacionId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      if (__DEV__) console.error('Error updating postulacion status:', err);
      return false;
    }
  };

  return {
    postulaciones,
    loading,
    error,
    refreshing,
    refresh,
    updatePostulacionStatus,
  };
};
