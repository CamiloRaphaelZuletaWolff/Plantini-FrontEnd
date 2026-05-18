import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../../store/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Web Client ID — must match the one configured in Supabase Dashboard:
// Authentication → Providers → Google → Client ID
const GOOGLE_WEB_CLIENT_ID =
  '1087093435939-501g0of80oi61be9bg4u7jhnfmpfgjhv.apps.googleusercontent.com';

export const useGoogleSignIn = () => {
  const { signInWithGoogle, isLoading } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      void handleGoogleSignIn(id_token);
    } else if (response?.type === 'error' || response?.type === 'cancel') {
      setIsSigningIn(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle(idToken);
    } catch {
      // error is already set in the store — nothing extra to do here
    } finally {
      setIsSigningIn(false);
    }
  };

  const signIn = async () => {
    try {
      setIsSigningIn(true);
      await promptAsync();
    } catch {
      setIsSigningIn(false);
    }
  };

  return {
    signIn,
    isLoading: isLoading || isSigningIn,
    disabled: !request,
  };
};

