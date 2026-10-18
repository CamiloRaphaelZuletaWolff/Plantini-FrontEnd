import React, { useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';

const PLANTINI = require('../../../assets/Plantini/plantini.png');

/** Home-tab card that introduces Plantini and opens the chat. */
export const PlantiniHomeCard: React.FC = () => {
  const { colors } = useThemeColors();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card} accessible accessibilityLabel="Plantini">
      <Image source={PLANTINI} style={styles.avatar} />
      <View style={styles.body}>
        <Text style={styles.title}>Hola, soy Plantini</Text>
        <Text style={styles.subtitle}>
          Soy el asistente de VoluntariadoUPB. Resuelvo dudas sobre oportunidades,
          postulaciones, perfiles y permisos dentro de la app.
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => router.push('/(drawer)/chat')}
        accessibilityRole="button"
        accessibilityLabel="Abrir chat con Plantini"
      >
        <Text style={styles.buttonText}>Abrir chat</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginHorizontal: 24,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
    body: { flex: 1 },
    title: { fontWeight: '700', color: colors.text },
    subtitle: { color: colors.muted, marginTop: 4, fontSize: 13 },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    buttonPressed: { opacity: 0.85 },
    buttonText: { color: '#fff', fontWeight: '600' },
  });
