import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { NotificationService, NotificationData } from '../../services/notificationService';
import { notificationScheduler } from '../../services/notificationScheduler';

export function useNotifications() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const appStateSubscription = useRef<{ remove: () => void } | null>(null);
  const appState = useRef(AppState.currentState);
  const mountedRef = useRef(true);

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as NotificationData;

      switch (data.type) {
        case 'postulacion_status':
          if (data.postulacionId) {
            router.push('/(drawer)/(tabs)/profile');
          }
          break;

        case 'nueva_oportunidad':
          if (data.oportunidadId) {
            router.push(`/(drawer)/(tabs)/opportunities/${data.oportunidadId}`);
          } else {
            router.push('/(drawer)/(tabs)/opportunities');
          }
          break;

        case 'recordatorio':
          if (data.oportunidadId) {
            router.push(`/(drawer)/(tabs)/opportunities/${data.oportunidadId}`);
          }
          break;

        default:
          router.push('/(drawer)/(tabs)');
      }
    },
    [router]
  );

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        NotificationService.setBadgeCount(0);
        if (user) {
          notificationScheduler.refreshReminders().catch((err) => {
            if (__DEV__) console.error('Error refreshing reminders:', err);
          });
        }
      }
      appState.current = nextAppState;
    },
    [user]
  );

  useEffect(() => {
    mountedRef.current = true;

    if (!user) {
      return () => {
        mountedRef.current = false;
      };
    }

    // Listeners are registered synchronously so cleanup is always reachable.
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (incoming) => {
        if (mountedRef.current) setNotification(incoming);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    appStateSubscription.current = AppState.addEventListener('change', handleAppStateChange);

    // Async setup (token + scheduler) runs in the background — it does not
    // gate cleanup.
    (async () => {
      try {
        const token = await NotificationService.registerForPushNotifications();
        if (token && mountedRef.current) {
          setExpoPushToken(token);
          await NotificationService.savePushToken(user.id, token);
        }

        await notificationScheduler.initialize(user.id);
      } catch (err) {
        if (__DEV__) console.error('Error setting up notifications:', err);
      }
    })();

    return () => {
      mountedRef.current = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
      appStateSubscription.current?.remove();
      notificationListener.current = null;
      responseListener.current = null;
      appStateSubscription.current = null;
      notificationScheduler.cleanup();
    };
  }, [user, handleNotificationResponse, handleAppStateChange]);

  const enableNotifications = async () => {
    if (!user) return;
    try {
      await NotificationService.enableNotifications(user.id);
      const token = await NotificationService.registerForPushNotifications();
      if (token && mountedRef.current) {
        setExpoPushToken(token);
      }
    } catch (err) {
      if (__DEV__) console.error('Error enabling notifications:', err);
      throw err;
    }
  };

  const disableNotifications = async () => {
    if (!user) return;
    try {
      await NotificationService.disableNotifications(user.id);
      if (mountedRef.current) setExpoPushToken(null);
    } catch (err) {
      if (__DEV__) console.error('Error disabling notifications:', err);
      throw err;
    }
  };

  const checkPermissions = async () => {
    return NotificationService.areNotificationsEnabled();
  };

  return {
    expoPushToken,
    notification,
    enableNotifications,
    disableNotifications,
    checkPermissions,
  };
}
