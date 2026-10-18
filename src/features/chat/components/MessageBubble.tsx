import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { Message } from '../types/Message';
import { useThemeColors } from '../../../../src/hooks';
import type { ThemeColors } from '../../../../app/theme/colors';
import { formatTime } from '../utils/formatTime';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = true,
}) => {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);

  const isUser = message.role === 'user';
  const imageFiles = message.files?.filter((f) => f.type?.startsWith('image/')) ?? [];
  const hasText = message.content.length > 0;

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={[styles.row, isUser ? styles.rowUser : styles.rowModel]}
    >
      {!isUser && (
        <View style={styles.avatarWrap}>
          {showAvatar ? (
            <View style={styles.avatarRing}>
              <Image
                source={require('../../../../assets/Plantini/plantini.png')}
                style={styles.avatar}
              />
            </View>
          ) : (
            <View style={styles.avatarSpacer} />
          )}
        </View>
      )}
      <View style={styles.column}>
        {imageFiles.length > 0 && (
          <View
            style={[
              styles.attachments,
              isUser ? styles.attachmentsUser : styles.attachmentsModel,
            ]}
          >
            {imageFiles.map((file) => (
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
              {message.content}
            </Text>
          </View>
        )}
        {(hasText || imageFiles.length > 0) && (
          <Text style={[styles.time, isUser ? styles.timeUser : styles.timeModel]}>
            {formatTime(message.timestamp)}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      marginVertical: 4,
      alignItems: 'flex-end',
    },
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
    bubble: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
    },
    user: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
      alignSelf: 'flex-end',
    },
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
    text: {
      fontSize: 15,
      lineHeight: 21,
    },
    userText: { color: '#ffffff' },
    modelText: { color: colors.text },
    attachments: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 6,
    },
    attachmentsUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
    attachmentsModel: { alignSelf: 'flex-start' },
    image: {
      width: 180,
      height: 180,
      borderRadius: 14,
      backgroundColor: colors.surface,
    },
    time: {
      fontSize: 10.5,
      marginTop: 4,
      color: colors.muted,
    },
    timeUser: { textAlign: 'right', marginRight: 6 },
    timeModel: { textAlign: 'left', marginLeft: 6 },
  });
