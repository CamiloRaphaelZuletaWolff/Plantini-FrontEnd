import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useThemeColors } from '../../hooks';

const PLANTINI = require('../../../assets/Plantini/plantini.png');

/** Floating action button that opens the chat; hidden while already on it. */
export const PlantiniFloatingButton: React.FC = () => {
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useThemeColors();

  if (segments.includes('chat')) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable
        onPress={() => router.push('/(drawer)/chat')}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Abrir Plantini"
      >
        <Image source={PLANTINI} style={styles.icon} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', right: 18, bottom: 22, zIndex: 50 },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  pressed: { opacity: 0.85 },
  icon: { width: 44, height: 44, borderRadius: 22 },
});
