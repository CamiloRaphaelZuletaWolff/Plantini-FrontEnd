import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks';
import type { ThemeColors } from '../../../app/theme/colors';
import type { ChatMessage } from './types';
import { formatTime } from './lib/formatTime';

const PLANTINI = require('../../../assets/Plantini/plantini.png');

interface ChatMessageBubbleProps {
  message: ChatMessage;
  /** Whether to show Plantini's avatar (only the last in a model streak does). */
  showAvatar?: boolean;
}

function ChatMessageBubbleComponent({ message, showAvatar = true }: ChatMessageBubbleProps) {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isUser = message.role === 'user';
  const images = message.attachments?.filter((a) => a.mimeType.startsWith('image/')) ?? [];
  const hasText = message.text.length > 0;

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={[styles.row, isUser ? styles.rowUser : styles.rowModel]}
    >
      {!isUser && (
        <View style={styles.avatarWrap}>
          {showAvatar ? (
            <View style={styles.avatarRing}>
              <Image source={PLANTINI} style={styles.avatar} />
            </View>
          ) : (
            <View style={styles.avatarSpacer} />
          )}
        </View>
      )}

      <View style={styles.column}>
        {images.length > 0 && (
          <View style={[styles.attachments, isUser ? styles.attachmentsUser : styles.attachmentsModel]}>
            {images.map((file) => (
              <Image
                key={`${file.name}-${file.uri}`}
                source={{ uri: file.uri }}
                style={styles.image}
                resizeMode="cover"
                accessibilityLabel={file.name}
              />
            ))}
          </View>
        )}

        {hasText && (
          <View style={[styles.bubble, isUser ? styles.user : styles.model]}>
            <Text style={[styles.text, isUser ? styles.userText : styles.modelText]}>
              {message.text}
            </Text>
          </View>
        )}

        {(hasText || images.length > 0) && (
          <Text style={[styles.time, isUser ? styles.timeUser : styles.timeModel]}>
            {formatTime(message.createdAt)}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

/** Memoized so streaming updates only re-render the message being written. */
export const ChatMessageBubble = React.memo(ChatMessageBubbleComponent);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end' },
    rowUser: { justifyContent: 'flex-end' },
    rowModel: { justifyContent: 'flex-start' },
    column: { maxWidth: '78%' },
    avatarWrap: { marginRight: 6, marginBottom: 18 },
    avatarRing: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarSpacer: { width: 28, height: 28 },
    avatar: { width: 24, height: 24, borderRadius: 12 },
    bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
    user: { backgroundColor: colors.primary, borderBottomRightRadius: 4, alignSelf: 'flex-end' },
    model: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    text: { fontSize: 15, lineHeight: 21 },
    userText: { color: '#ffffff' },
    modelText: { color: colors.text },
    attachments: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
    attachmentsUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
    attachmentsModel: { alignSelf: 'flex-start' },
    image: { width: 180, height: 180, borderRadius: 14, backgroundColor: colors.surface },
    time: { fontSize: 10.5, marginTop: 4, color: colors.muted },
    timeUser: { textAlign: 'right', marginRight: 6 },
    timeModel: { textAlign: 'left', marginLeft: 6 },
  });
