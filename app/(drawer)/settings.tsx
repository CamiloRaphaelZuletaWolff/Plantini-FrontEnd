import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, Text, View, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../src/hooks';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useNotifications } from '../../src/hooks';
import { useAuthStore } from '../../src/store/useAuthStore';
import type { ThemeColors } from '../theme/colors';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.subtitle,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    preferenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    preferenceLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    preferenceTextContainer: {
      flex: 1,
    },
    preferenceLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
      marginBottom: 4,
    },
    preferenceDescription: {
      fontSize: 13,
      color: colors.subtitle,
      lineHeight: 18,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    infoText: {
      fontSize: 14,
      color: colors.subtitle,
      lineHeight: 20,
    },
  });

const SettingsScreen = () => {
  const { theme, colors } = useThemeColors();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  const { user } = useAuthStore();
  const { enableNotifications, disableNotifications, checkPermissions } = useNotifications();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar estado inicial de las notificaciones
  useEffect(() => {
    const checkInitialStatus = async () => {
      const hasPermission = await checkPermissions();
      setNotificationsEnabled(hasPermission);
    };
    checkInitialStatus();
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (value) {
        // Activar notificaciones
        await enableNotifications();
        const hasPermission = await checkPermissions();
        
        if (hasPermission) {
          setNotificationsEnabled(true);
          Alert.alert(
            '✅ Notificaciones activadas',
            'Recibirás alertas sobre tus postulaciones y nuevas oportunidades.',
            [{ text: 'Entendido' }]
          );
        } else {
          Alert.alert(
            '⚠️ Permisos requeridos',
            'Para recibir notificaciones, debes habilitar los permisos en la configuración de tu dispositivo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Abrir Configuración', 
                onPress: () => {
                  // Abrir configuración del dispositivo
                  // Linking.openSettings(); // Descomentar para implementar
                }
              }
            ]
          );
        }
      } else {
        // Desactivar notificaciones
        await disableNotifications();
        setNotificationsEnabled(false);
        Alert.alert(
          'Notificaciones desactivadas',
          'Ya no recibirás alertas push. Puedes volver a activarlas en cualquier momento.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert(
        'Error',
        'No se pudo cambiar la configuración de notificaciones. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons 
                    name={theme === 'dark' ? 'moon' : 'sunny'} 
                    size={22} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.preferenceTextContainer}>
                  <Text style={styles.preferenceLabel}>Modo Oscuro</Text>
                  <Text style={styles.preferenceDescription}>
                    {theme === 'dark' 
                      ? 'Tema oscuro activado' 
                      : 'Tema claro activado'}
                  </Text>
                </View>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ 
                  false: colors.switchTrackOff, 
                  true: colors.switchTrackOn 
                }}
                thumbColor={colors.switchThumb}
                ios_backgroundColor={colors.switchTrackOff}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                💡 El modo oscuro reduce el brillo de la pantalla y ayuda a descansar 
                la vista, especialmente en ambientes con poca luz.
              </Text>
            </View>
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#10b98120' }]}>
                  <Ionicons 
                    name={notificationsEnabled ? "notifications" : "notifications-off"} 
                    size={22} 
                    color="#10b981" 
                  />
                </View>
                <View style={styles.preferenceTextContainer}>
                  <Text style={styles.preferenceLabel}>Notificaciones Push</Text>
                  <Text style={styles.preferenceDescription}>
                    {notificationsEnabled 
                      ? 'Recibirás alertas de tus postulaciones' 
                      : 'No recibirás notificaciones push'}
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                disabled={isLoading}
                trackColor={{ 
                  false: colors.switchTrackOff, 
                  true: colors.switchTrackOn 
                }}
                thumbColor={colors.switchThumb}
                ios_backgroundColor={colors.switchTrackOff}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                🔔 Recibirás notificaciones cuando:
              </Text>
              <Text style={[styles.infoText, { marginTop: 8, marginLeft: 16 }]}>
                • Tu postulación sea aceptada o rechazada{'\n'}
                • Se publiquen nuevas oportunidades{'\n'}
                • Se acerque el deadline de una oportunidad{'\n'}
                • Haya recordatorios de eventos
              </Text>
            </View>
          </View>
        </View>

        {/* Prueba de Notificaciones - Para Demostración */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pruebas (Solo Desarrollo)</Text>
            <View style={styles.card}>
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#8b5cf620' }]}>
                    <Ionicons name="flask" size={22} color="#8b5cf6" />
                  </View>
                  <View style={styles.preferenceTextContainer}>
                    <Text style={styles.preferenceLabel}>Probar Notificaciones</Text>
                    <Text style={styles.preferenceDescription}>
                      Envía notificaciones de prueba para demostración
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Privacidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidad y Seguridad</Text>
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#f5901720' }]}>
                  <Ionicons name="shield-checkmark" size={22} color="#f59e0b" />
                </View>
                <View style={styles.preferenceTextContainer}>
                  <Text style={styles.preferenceLabel}>Datos de Perfil</Text>
                  <Text style={styles.preferenceDescription}>
                    Gestiona tu información personal
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
            </View>
          </View>
        </View>

        {/* Información de la App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <View style={styles.card}>
            <View style={[styles.preferenceRow, { paddingVertical: 8 }]}>
              <Text style={styles.preferenceDescription}>Versión</Text>
              <Text style={[styles.preferenceLabel, { fontSize: 14 }]}>1.0.1</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={[styles.preferenceRow, { paddingVertical: 8 }]}>
              <Text style={styles.preferenceDescription}>Desarrollado por</Text>
              <Text style={[styles.preferenceLabel, { fontSize: 14 }]}>Camilo - Edwin - Fabian</Text>
            </View>
          </View>
        </View>

        {/* Espacio adicional al final */}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
