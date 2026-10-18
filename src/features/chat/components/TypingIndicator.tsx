import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useThemeColors } from '../../../../src/hooks';
import type { ThemeColors } from '../../../../app/theme/colors';

interface TypingIndicatorProps {
  visible: boolean;
}

const Dot: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 380, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 380, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 380 }),
          withTiming(0.35, { duration: 380 }),
        ),
        -1,
      ),
    );
  }, [delay, translateY, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible }) => {
  const { colors } = useThemeColors();
  if (!visible) return null;

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel="Plantini está escribiendo"
    >
      <View style={[styles.avatarWrap, { backgroundColor: colors.primary + '18' }]}>
        <Image
          source={require('../../../../assets/Plantini/plantini.png')}
          style={styles.avatar}
        />
      </View>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Dot delay={0} color={colors.primary} />
        <Dot delay={140} color={colors.primary} />
        <Dot delay={280} color={colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  avatarWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  bubble: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
