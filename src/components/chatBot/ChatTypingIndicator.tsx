import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks';

const PLANTINI = require('../../../assets/Plantini/plantini.png');

/**
 * The backend runs on Render's free plan, which sleeps after 15 min idle and
 * takes ~30–60 s to wake up. If the first token hasn't arrived after this
 * long, explain the wait instead of leaving the user staring at three dots.
 */
const SLOW_RESPONSE_MS = 6000;

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
        withSequence(withTiming(1, { duration: 380 }), withTiming(0.35, { duration: 380 })),
        -1,
      ),
    );
  }, [delay, translateY, opacity]);

  // Animates only transform + opacity (GPU-friendly).
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
};

/** Three-dot "Plantini is typing" bubble. */
export const ChatTypingIndicator: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { colors } = useThemeColors();
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsSlow(false);
      return;
    }
    const timer = setTimeout(() => setIsSlow(true), SLOW_RESPONSE_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <View>
      <View style={styles.row} accessibilityRole="text" accessibilityLabel="Plantini está escribiendo">
        <View style={[styles.avatarWrap, { backgroundColor: colors.primary + '18' }]}>
          <Image source={PLANTINI} style={styles.avatar} />
        </View>
        <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Dot delay={0} color={colors.primary} />
          <Dot delay={140} color={colors.primary} />
          <Dot delay={280} color={colors.primary} />
        </View>
      </View>
      {isSlow ? (
        <Text
          style={[styles.slowHint, { color: colors.subtitle }]}
          accessibilityLiveRegion="polite"
        >
          Despertando el servidor gratuito, ~1 min…
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 4, paddingVertical: 6 },
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
  dot: { width: 7, height: 7, borderRadius: 4 },
  // Indented to line up with the bubble (avatar 28 + margin 6 + row padding 4).
  slowHint: { fontSize: 12, marginLeft: 38, marginTop: 2, fontStyle: 'italic' },
});
