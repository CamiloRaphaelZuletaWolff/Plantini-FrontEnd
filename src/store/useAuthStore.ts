import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/** Maps Supabase error messages to user-friendly Spanish strings. */
const mapAuthError = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('user already exists')) {
    return 'Este correo ya está registrado';
  }
  if (m.includes('invalid email')) {
    return 'Correo electrónico inválido';
  }
  if (m.includes('password') && (m.includes('characters') || m.includes('short'))) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Correo o contraseña incorrectos';
  }
  if (m.includes('email not confirmed')) {
    return 'Por favor confirma tu correo electrónico';
  }
  if (m.includes('disabled') || m.includes('banned')) {
    return 'Esta cuenta ha sido deshabilitada';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Demasiados intentos fallidos. Intenta más tarde';
  }
  return 'Ocurrió un error. Intenta de nuevo';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  // true = waiting for onAuthStateChange to fire on app start
  isLoading: true,
  error: null,

  signUp: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      const message = mapAuthError(error.message);
      set({ error: message });
      throw error;
    }
    // data.session is null when Supabase requires email confirmation.
    // In that case do NOT set the user — onAuthStateChange will do so once
    // the user clicks the confirmation link and a real session is created.
    if (data.session) {
      set({ user: data.user, error: null });
    }
    return { needsConfirmation: !data.session };
  },

  signIn: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const message = mapAuthError(error.message);
        set({ error: message, isLoading: false });
        throw error;
      }
      set({ user: data.user, error: null, isLoading: false });
    } catch (err) {
      // isLoading is already false on the supabase error path; cover network errors too.
      set({ isLoading: false });
      throw err;
    }
  },

  signInWithGoogle: async (idToken: string) => {
    set({ error: null, isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) {
        const message = mapAuthError(error.message);
        set({ error: message, isLoading: false });
        throw error;
      }
      set({ user: data.user, error: null, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ error: 'Error al cerrar sesión', isLoading: false });
      throw error;
    }
    set({ user: null, isLoading: false });
  },

  setUser: (user) => set({ user, isLoading: false }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

