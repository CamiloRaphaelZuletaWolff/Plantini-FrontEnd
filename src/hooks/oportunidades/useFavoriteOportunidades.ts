import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../config/supabase';
import { Oportunidad } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { mapOportunidad, OportunidadRow } from '../../utils/supabaseMappers';

export const useFavoriteOportunidades = () => {
  const { user: authUser } = useAuthStore();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteOportunidades, setFavoriteOportunidades] = useState<Oportunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Subscribe to favorite IDs from the users table
  useEffect(() => {
    if (!authUser?.id) {
      setFavoriteIds([]);
      setFavoriteOportunidades([]);
      setLoading(false);
      return;
    }

    const fetchFavoriteIds = async () => {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('favoritos')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (fetchError) {
        if (__DEV__) console.error('Error fetching favorite ids:', fetchError);
        setError('No se pudieron cargar tus favoritos');
        return;
      }

      setFavoriteIds(data?.favoritos ?? []);
    };

    fetchFavoriteIds();

    const channel = supabase
      .channel(`user-favorites-${authUser.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${authUser.id}` },
        (payload) => {
          if (!mountedRef.current) return;
          setFavoriteIds((payload.new as { favoritos: string[] }).favoritos ?? []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser?.id]);

  // Fetch oportunidades for each favoriteId.
  // `favoriteIds` is a fresh array reference on every setState — using it as
  // the dep gives us correct re-fetch behaviour without the `.join(',')` hack.
  useEffect(() => {
    const fetchFavorites = async () => {
      if (favoriteIds.length === 0) {
        if (mountedRef.current) {
          setFavoriteOportunidades([]);
          setLoading(false);
        }
        return;
      }

      try {
        if (mountedRef.current) setLoading(true);

        const { data, error: fetchError } = await supabase
          .from('oportunidades')
          .select('*')
          .in('id', favoriteIds);

        if (fetchError) throw fetchError;

        if (mountedRef.current) {
          setFavoriteOportunidades((data as OportunidadRow[]).map(mapOportunidad));
          setError(null);
        }
      } catch (err) {
        if (__DEV__) console.error('Error fetching favorite oportunidades:', err);
        if (mountedRef.current) setError('Error al cargar tus favoritos');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchFavorites();
  }, [favoriteIds]);

  return {
    favoriteOportunidades,
    loading,
    error,
    count: favoriteOportunidades.length,
  };
};
