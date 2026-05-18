/**
 * Tests for useAuthStore. The supabase client is mocked at the module
 * boundary so the store can be exercised in plain Node without dragging in
 * React Native, AsyncStorage, or a real network round-trip.
 */

const signInWithPassword = jest.fn();
const signUp = jest.fn();
const signOut = jest.fn();
const signInWithIdToken = jest.fn();

jest.mock('../../../config/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
      signUp: (...args: unknown[]) => signUp(...args),
      signOut: (...args: unknown[]) => signOut(...args),
      signInWithIdToken: (...args: unknown[]) => signInWithIdToken(...args),
    },
  },
}));

import { useAuthStore } from '../useAuthStore';

const resetStore = () =>
  useAuthStore.setState({ user: null, isLoading: true, error: null });

describe('useAuthStore.signIn', () => {
  beforeEach(() => {
    resetStore();
    signInWithPassword.mockReset();
    signUp.mockReset();
    signOut.mockReset();
    signInWithIdToken.mockReset();
  });

  it('sets the user and clears error on success', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.co' };
    signInWithPassword.mockResolvedValue({
      data: { user: fakeUser, session: { access_token: 't' } },
      error: null,
    });

    await useAuthStore.getState().signIn('a@b.co', 'secret123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(fakeUser);
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('maps Supabase errors to Spanish and re-throws', async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(
      useAuthStore.getState().signIn('a@b.co', 'wrong'),
    ).rejects.toBeTruthy();

    const state = useAuthStore.getState();
    expect(state.error).toBe('Correo o contraseña incorrectos');
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('resets isLoading to false even when the underlying call throws', async () => {
    signInWithPassword.mockRejectedValue(new Error('network down'));

    await expect(
      useAuthStore.getState().signIn('a@b.co', 'secret'),
    ).rejects.toThrow('network down');

    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

describe('useAuthStore.signUp', () => {
  beforeEach(() => {
    resetStore();
    signUp.mockReset();
  });

  it('returns needsConfirmation=true when Supabase does not start a session', async () => {
    signUp.mockResolvedValue({
      data: { user: { id: 'u' }, session: null },
      error: null,
    });

    const result = await useAuthStore
      .getState()
      .signUp('new@user.co', 'password1');

    expect(result).toEqual({ needsConfirmation: true });
    // Without a session, the store must not consider the user signed in.
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('returns needsConfirmation=false and stores the user when a session is returned', async () => {
    const fakeUser = { id: 'u', email: 'new@user.co' };
    signUp.mockResolvedValue({
      data: { user: fakeUser, session: { access_token: 't' } },
      error: null,
    });

    const result = await useAuthStore
      .getState()
      .signUp('new@user.co', 'password1');

    expect(result).toEqual({ needsConfirmation: false });
    expect(useAuthStore.getState().user).toEqual(fakeUser);
  });
});
