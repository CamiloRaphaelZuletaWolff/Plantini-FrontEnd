import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useThemeColors } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';
import { useChatBot } from './hooks/useChatBot';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { ChatStopButton } from './ChatStopButton';
import { pickChatImage } from './lib/pickChatImage';
import type { ChatAttachment } from './types';

interface ChatBotScreenProps {
  initialChatId?: string;
}

export default function ChatBotScreen({ initialChatId }: ChatBotScreenProps) {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { messages, isStreaming, error, sendMessage, cancel, clearError, clearChat } =
    useChatBot(initialChatId);

  const [pendingSuggestion, setPendingSuggestion] = useState<string | undefined>();

  const handleSuggestion = useCallback((text: string) => setPendingSuggestion(text), []);

  const handleSend = useCallback(
    (text: string, attachments?: ChatAttachment[]) => {
      sendMessage(text, attachments);
      setPendingSuggestion(undefined);
    },
    [sendMessage],
  );

  const handleClear = useCallback(() => {
    if (messages.length === 0) return;
    Alert.alert('Limpiar conversación', '¿Seguro que quieres borrar este chat?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => clearChat() },
    ]);
  }, [messages.length, clearChat]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChatHeader onClear={handleClear} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={styles.flex}>
          <ChatMessageList
            messages={messages}
            isStreaming={isStreaming}
            onSuggestionPress={handleSuggestion}
          />
        </View>

        {isStreaming ? <ChatStopButton onPress={cancel} /> : null}

        <ChatComposer
          onSend={handleSend}
          isStreaming={isStreaming}
          error={error}
          onErrorDismiss={clearError}
          externalText={pendingSuggestion}
          onPickImage={pickChatImage}
        />

        <View style={[styles.bottomSpacer, { height: insets.bottom }]} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    bottomSpacer: { backgroundColor: colors.background },
  });
