import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useHeaderHeight } from '@react-navigation/elements';
import { useThemeColors } from '../../../../src/hooks';
import type { ThemeColors } from '../../../../app/theme/colors';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { pickImage } from './AttachmentPicker';

const ChatScreen: React.FC<{ initialChatId?: string }> = ({ initialChatId }) => {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const styles = createStyles(colors);
  const { messages, isWriting, isLoading, error, sendMessage, cancel, clearError } =
    useChat(initialChatId);

  const [pendingSuggestion, setPendingSuggestion] = useState<string | undefined>();

  const handleSuggestion = useCallback((text: string) => {
    setPendingSuggestion(text);
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
      setPendingSuggestion(undefined);
    },
    [sendMessage],
  );

  const handleAttach = useCallback(async () => {
    const file = await pickImage();
    if (file) sendMessage('Adjunto imagen', [file]);
  }, [sendMessage]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.primary + '26', colors.primary + '10', colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.avatarRing}>
            <Image
              source={require('../../../../assets/Plantini/plantini.png')}
              style={styles.headerAvatar}
            />
            <View style={styles.statusDot} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Plantini</Text>
            <Text style={styles.headerSubtitle}>
              Asistente de VoluntariadoUPB · en línea
            </Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={styles.flex}>
          <MessageList
            messages={messages}
            isWriting={isWriting}
            onSuggestionPress={handleSuggestion}
          />
        </View>

        {isLoading && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.cancelWrap}>
            <TouchableOpacity
              style={styles.cancel}
              onPress={() => cancel()}
              accessibilityLabel="Cancelar respuesta"
              activeOpacity={0.85}
            >
              <Ionicons name="stop" size={14} color="#fff" />
              <Text style={styles.cancelText}>Detener respuesta</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <ChatInput
          onSend={handleSend}
          isSending={isLoading}
          error={error}
          onErrorDismiss={clearError}
          externalText={pendingSuggestion}
          onAttach={handleAttach}
        />
        <View style={{ height: insets.bottom, backgroundColor: colors.background }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    headerGradient: {
      paddingBottom: 14,
    },
    header: {
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
    headerAvatar: { width: 40, height: 40, borderRadius: 20 },
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
    headerText: { flex: 1 },
    headerTitle: {
      fontWeight: '800',
      color: colors.text,
      fontSize: 17,
      letterSpacing: -0.2,
    },
    headerSubtitle: {
      color: colors.subtitle,
      marginTop: 2,
      fontSize: 12,
    },
    cancelWrap: {
      alignItems: 'center',
      paddingBottom: 6,
    },
    cancel: {
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
    cancelText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  });

export default ChatScreen;
