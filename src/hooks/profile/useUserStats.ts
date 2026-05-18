import { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export interface NextActivity {
  id: string;
  titulo: string;
  organizacion: string;
  fecha: Date;
  daysUntil: number;
}

export interface UserStats {
  completedActivities: number;
  monthlyGoal: number;
  nextActivity: NextActivity | null;
  loading: boolean;
  error: string | null;
}

export const useUserStats = (userMonthlyGoal?: number) => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats>({
    completedActivities: 0,
    monthlyGoal: userMonthlyGoal || 5,
    nextActivity: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.id) {
      setStats({
        completedActivities: 0,
        monthlyGoal: userMonthlyGoal || 5,
        nextActivity: null,
        loading: false,
        error: null,
      });
      return;
    }

    const fetchUserStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Count accepted applications this month
        const { data: postulaciones } = await supabase
          .from('postulaciones')
          .select('id, created_at')
          .eq('estudiante_id', user.id)
          .eq('estado', 'accepted')
          .gte('created_at', firstDayOfMonth);

        const completedActivities = postulaciones?.length ?? 0;

        // Find next open opportunity with a future deadline
        let nextActivity: NextActivity | null = null;

        try {
          const { data: oportunidades } = await supabase
            .from('oportunidades')
            .select('id, titulo, organizacion, deadline')
            .eq('status', 'open')
            .gt('deadline', now.toISOString())
            .order('deadline', { ascending: true })
            .limit(10);

          if (oportunidades && oportunidades.length > 0) {
            const closest = oportunidades[0];
            const deadline = new Date(closest.deadline);
            nextActivity = {
              id: closest.id,
              titulo: closest.titulo,
              organizacion: closest.organizacion,
              fecha: deadline,
              daysUntil: Math.ceil(
                (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              ),
            };
          }
        } catch (err) {
          console.error('Error fetching next activity:', err);
        }

        setStats({
          completedActivities,
          monthlyGoal: userMonthlyGoal || 5,
          nextActivity,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar estadísticas',
        }));
      }
    };

    fetchUserStats();
  }, [user?.id, userMonthlyGoal]);

  return stats;
};

