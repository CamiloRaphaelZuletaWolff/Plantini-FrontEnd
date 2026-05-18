import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../../config/supabase';

// Foreground notification behaviour is configured once at the app root
// (see app/_layout.tsx). Keep it out of this file so the handler is not
// registered twice depending on import order.

export interface NotificationData {
  type: 'postulacion_status' | 'nueva_oportunidad' | 'recordatorio';
  oportunidadId?: string;
  postulacionId?: string;
  status?: string;
  [key: string]: any;
}

/**
 * Returns the Expo Project ID from app config. Push tokens cannot be
 * issued without it.
 */
function getExpoProjectId(): string | null {
  const extra = Constants.expoConfig?.extra ?? (Constants as any).manifest2?.extra ?? {};
  const projectId =
    extra?.eas?.projectId ??
    (Constants as any).easConfig?.projectId ??
    extra?.projectId ??
    null;
  return typeof projectId === 'string' && projectId.length > 0 ? projectId : null;
}

export class NotificationService {
  /**
   * Registra el dispositivo para recibir notificaciones push.
   */
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      // Push tokens are not supported in Expo Go since SDK 53 — they require
      // a development build.
      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        if (__DEV__) {
          console.log('Push notifications unavailable in Expo Go — use a dev build.');
        }
        return null;
      }

      // Only physical devices receive push tokens.
      if (!Device.isDevice) {
        if (__DEV__) console.warn('Push notifications require a physical device');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        if (__DEV__) console.warn('Notification permissions were not granted');
        return null;
      }

      const projectId = getExpoProjectId();
      if (!projectId) {
        if (__DEV__) {
          console.warn(
            'Expo Project ID is not configured. Add it to app.json under "extra.eas.projectId".'
          );
        }
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Notificaciones de VoluntariadoUPB',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#217868',
        });
      }

      return tokenData.data;
    } catch (err) {
      if (__DEV__) console.error('Error registering for push notifications:', err);
      return null;
    }
  }

  /**
   * Guarda el push token del usuario en Supabase (append-only, deduplicado).
   */
  static async savePushToken(userId: string, pushToken: string): Promise<void> {
    const { data: userData, error: readError } = await supabase
      .from('users')
      .select('push_tokens')
      .eq('id', userId)
      .maybeSingle();

    if (readError) {
      if (__DEV__) console.error('Error reading push tokens:', readError);
      throw readError;
    }

    const existingTokens: string[] = userData?.push_tokens ?? [];

    if (existingTokens.includes(pushToken)) return;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        push_tokens: [...existingTokens, pushToken],
        notifications_enabled: true,
        last_token_update: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      if (__DEV__) console.error('Error saving push token:', updateError);
      throw updateError;
    }
  }

  /**
   * Quita un push token específico del usuario (opt-out de este dispositivo).
   */
  static async removePushToken(userId: string, pushToken: string): Promise<void> {
    const { data, error: readError } = await supabase
      .from('users')
      .select('push_tokens')
      .eq('id', userId)
      .maybeSingle();

    if (readError) {
      if (__DEV__) console.error('Error reading push tokens:', readError);
      throw readError;
    }

    const existingTokens: string[] = data?.push_tokens ?? [];
    const updatedTokens = existingTokens.filter((token) => token !== pushToken);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        push_tokens: updatedTokens,
        notifications_enabled: updatedTokens.length > 0,
      })
      .eq('id', userId);

    if (updateError) {
      if (__DEV__) console.error('Error removing push token:', updateError);
      throw updateError;
    }
  }

  /**
   * Desactiva las notificaciones para el usuario.
   */
  static async disableNotifications(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ notifications_enabled: false, push_tokens: [] })
      .eq('id', userId);

    if (error) {
      if (__DEV__) console.error('Error disabling notifications:', error);
      throw error;
    }
  }

  /**
   * Reactiva las notificaciones y registra el token actual del dispositivo.
   */
  static async enableNotifications(userId: string): Promise<void> {
    const pushToken = await this.registerForPushNotifications();
    if (pushToken) {
      await this.savePushToken(userId, pushToken);
    }
  }

  /**
   * Programa una notificación local (útil para pruebas).
   */
  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    triggerSeconds: number = 1
  ): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger:
        triggerSeconds > 0
          ? {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: triggerSeconds,
              repeats: false,
            }
          : null,
    });
  }

  /**
   * Cancela todas las notificaciones programadas.
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      if (__DEV__) console.error('Error cancelling notifications:', err);
    }
  }

  static async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (err) {
      if (__DEV__) console.error('Error getting badge count:', err);
      return 0;
    }
  }

  static async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (err) {
      if (__DEV__) console.error('Error setting badge count:', err);
    }
  }

  static async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      if (__DEV__) console.error('Error checking notification permissions:', err);
      return false;
    }
  }
}
