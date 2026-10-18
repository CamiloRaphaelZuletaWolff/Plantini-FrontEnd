import React, { useEffect, useMemo, useState } from 'react';
import { View, TextInput, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';
import type { ChatAttachment } from './types';
import { MAX_PROMPT_LENGTH } from './api/chatBotClient';

const MAX_ATTACHMENTS = 4;
const COUNTER_THRESHOLD = MAX_PROMPT_LENGTH - 500;

interface ChatComposerProps {
  onSend: (text: string, attachments?: ChatAttachment[]) => void;
  isStreaming?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
  /** Prefill text (e.g. tapped suggestion). */
  externalText?: string;
  /** Opens the image picker; returns the chosen attachment or null. */
  onPickImage: () => Promise<ChatAttachment | null>;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  isStreaming,
  error,
  onErrorDismiss,
  externalText,
  onPickImage,
}) => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [focused, setFocused] = useState(false);

  // Allow the parent to prefill the input (suggestion taps).
  useEffect(() => {
    if (externalText !== undefined && externalText !== text) setText(externalText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalText]);

  // Clearing the error as the user types gives a path forward after a failure.
  useEffect(() => {
    if (error && text.length > 0) onErrorDismiss?.();
  }, [text, error, onErrorDismiss]);

  const trimmed = text.trim();
  const canSend =
    !isStreaming &&
    (trimmed.length > 0 || attachments.length > 0) &&
    trimmed.length <= MAX_PROMPT_LENGTH;
  const canAttach = !isStreaming && attachments.length < MAX_ATTACHMENTS;

  const sendScale = useSharedValue(1);
  const sendStyle = useAnimatedStyle(() => ({ transform: [{ scale: sendScale.value }] }));

  const handleAttach = async () => {
    if (!canAttach) return;
    const file = await onPickImage();
    if (file) setAttachments((prev) => [...prev, file].slice(0, MAX_ATTACHMENTS));
  };

  const removeAttachment = (uri: string) =>
    setAttachments((prev) => prev.filter((a) => a.uri !== uri));

  const handleSend = () => {
    if (!canSend) return;
    sendScale.value = withSpring(0.82, { damping: 12, stiffness: 240 }, () => {
      sendScale.value = withSpring(1, { damping: 12, stiffness: 240 });
    });
    onSend(trimmed, attachments.length ? attachments : undefined);
    setText('');
    setAttachments([]);
  };

  const showCounter = text.length >= COUNTER_THRESHOLD;
  const remaining = MAX_PROMPT_LENGTH - text.length;

  return (
    <View>
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#fff" />
          <Text style={styles.errorText} numberOfLines={2}>
            {error}
          </Text>
          {onErrorDismiss ? (
            <Pressable onPress={onErrorDismiss} accessibilityLabel="Cerrar error" hitSlop={8}>
              <Ionicons name="close" size={16} color="#fff" />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {attachments.length > 0 ? (
        <View style={styles.previews}>
          {attachments.map((file) => (
            <View key={file.uri} style={styles.previewItem}>
              <Image source={{ uri: file.uri }} style={styles.previewImage} />
              <Pressable
                style={styles.previewRemove}
                onPress={() => removeAttachment(file.uri)}
                accessibilityLabel="Quitar imagen"
                hitSlop={6}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.container}>
        <View style={[styles.inputWrap, { borderColor: focused ? colors.primary : colors.border }]}>
          <Pressable
            onPress={handleAttach}
            style={styles.attach}
            accessibilityLabel="Adjuntar imagen"
            disabled={!canAttach}
            hitSlop={8}
          >
            <Ionicons name="image-outline" size={22} color={canAttach ? colors.primary : colors.muted} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={(v) => setText(v.slice(0, MAX_PROMPT_LENGTH))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={styles.input}
            placeholder="Pregúntale algo a Plantini..."
            placeholderTextColor={colors.muted}
            multiline
            editable={!isStreaming}
            maxLength={MAX_PROMPT_LENGTH}
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

      {showCounter ? (
        <Text style={[styles.counter, remaining < 100 && styles.counterWarn]}>
          {remaining} caracteres restantes
        </Text>
      ) : null}
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
    buttonDisabled: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },
    buttonPressed: { opacity: 0.85 },
    previews: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 14,
      paddingTop: 8,
    },
    previewItem: { width: 64, height: 64 },
    previewImage: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.surface },
    previewRemove: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#e74c3c',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
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
    errorText: { color: '#fff', fontSize: 13, flex: 1 },
    counter: { paddingHorizontal: 16, paddingBottom: 6, fontSize: 11, color: colors.muted, textAlign: 'right' },
    counterWarn: { color: '#e67e22', fontWeight: '600' },
  });
