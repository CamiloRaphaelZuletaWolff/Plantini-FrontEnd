import * as Notifications from 'expo-notifications';

// 🔧 SCRIPT DE DIAGNÓSTICO DE NOTIFICACIONES
// Corre esto para verificar que todo esté configurado correctamente

export async function diagnosticarNotificaciones() {
  console.log('\n🔍 === DIAGNÓSTICO DE NOTIFICACIONES ===\n');

  // 1. Verificar permisos
  console.log('📋 1. Verificando permisos...');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('   Estado actual:', existingStatus);
  
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    console.log('   ⚠️ Permisos no concedidos. Solicitando...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('   Nuevo estado:', finalStatus);
  }

  if (finalStatus !== 'granted') {
    console.log('   ❌ ERROR: No se obtuvieron permisos de notificación');
    return false;
  }
  console.log('   ✅ Permisos concedidos correctamente\n');

  // 2. Verificar modo DEV
  console.log('📋 2. Verificando modo desarrollo...');
  console.log('   __DEV__:', __DEV__);
  if (__DEV__) {
    console.log('   ✅ Modo desarrollo ACTIVO (notificaciones demo funcionarán)\n');
  } else {
    console.log('   ℹ️ Modo producción (notificaciones demo desactivadas)\n');
  }

  // 3. Probar notificación inmediata
  console.log('📋 3. Enviando notificación de prueba inmediata...');
  try {
    const id1 = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Inmediato',
        body: 'Si ves esto, las notificaciones funcionan',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
    console.log('   ✅ Notificación inmediata enviada. ID:', id1);
  } catch (error) {
    console.log('   ❌ ERROR enviando notificación inmediata:', error);
    return false;
  }

  // 4. Probar notificación programada
  console.log('\n📋 4. Programando notificación para 5 segundos...');
  try {
    const id2 = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Test Programado',
        body: 'Si ves esto después de 5 seg, las notificaciones programadas funcionan',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + 5000),
      },
    });
    console.log('   ✅ Notificación programada. ID:', id2);
    console.log('   ⏰ Espera 5 segundos...\n');
  } catch (error) {
    console.log('   ❌ ERROR programando notificación:', error);
    return false;
  }

  console.log('✅ === DIAGNÓSTICO COMPLETADO ===');
  console.log('Si viste 2 notificaciones (inmediata + 5 seg), todo funciona bien\n');
  
  return true;
}
