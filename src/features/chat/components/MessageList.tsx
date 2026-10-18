import React, { useEffect, useRef } from 'react';
import { FlatList, View } from 'react-native';
import type { Message } from '../types/Message';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isWriting?: boolean;
  onSuggestionPress?: (text: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isWriting,
  onSuggestionPress,
}) => {
  const ref = useRef<FlatList<Message>>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const handle = setTimeout(() => {
      if (mountedRef.current) ref.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(handle);
  }, [messages.length, isWriting]);

  if (messages.length === 0) {
    return <EmptyState onSuggestionPress={onSuggestionPress} />;
  }

  // Only the last message in a consecutive bot-message streak shows the avatar,
  // so long streaming responses don't repeat the icon on every chunk.
  const showAvatarFor = (index: number): boolean => {
    const current = messages[index];
    if (current.role !== 'model') return false;
    const next = messages[index + 1];
    return !next || next.role !== 'model';
  };

  const lastIsUser = messages[messages.length - 1]?.role === 'user';

  return (
    <FlatList<Message>
      ref={ref}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <MessageBubble message={item} showAvatar={showAvatarFor(index)} />
      )}
      contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 }}
      ListFooterComponent={
        isWriting && lastIsUser ? (
          <View style={{ marginTop: 4 }}>
            <TypingIndicator visible />
          </View>
        ) : null
      }
      onContentSizeChange={() => {
        if (mountedRef.current) ref.current?.scrollToEnd({ animated: true });
      }}
    />
  );
};
