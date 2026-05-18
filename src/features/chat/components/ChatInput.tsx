import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../../../src/hooks';
import type { ThemeColors } from '../../../../app/theme/colors';
import type { ChatFile } from '../types/Message';

const MAX_INPUT_LENGTH = 8000;

interface ChatInputProps {
  onSend: (text: string, files?: ChatFile[]) => void;
  isSending?: boolean;
  onAttach?: () => void;
  error?: string | null;
  onErrorDismiss?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isSending,
  onAttach,
  error,
  onErrorDismiss,
}) => {
  const [text, setText] = useState('');
  const { colors } = useThemeColors();
  const styles = createStyles(colors);

  // Clearing the error when the user types again gives them a path forward
  // after a failed send without blocking input.
  useEffect(() => {
    if (error && text.length > 0) onErrorDismiss?.();
  }, [text, error, onErrorDismiss]);

  const trimmed = text.trim();
  const canSend = !isSending && trimmed.length > 0 && trimmed.length <= MAX_INPUT_LENGTH;

  const handleSend = () => {
    if (!canSend) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>
            {error}
          </Text>
          {onErrorDismiss && (
            <TouchableOpacity onPress={onErrorDismiss} accessibilityLabel="Cerrar error">
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.container}>
        {onAttach && (
          <TouchableOpacity
            onPress={onAttach}
            style={styles.attach}
            accessibilityLabel="Adjuntar archivo"
            disabled={isSending}
          >
            <Ionicons name="image-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TextInput
          value={text}
          onChangeText={(v) => setText(v.slice(0, MAX_INPUT_LENGTH))}
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colors.muted}
          multiline
          editable={!isSending}
          maxLength={MAX_INPUT_LENGTH}
        />
        <TouchableOpacity
          style={[styles.button, !canSend && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityLabel="Enviar mensaje"
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    attach: { padding: 8, marginRight: 6 },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.surface,
      borderRadius: 20,
      color: colors.text,
    },
    button: {
      marginLeft: 8,
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#e74c3c',
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
    },
    errorText: {
      color: '#fff',
      fontSize: 13,
      flex: 1,
    },
  });
