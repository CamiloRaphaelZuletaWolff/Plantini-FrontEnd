import React, { useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';

const PLANTINI = require('../../../assets/Plantini/plantini.png');

interface ChatHeaderProps {
  /** Optional "clear conversation" action shown as a trailing icon button. */
  onClear?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClear }) => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <LinearGradient
      colors={[colors.primary + '26', colors.primary + '10', colors.background]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.row}>
        <View style={styles.avatarRing}>
          <Image source={PLANTINI} style={styles.avatar} />
          <View style={styles.statusDot} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Plantini</Text>
          <Text style={styles.subtitle}>Asistente de VoluntariadoUPB · en línea</Text>
        </View>
        {onClear ? (
          <Pressable
            onPress={onClear}
            style={({ pressed }) => [styles.clear, pressed && styles.clearPressed]}
            accessibilityLabel="Limpiar conversación"
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={18} color={colors.subtitle} />
          </Pressable>
        ) : null}
      </View>
    </LinearGradient>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    gradient: { paddingBottom: 14 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 6,
    },
    avatarRing: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 4,
    },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    statusDot: {
      position: 'absolute',
      bottom: 1,
      right: 1,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4ade80',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    text: { flex: 1 },
    title: { fontWeight: '800', color: colors.text, fontSize: 17, letterSpacing: -0.2 },
    subtitle: { color: colors.subtitle, marginTop: 2, fontSize: 12 },
    clear: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    clearPressed: { opacity: 0.7 },
  });
