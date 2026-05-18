import { useState } from 'react';
import { supabase } from '../../../config/supabase';

/**
 * Triggers Supabase password reset emails. Spanish-localized error mapping
 * lives here so screens stay presentational.
 */
export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendResetEmail = async (email: string): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      // Supabase intentionally returns success for unknown emails to prevent
      // user enumeration. We mirror that here.
      if (resetError) throw resetError;
      return { success: true };
    } catch (err: any) {
      const lower = (err?.message ?? '').toLowerCase();
      let message = 'Error al enviar el correo. Intenta de nuevo';
      if (lower.includes('invalid email') || lower.includes('invalid')) {
        message = 'Correo electrónico inválido';
      } else if (lower.includes('rate limit') || lower.includes('too many')) {
        message = 'Demasiados intentos. Intenta más tarde';
      }
      setError(message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { sendResetEmail, loading, error };
};
