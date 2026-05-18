import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useThemeColors } from '../../../../src/hooks';

export const PlantiniFloatingButton: React.FC = () => {
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useThemeColors();
  const onChat = segments.includes('chat');

  if (onChat) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        onPress={() => router.push('/(drawer)/chat')}
        style={[styles.button, { backgroundColor: colors.primary }]}
        accessibilityLabel="Abrir Plantini"
      >
        <Image source={require('../../../../assets/Plantini/plantini.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', right: 18, bottom: 22, zIndex: 50 },
  button: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  icon: { width: 44, height: 44, borderRadius: 22 },
});
