import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../src/hooks';
import type { ThemeColors } from '../theme/colors';
import { diagnosticarNotificaciones } from '../../src/utils/notificationDiagnostic';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.subtitle,
      marginBottom: 24,
    },
    testButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    testButtonSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    testButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
    },
    testButtonTextSecondary: {
      color: colors.text,
    },
    section: {
      marginTop: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    infoText: {
      fontSize: 14,
      color: colors.subtitle,
      lineHeight: 20,
    },
  });

export default function NotificationTestScreen() {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const sendTestNotification = async (type: string) => {
    try {
      let title = '';
      let body = '';
      let data: any = {};

      switch (type) {
        case 'aceptada':
          title = '✅ Postulación Aceptada';
          body = 'Tu postulación a "Reforestación Parque Central" ha sido aceptada. ¡Felicitaciones!';
          data = {
            type: 'postulacion_status',
            postulacionId: 'test-123',
            oportunidadId: 'oport-456',
            status: 'aceptada',
          };
          break;

        case 'rechazada':
          title = '❌ Postulación Rechazada';
          body = 'Lamentablemente tu postulación a "Ayuda Alimentaria" no fue aceptada.';
          data = {
            type: 'postulacion_status',
            postulacionId: 'test-124',
            oportunidadId: 'oport-457',
            status: 'rechazada',
          };
          break;

        case 'nueva':
          title = '🆕 Nueva Oportunidad de Voluntariado';
          body = 'Campaña de Limpieza - Medio Ambiente';
          data = {
            type: 'nueva_oportunidad',
            oportunidadId: 'oport-789',
          };
          break;

        case 'deadline':
          title = '⏰ Recordatorio: Deadline Mañana';
          body = 'La inscripción para "Jornada de Salud Comunitaria" cierra mañana';
          data = {
            type: 'recordatorio_deadline',
            oportunidadId: 'oport-321',
          };
          break;

        case 'inicio':
          title = '📅 Recordatorio: Actividad Hoy';
          body = 'Taller de Educación Ambiental comienza hoy a las 14:00';
          data = {
            type: 'recordatorio_inicio',
            oportunidadId: 'oport-654',
          };
          break;

        case 'completada':
          title = '🎉 Actividad Completada';
          body = '¡Has completado "Campaña de Reciclaje" exitosamente! Gracias por tu participación.';
          data = {
            type: 'postulacion_status',
            postulacionId: 'test-125',
            oportunidadId: 'oport-458',
            status: 'completada',
          };
          break;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Inmediata
      });

      Alert.alert('Notificación Enviada', `Se envió la notificación: "${title}"`);
    } catch (error) {
      console.error('Error enviando notificación:', error);
      Alert.alert('Error', 'No se pudo enviar la notificación de prueba');
    }
  };

  const sendScheduledNotification = async () => {
    try {
      const trigger = new Date(Date.now() + 10000); // 10 segundos

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Notificación Programada',
          body: 'Esta notificación fue programada hace 10 segundos',
          data: {
            type: 'test_scheduled',
          },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger,
        },
      });

      Alert.alert(
        'Notificación Programada',
        'Recibirás una notificación en 10 segundos',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error programando notificación:', error);
      Alert.alert('Error', 'No se pudo programar la notificación');
    }
  };

  const runDiagnostico = async () => {
    console.log('\n🔍 INICIANDO DIAGNÓSTICO...\n');
    const resultado = await diagnosticarNotificaciones();
    
    if (resultado) {
      Alert.alert(
        '✅ Diagnóstico Completo',
        'Revisa la consola para ver los detalles. Deberías haber recibido 2 notificaciones de prueba.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '❌ Diagnóstico Fallido',
        'Hubo problemas. Revisa la consola para más detalles.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Prueba de Notificaciones</Text>
        <Text style={styles.subtitle}>
          Usa estos botones para probar diferentes tipos de notificaciones en tu presentación
        </Text>

        {/* 🔍 BOTÓN DE DIAGNÓSTICO */}
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#FF6B6B' }]}
          onPress={runDiagnostico}
        >
          <Ionicons name="bug" size={24} color="#fff" />
          <Text style={styles.testButtonText}>🔍 DIAGNOSTICAR NOTIFICACIONES</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cambios de Estado</Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => sendTestNotification('aceptada')}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.testButtonText}>Postulación Aceptada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => sendTestNotification('rechazada')}
          >
            <Ionicons name="close-circle" size={24} color="#fff" />
            <Text style={styles.testButtonText}>Postulación Rechazada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => sendTestNotification('completada')}
          >
            <Ionicons name="trophy" size={24} color="#fff" />
            <Text style={styles.testButtonText}>Actividad Completada</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuevas Oportunidades</Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => sendTestNotification('nueva')}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.testButtonText}>Nueva Oportunidad</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recordatorios</Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => sendTestNotification('deadline')}
          >
            <Ionicons name="alarm" size={24} color="#fff" />
            <Text style={styles.testButtonText}>Recordatorio Deadline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => sendTestNotification('inicio')}
          >
            <Ionicons name="calendar" size={24} color="#fff" />
            <Text style={styles.testButtonText}>Recordatorio Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.testButtonSecondary]}
            onPress={sendScheduledNotification}
          >
            <Ionicons name="time" size={24} color={colors.primary} />
            <Text style={[styles.testButtonText, styles.testButtonTextSecondary]}>
              Programar en 10 seg
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 <Text style={{ fontWeight: '600' }}>Tip para tu presentación:</Text>
            {'\n\n'}
            1. Muestra esta pantalla de pruebas{'\n'}
            2. Presiona cualquier botón para enviar notificación{'\n'}
            3. Minimiza la app o deja que se vea en el banner{'\n'}
            4. Toca la notificación para demostrar la navegación
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
