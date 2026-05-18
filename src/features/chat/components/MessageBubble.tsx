import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { Message } from '../types/Message';
import { useThemeColors } from '../../../../src/hooks';
import type { ThemeColors } from '../../../../app/theme/colors';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);

  const isUser = message.role === 'user';
  const imageFiles = message.files?.filter((f) => f.type?.startsWith('image/')) ?? [];

  return (
    <View style={[styles.container, isUser ? styles.user : styles.model]}>
      {imageFiles.length > 0 && (
        <View style={styles.attachments}>
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
      {message.content.length > 0 && (
        <Text style={[styles.text, isUser ? styles.userText : styles.modelText]}>
          {message.content}
        </Text>
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginVertical: 6,
      padding: 12,
      maxWidth: '80%',
      borderRadius: 12,
    },
    user: {
      backgroundColor: colors.primary + '10',
      alignSelf: 'flex-end',
      borderTopRightRadius: 4,
    },
    model: {
      backgroundColor: colors.surface,
      alignSelf: 'flex-start',
      borderTopLeftRadius: 4,
    },
    text: {
      fontSize: 15,
      lineHeight: 20,
    },
    userText: { color: colors.primary },
    modelText: { color: colors.text },
    attachments: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 6,
    },
    image: {
      width: 160,
      height: 160,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
  });
