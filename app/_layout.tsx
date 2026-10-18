import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/useAuthStore';
import { useNotifications } from '../src/hooks';
import { supabase } from '../config/supabase';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure foreground notification behaviour once at module level.
// Local/push notifications are native-only; skip on web.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

const RootStack = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(drawer)" />
    <Stack.Screen name="onboarding" />
  </Stack>
);

export default function RootLayout() {
  const setUser = useAuthStore((s) => s.setUser);

  useNotifications();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootStack />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
