import { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Oportunidad } from '../../types';
import { mapOportunidad, OportunidadRow } from '../../utils/supabaseMappers';

export const useOportunidadDetail = (oportunidadId: string) => {
  const [oportunidad, setOportunidad] = useState<Oportunidad | null>(null);
  const [yaPostulado, setYaPostulado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const fetchOportunidad = async () => {
      if (!oportunidadId) {
        if (!cancelled) {
          setOportunidad(null);
          setLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        const { data, error: fetchError } = await supabase
          .from('oportunidades')
          .select('*')
          .eq('id', oportunidadId)
          .maybeSingle();

        if (cancelled) return;
        if (fetchError) throw fetchError;

        if (!data) {
          setError('Oportunidad no encontrada');
          setOportunidad(null);
          setYaPostulado(false);
          return;
        }

        setOportunidad(mapOportunidad(data as OportunidadRow));

        if (user?.id) {
          const { data: posts, error: postError } = await supabase
            .from('postulaciones')
            .select('id')
            .eq('oportunidad_id', oportunidadId)
            .eq('estudiante_id', user.id)
            .limit(1);

          if (cancelled) return;

          if (postError) {
            // Surface the failure so callers can show "estado de postulación
            // no disponible" instead of silently rendering "no aplicaste aún".
            if (__DEV__) console.error('Error checking postulacion status:', postError);
            setError('No pudimos verificar tu postulación. Inténtalo de nuevo.');
            setYaPostulado(false);
          } else {
            setYaPostulado((posts?.length ?? 0) > 0);
          }
        } else {
          setYaPostulado(false);
        }
      } catch (err) {
        if (cancelled) return;
        if (__DEV__) console.error('Error fetching oportunidad:', err);
        setError('Error al cargar la oportunidad');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOportunidad();

    return () => {
      cancelled = true;
    };
  }, [oportunidadId, user?.id]);

  return {
    oportunidad,
    yaPostulado,
    loading,
    error,
  };
};
