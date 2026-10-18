import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

/** "Stop response" pill shown while Plantini is streaming a reply. */
export const ChatStopButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <Animated.View entering={FadeIn.duration(200)} style={styles.wrap}>
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityLabel="Detener respuesta"
    >
      <Ionicons name="stop" size={14} color="#fff" />
      <Text style={styles.text}>Detener respuesta</Text>
    </Pressable>
  </Animated.View>
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingBottom: 6 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.32,
    shadowRadius: 5,
    elevation: 3,
  },
  pressed: { opacity: 0.85 },
  text: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
