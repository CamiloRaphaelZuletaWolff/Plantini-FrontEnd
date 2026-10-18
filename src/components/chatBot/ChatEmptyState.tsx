import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';

const PLANTINI = require('../../../assets/Plantini/plantini.png');

interface ChatEmptyStateProps {
  onSuggestionPress?: (text: string) => void;
}

const SUGGESTIONS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'search-outline', text: '¿Qué oportunidades de voluntariado están abiertas?' },
  { icon: 'paper-plane-outline', text: '¿Cómo me postulo a una oportunidad?' },
  { icon: 'person-circle-outline', text: '¿Cómo edito mi perfil?' },
  { icon: 'map-outline', text: '¿Dónde veo el mapa de actividades?' },
];

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSuggestionPress }) => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeIn.duration(450)} style={styles.heroWrap}>
        <LinearGradient colors={[colors.primary + '26', colors.primary + '08']} style={styles.haloOuter}>
          <View style={[styles.haloInner, { backgroundColor: colors.surface }]}>
            <Image source={PLANTINI} style={styles.avatar} />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(450)}>
        <Text style={styles.greeting}>Hola, soy Plantini</Text>
        <Text style={styles.subtitle}>
          Tu asistente para todo lo relacionado con voluntariados UPB.{'\n'}
          Pregúntame sobre oportunidades, postulaciones o tu perfil.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).duration(450)} style={styles.suggestionsWrap}>
        <Text style={styles.suggestionsTitle}>Prueba con</Text>
        {SUGGESTIONS.map((item, i) => (
          <Animated.View key={item.text} entering={FadeInDown.delay(260 + i * 60).duration(360)}>
            <Pressable
              style={({ pressed }) => [styles.suggestion, pressed && styles.suggestionPressed]}
              onPress={() => onSuggestionPress?.(item.text)}
              accessibilityRole="button"
              accessibilityLabel={item.text}
            >
              <View style={styles.suggestionIcon}>
                <Ionicons name={item.icon} size={16} color={colors.primary} />
              </View>
              <Text style={styles.suggestionText} numberOfLines={2}>
                {item.text}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={colors.muted} style={styles.suggestionArrow} />
            </Pressable>
          </Animated.View>
        ))}
      </Animated.View>
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 28,
    },
    heroWrap: { alignItems: 'center', marginBottom: 22 },
    haloOuter: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center' },
    haloInner: {
      width: 110,
      height: 110,
      borderRadius: 55,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 4,
    },
    avatar: { width: 92, height: 92, borderRadius: 46 },
    greeting: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', letterSpacing: -0.4 },
    subtitle: {
      color: colors.subtitle,
      fontSize: 14.5,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 21,
      maxWidth: 320,
    },
    suggestionsWrap: { marginTop: 32, width: '100%', maxWidth: 380 },
    suggestionsTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.muted,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      marginBottom: 12,
      marginLeft: 6,
    },
    suggestion: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 12,
    },
    suggestionPressed: { opacity: 0.7 },
    suggestionIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestionText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 19 },
    suggestionArrow: { marginLeft: 4 },
  });
