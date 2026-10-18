import React, { useCallback, useEffect, useRef } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';
import type { ChatMessage } from './types';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatTypingIndicator } from './ChatTypingIndicator';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  onSuggestionPress?: (text: string) => void;
}

const keyExtractor = (item: ChatMessage) => item.id;

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isStreaming,
  onSuggestionPress,
}) => {
  const listRef = useRef<FlatList<ChatMessage>>(null);
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
      if (mountedRef.current) listRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(handle);
  }, [messages.length, isStreaming]);

  // Show the avatar only on the last message of a consecutive assistant streak,
  // so long streaming replies don't repeat the icon on every line.
  const renderItem = useCallback<ListRenderItem<ChatMessage>>(
    ({ item, index }) => {
      const next = messages[index + 1];
      const showAvatar = item.role === 'assistant' && (!next || next.role !== 'assistant');
      return <ChatMessageBubble message={item} showAvatar={showAvatar} />;
    },
    [messages],
  );

  if (messages.length === 0) {
    return <ChatEmptyState onSuggestionPress={onSuggestionPress} />;
  }

  const lastIsUser = messages[messages.length - 1]?.role === 'user';

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={listContentStyle}
      ListFooterComponent={
        isStreaming && lastIsUser ? (
          <View style={footerStyle}>
            <ChatTypingIndicator visible />
          </View>
        ) : null
      }
      onContentSizeChange={() => {
        if (mountedRef.current) listRef.current?.scrollToEnd({ animated: true });
      }}
      keyboardShouldPersistTaps="handled"
    />
  );
};

// Hoisted style objects (avoids re-allocating on every render).
const listContentStyle = { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 } as const;
const footerStyle = { marginTop: 4 } as const;
