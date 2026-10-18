import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../../../src/hooks';
import type { ThemeColors } from '../../../../app/theme/colors';
import type { ChatFile } from '../types/Message';

const MAX_INPUT_LENGTH = 8000;
const COUNTER_THRESHOLD = MAX_INPUT_LENGTH - 500;

interface ChatInputProps {
  onSend: (text: string, files?: ChatFile[]) => void;
  isSending?: boolean;
  onAttach?: () => void;
  error?: string | null;
  onErrorDismiss?: () => void;
  externalText?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isSending,
  onAttach,
  error,
  onErrorDismiss,
  externalText,
}) => {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const { colors } = useThemeColors();
  const styles = createStyles(colors);

  // Allows parent (e.g. suggestion taps in EmptyState) to prefill the input.
  useEffect(() => {
    if (externalText !== undefined && externalText !== text) {
      setText(externalText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalText]);

  // Clearing the error when the user types again gives them a path forward
  // after a failed send without blocking input.
  useEffect(() => {
    if (error && text.length > 0) onErrorDismiss?.();
  }, [text, error, onErrorDismiss]);

  const trimmed = text.trim();
  const canSend = !isSending && trimmed.length > 0 && trimmed.length <= MAX_INPUT_LENGTH;

  const sendScale = useSharedValue(1);
  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const handleSend = () => {
    if (!canSend) return;
    sendScale.value = withSpring(0.82, { damping: 12, stiffness: 240 }, () => {
      sendScale.value = withSpring(1, { damping: 12, stiffness: 240 });
    });
    onSend(trimmed);
    setText('');
  };

  const showCounter = text.length >= COUNTER_THRESHOLD;
  const remaining = MAX_INPUT_LENGTH - text.length;

  return (
    <View>
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#fff" />
          <Text style={styles.errorText} numberOfLines={2}>
            {error}
          </Text>
          {onErrorDismiss && (
            <TouchableOpacity
              onPress={onErrorDismiss}
              accessibilityLabel="Cerrar error"
              hitSlop={8}
            >
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.container}>
        <View
          style={[
            styles.inputWrap,
            { borderColor: focused ? colors.primary : colors.border },
          ]}
        >
          {onAttach && (
            <TouchableOpacity
              onPress={onAttach}
              style={styles.attach}
              accessibilityLabel="Adjuntar imagen"
              disabled={isSending}
              hitSlop={8}
            >
              <Ionicons
                name="image-outline"
                size={22}
                color={isSending ? colors.muted : colors.primary}
              />
            </TouchableOpacity>
          )}
          <TextInput
            value={text}
            onChangeText={(v) => setText(v.slice(0, MAX_INPUT_LENGTH))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={styles.input}
            placeholder="Pregúntale algo a Plantini..."
            placeholderTextColor={colors.muted}
            multiline
            editable={!isSending}
            maxLength={MAX_INPUT_LENGTH}
          />
        </View>

        <Animated.View style={sendStyle}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              !canSend && styles.buttonDisabled,
              pressed && canSend && styles.buttonPressed,
            ]}
            onPress={handleSend}
            disabled={!canSend}
            accessibilityLabel="Enviar mensaje"
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </Pressable>
        </Animated.View>
      </View>

      {showCounter && (
        <Text style={[styles.counter, remaining < 100 && styles.counterWarn]}>
          {remaining} caracteres restantes
        </Text>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: colors.background,
      gap: 8,
    },
    inputWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1.5,
      paddingLeft: 4,
      paddingRight: 8,
    },
    attach: { padding: 8 },
    input: {
      flex: 1,
      minHeight: 36,
      maxHeight: 120,
      paddingHorizontal: 4,
      paddingVertical: 8,
      color: colors.text,
      fontSize: 15,
    },
    button: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.28,
      shadowRadius: 5,
      elevation: 4,
    },
    buttonDisabled: {
      opacity: 0.45,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e74c3c',
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
      marginHorizontal: 10,
      marginTop: 8,
      borderRadius: 12,
      shadowColor: '#e74c3c',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    errorText: {
      color: '#fff',
      fontSize: 13,
      flex: 1,
    },
    counter: {
      paddingHorizontal: 16,
      paddingBottom: 6,
      fontSize: 11,
      color: colors.muted,
      textAlign: 'right',
    },
    counterWarn: { color: '#e67e22', fontWeight: '600' },
  });
