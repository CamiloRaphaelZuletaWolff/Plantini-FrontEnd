import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { supabase } from '../../../config/supabase';
import { useOportunidadesStore } from '../../store/oportunidadesStore';
import { Oportunidad, OportunidadesFiltros } from '../../types';
import { mapOportunidad, OportunidadRow } from '../../utils/supabaseMappers';

const PAGE_SIZE = 50;

export const useOportunidades = () => {
  const {
    oportunidades,
    filtros,
    loading,
    error,
    setOportunidades,
    setLoading,
    setError,
  } = useOportunidadesStore();

  const [refreshing, setRefreshing] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchOportunidades = useCallback(async () => {
    if (mountedRef.current) setLoading(true);
    try {
      let query = supabase
        .from('oportunidades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      // All filters pushed to the server — the new GIN/trgm indexes on
      // title_lower and habilidades keep this cheap as the table grows.
      if (filtros.busqueda) {
        query = query.ilike('title_lower', `%${filtros.busqueda.toLowerCase()}%`);
      }
      if (filtros.campus.length > 0) {
        query = query.in('campus', filtros.campus);
      }
      if (filtros.categoria.length > 0) {
        query = query.in('categoria', filtros.categoria);
      }
      if (filtros.modalidad) {
        query = query.eq('modalidad', filtros.modalidad);
      }
      if (filtros.status.length > 0) {
        query = query.in('status', filtros.status);
      }
      if (filtros.habilidades.length > 0) {
        // `overlaps` translates to PostgreSQL's `&&` array operator, hits the
        // GIN index on habilidades.
        query = query.overlaps('habilidades', filtros.habilidades);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      if (!mountedRef.current) return;
      setOportunidades((data as OportunidadRow[]).map(mapOportunidad));
      setLoading(false);
    } catch (err) {
      if (__DEV__) console.error('Error fetching oportunidades:', err);
      if (mountedRef.current) {
        setError('Error al cargar las oportunidades');
        setLoading(false);
      }
    }
  }, [filtros, setLoading, setOportunidades, setError]);

  // Keep the ref pointing at the latest fetcher so the realtime callback
  // (created once) always invokes the up-to-date closure.
  const fetchRef = useRef(fetchOportunidades);
  useEffect(() => {
    fetchRef.current = fetchOportunidades;
  }, [fetchOportunidades]);

  // Re-fetch when any filter changes (now that filtering is server-side).
  useEffect(() => {
    fetchOportunidades();
  }, [fetchOportunidades]);

  // Realtime subscription — stable channel name per hook instance via useId
  // so Strict Mode's double-mount in dev doesn't leak channels behind us.
  const channelId = useId();
  useEffect(() => {
    const channel = supabase
      .channel(`oportunidades-${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'oportunidades' },
        () => {
          fetchRef.current();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const refresh = async () => {
    if (mountedRef.current) setRefreshing(true);
    try {
      await fetchOportunidades();
    } catch (err) {
      if (__DEV__) console.error('Error refreshing oportunidades:', err);
      if (mountedRef.current) setError('Error al actualizar');
    } finally {
      if (mountedRef.current) setRefreshing(false);
    }
  };

  return {
    oportunidades,
    loading,
    error,
    refreshing,
    refresh,
  };
};
