import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';

const DEFAULT_GOAL = 5;
// AsyncStorage key used as an offline cache so the value is available
// immediately on cold starts before the Supabase fetch resolves.
const CACHE_KEY = (userId: string) => `USER_MONTHLY_GOAL_${userId}`;

export const useUserGoal = () => {
  const { user } = useAuthStore();
  const [monthlyGoal, setMonthlyGoal] = useState<number>(DEFAULT_GOAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadGoal = async () => {
      // 1. Show the cached value instantly so the UI is never empty.
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY(user.id));
        if (cached !== null) setMonthlyGoal(parseInt(cached, 10));
      } catch {
        // Cache miss is fine — fall through to Supabase.
      }

      // 2. Fetch the authoritative value from Supabase.
      try {
        const { data, error } = await supabase
          .from('users')
          .select('monthly_goal')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data?.monthly_goal != null) {
          const goal = data.monthly_goal as number;
          setMonthlyGoal(goal);
          // Keep the cache in sync.
          await AsyncStorage.setItem(CACHE_KEY(user.id), goal.toString());
        }
      } catch (error) {
        console.error('Error loading monthly goal from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, [user?.id]);

  const updateMonthlyGoal = useCallback(
    async (newGoal: number) => {
      if (!user?.id) return false;

      // Optimistic update so the UI responds immediately.
      setMonthlyGoal(newGoal);

      try {
        const { error } = await supabase
          .from('users')
          .update({ monthly_goal: newGoal })
          .eq('id', user.id);

        if (error) throw error;

        // Persist to cache after a successful DB write.
        await AsyncStorage.setItem(CACHE_KEY(user.id), newGoal.toString());
        return true;
      } catch (error) {
        console.error('Error saving monthly goal to Supabase:', error);
        // Roll back the optimistic update on failure.
        setMonthlyGoal((prev) => prev);
        return false;
      }
    },
    [user?.id]
  );

  return {
    monthlyGoal,
    updateMonthlyGoal,
    loading,
  };
};
